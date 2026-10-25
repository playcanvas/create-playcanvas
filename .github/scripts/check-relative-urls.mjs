// Fails when a build refers to one of its own files by a root-absolute path, such as
// /ammo/ammo.wasm.js. That path resolves against the domain root rather than the build, so the
// build breaks wherever else it's served from: a subpath such as GitHub Pages or itch.io, or a
// Snapchat Web Lens. Adapted from the web-lens starter's scripts/package-lens.mjs.
//
// Usage: node .github/scripts/check-relative-urls.mjs [build folder]

import fs from 'node:fs';
import path from 'node:path';

const buildDir = path.resolve(process.argv[2] ?? 'dist');

// a check of the wrong folder would pass, so insist on the page that loads the build
if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    console.error(`No build found at ${buildDir}. Pass the folder holding the built index.html.`);
    process.exit(1);
}

// every file in the build, as the forward-slash path it's served at. Source maps aren't loaded at runtime
const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(file) : [path.relative(buildDir, file).split(path.sep).join('/')];
    });
const files = walk(buildDir).filter((file) => !file.endsWith('.map'));

// a path to one of those files that's quoted, in url() or an unquoted attribute value:
// "/ammo/ammo.wasm.js", url(/assets/font.woff2) or src=/model.glb
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const absolute = new RegExp(`["'\`(=]/(${files.map(escape).join('|')})(?=["'\`)?#\\s>])`, 'g');

const errors = [];
for (const file of files.filter((f) => /\.(?:html|css|m?js)$/.test(f))) {
    const source = fs.readFileSync(path.join(buildDir, file), 'utf8');
    // a script resolves a relative path against the page, while markup and styles resolve it against
    // their own folder
    const from = /\.m?js$/.test(file) ? '.' : path.posix.dirname(file);
    for (const target of new Set(Array.from(source.matchAll(absolute), (m) => m[1]))) {
        const relative = path.posix.relative(from, target);
        errors.push(
            `${file}: refers to /${target} by an absolute path. Use ${relative.startsWith('../') ? relative : `./${relative}`}`
        );
    }
}

if (errors.length) {
    for (const error of errors) console.error(`error: ${error}`);
    console.error(
        '\nA root-absolute path only resolves when the build is served from a domain root. Make it relative so the build also runs from a subpath or as a Snapchat Web Lens.'
    );
    process.exit(1);
}

console.log(`No root-absolute paths to the ${files.length} files in ${path.relative('.', buildDir) || '.'}`);
