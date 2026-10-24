// Checks a build against the Snapchat Web Lens upload rules, then zips it for My Lenses:
// https://developers.snap.com/web-lenses/requirements
//
// Usage: node scripts/package-lens.mjs [build folder]
// `npm run package` builds first, then runs this on dist/lens.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const MB = 1024 * 1024;
const MAX_ZIP = 8 * MB;
const MAX_INDEX = MB;

// tags the Lens sandbox blocks
const BLOCKED_TAGS = ['base', 'embed', 'iframe', 'object'];

// hosts that bundles only mention as text: XML namespaces, and the docs that engine and React
// error messages link to
const TEXT_HOSTS = ['www.w3.org', 'github.com', 'react.dev', 'api.playcanvas.com'];

const buildDir = path.resolve(process.argv[2] ?? 'dist/lens');
const { name = 'web-lens' } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const zipFile = path.join(path.dirname(buildDir), `${name.replace(/^@/, '').replace('/', '-')}.zip`);

if (!fs.existsSync(buildDir)) {
    console.error(`No build found at ${path.relative('.', buildDir)}. Run npm run package to build and package.`);
    process.exit(1);
}

const errors = [];
const warnings = [];

const formatSize = (bytes) => (bytes < MB ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / MB).toFixed(2)} MB`);

// every file in the build, as the forward-slash path it takes in the zip
const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(file) : [path.relative(buildDir, file).split(path.sep).join('/')];
    });
const all = walk(buildDir).sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

// source maps only add weight, so leave them out of the zip
const maps = all.filter((file) => file.endsWith('.map'));
const files = all.filter((file) => !file.endsWith('.map'));
if (maps.length) {
    warnings.push(
        `Left ${maps.length} source map(s) out of the zip. Set build.sourcemap to false to stop generating them`
    );
}

// the entry point
const indexSize = files.includes('index.html') ? fs.statSync(path.join(buildDir, 'index.html')).size : 0;
if (!indexSize) {
    errors.push('index.html must sit at the root of the build');
} else if (indexSize > MAX_INDEX) {
    errors.push(
        `index.html is ${formatSize(indexSize)}, over the 1 MB limit. Load the bundle from a file rather than inlining it`
    );
}

for (const file of files.filter((f) => f.startsWith('__snap/'))) {
    errors.push(`${file}: __snap/ is reserved for Snapchat, so rename the folder`);
}

// URLs in markup and styles: anything on another host is blocked, and a root-absolute path
// resolves against Snapchat's origin rather than the Lens, so the game loads a blank screen
const checkUrl = (file, url) => {
    if (/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url)) {
        errors.push(
            `${file}: loads ${url} from another host. A Lens can only load files from its own zip, so bundle it`
        );
    } else if (url.startsWith('/')) {
        errors.push(`${file}: refers to ${url} by an absolute path. Use ./${url.slice(1)}`);
    }
};

const checkCss = (file, css) => {
    for (const [, , url] of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) checkUrl(file, url);
    for (const [, , url] of css.matchAll(/@import\s+(['"])([^'"]+)\1/g)) checkUrl(file, url);
};

const read = (file) => fs.readFileSync(path.join(buildDir, file), 'utf8');

for (const file of files.filter((f) => f.endsWith('.html'))) {
    const html = read(file);
    for (const [, tag, attributes] of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
        const lower = tag.toLowerCase();
        if (BLOCKED_TAGS.includes(lower)) {
            errors.push(`${file}: the Lens sandbox blocks <${lower}>`);
            continue;
        }
        if (lower === 'link' && /\brel\s*=\s*["']?manifest\b/i.test(attributes)) {
            errors.push(`${file}: the Lens sandbox blocks web app manifests`);
            continue;
        }
        // links navigate rather than load, so they don't count
        if (lower === 'a') continue;

        for (const [, attribute, ...values] of attributes.matchAll(
            /\b(src|href|srcset|poster|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi
        )) {
            const value = values.find((v) => v !== undefined) ?? '';
            const urls =
                attribute.toLowerCase() === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value];
            for (const url of urls) checkUrl(file, url);
        }
    }
    for (const [, css] of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) checkCss(file, css);
}

for (const file of files.filter((f) => f.endsWith('.css'))) checkCss(file, read(file));

// scripts: a quoted root-absolute path to a file in the build always breaks, while a remote URL
// may only be text, so it is worth a look rather than a failure
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const absolute = new RegExp(`["'\`(]/(${files.map(escape).join('|')})(?=["'\`)?#])`, 'g');
for (const file of files.filter((f) => /\.m?js$/.test(f))) {
    const source = read(file);
    for (const target of new Set(Array.from(source.matchAll(absolute), (m) => m[1]))) {
        errors.push(`${file}: refers to /${target} by an absolute path. Use ./${target}`);
    }

    const hosts = new Set();
    for (const [url] of source.matchAll(/\b(?:https?|wss?):\/\/[^\s"'`)\\]+/g)) {
        const host = URL.canParse(url) ? new URL(url).host : url;
        if (!TEXT_HOSTS.includes(host)) hosts.add(host);
    }
    if (hosts.size) {
        warnings.push(
            `${file}: mentions ${[...hosts].join(', ')}. A Lens can't reach other hosts, so check none of them is loaded at runtime (npm run start blocks them the way Snapchat does)`
        );
    }
}

// a plain zip: deflated entries with forward-slash names and index.html at the root
const zipEntries = (entries) => {
    const local = [];
    const central = [];
    let offset = 0;

    for (const entry of entries) {
        const file = path.join(buildDir, entry);
        const data = fs.readFileSync(file);
        const deflated = zlib.deflateRawSync(data, { level: 9 });
        const stored = deflated.length >= data.length;
        const body = stored ? data : deflated;
        const entryName = Buffer.from(entry);
        const crc = zlib.crc32(data);

        const mtime = fs.statSync(file).mtime;
        const time = (mtime.getHours() << 11) | (mtime.getMinutes() << 5) | (mtime.getSeconds() >> 1);
        const date = ((mtime.getFullYear() - 1980) << 9) | ((mtime.getMonth() + 1) << 5) | mtime.getDate();

        const header = Buffer.alloc(30);
        header.writeUInt32LE(0x04034b50, 0);
        header.writeUInt16LE(20, 4);
        header.writeUInt16LE(0x0800, 6); // UTF-8 names
        header.writeUInt16LE(stored ? 0 : 8, 8);
        header.writeUInt16LE(time, 10);
        header.writeUInt16LE(date, 12);
        header.writeUInt32LE(crc, 14);
        header.writeUInt32LE(body.length, 18);
        header.writeUInt32LE(data.length, 22);
        header.writeUInt16LE(entryName.length, 26);

        const record = Buffer.alloc(46);
        record.writeUInt32LE(0x02014b50, 0);
        record.writeUInt16LE((3 << 8) | 20, 4); // made on Unix, so the permissions below apply
        record.writeUInt16LE(20, 6);
        record.writeUInt16LE(0x0800, 8);
        record.writeUInt16LE(stored ? 0 : 8, 10);
        record.writeUInt16LE(time, 12);
        record.writeUInt16LE(date, 14);
        record.writeUInt32LE(crc, 16);
        record.writeUInt32LE(body.length, 20);
        record.writeUInt32LE(data.length, 24);
        record.writeUInt16LE(entryName.length, 28);
        record.writeUInt32LE((0o100644 << 16) >>> 0, 38); // a regular file, rw-r--r--
        record.writeUInt32LE(offset, 42);

        local.push(header, entryName, body);
        central.push(record, entryName);
        offset += header.length + entryName.length + body.length;
    }

    const directory = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(offset, 16);

    return Buffer.concat([...local, directory, end]);
};

const zip = zipEntries(files);
if (zip.length > MAX_ZIP) {
    errors.push(
        `The zip is ${formatSize(zip.length)}, over the 8 MB limit. Compress textures and audio, and drop unused assets`
    );
}

for (const warning of warnings) console.warn(`warning: ${warning}`);

if (errors.length) {
    for (const error of errors) console.error(`error: ${error}`);
    fs.rmSync(zipFile, { force: true });
    console.error(
        `\nNo zip written. Fix the ${errors.length === 1 ? 'problem' : 'problems'} above and run npm run package again.`
    );
    process.exit(1);
}

fs.writeFileSync(zipFile, zip);

const largest = files
    .map((file) => ({ file, size: fs.statSync(path.join(buildDir, file)).size }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 5);
const width = Math.max(...largest.map(({ file }) => file.length));

console.log(`\nPackaged ${path.relative('.', zipFile)} for Snapchat Web Lenses`);
console.log(`  zip         ${formatSize(zip.length)} of 8 MB (${Math.ceil((zip.length / MAX_ZIP) * 100)}%)`);
console.log(`  index.html  ${formatSize(indexSize)} of 1 MB`);
console.log(`  files       ${files.length}`);
console.log('\nLargest files, before compression:');
for (const { file, size } of largest) console.log(`  ${file.padEnd(width)}  ${formatSize(size)}`);
console.log('\nUpload the zip at https://my-lenses.snapchat.com/');
