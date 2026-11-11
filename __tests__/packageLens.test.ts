import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';

const SCRIPT = fileURLToPath(new URL('../templates/_shared/web-lens/scripts/package-lens.mjs', import.meta.url));

const MB = 1024 * 1024;

// a build that passes every rule, for each test to break one of
const BUILD = {
    'index.html':
        '<!doctype html><link rel="stylesheet" href="./assets/index.css"><script type="module" src="./assets/index.js"></script>',
    'assets/index.css': 'body { background: url(./bg.png); }',
    'assets/index.js': 'fetch("./assets/level.json");',
    'assets/level.json': '{}'
};

let project: string;

beforeEach(() => {
    project = fs.mkdtempSync(path.join(os.tmpdir(), 'package-lens-'));
    fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: 'my-lens', version: '1.2.0' }));
});

afterEach(() => {
    fs.rmSync(project, { recursive: true, force: true });
});

const build = (files: Record<string, string | Buffer>) => {
    for (const [file, content] of Object.entries(files)) {
        const target = path.join(project, 'dist/lens', file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    }
};

const pack = () => {
    const { status, stdout, stderr } = spawnSync(process.execPath, [SCRIPT, 'dist/lens'], {
        cwd: project,
        encoding: 'utf8'
    });
    return { status, output: `${stdout}${stderr}` };
};

const ZIP = 'dist/my-lens-v1.2.0.zip';

// each entry's name and contents, read back through the zip's central directory
const unzip = (file: string) => {
    const zip = fs.readFileSync(path.join(project, file));
    const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    const entries: Record<string, string> = {};
    let at = zip.readUInt32LE(end + 16);
    for (let i = 0; i < zip.readUInt16LE(end + 10); i++) {
        const nameLength = zip.readUInt16LE(at + 28);
        const name = zip.toString('utf8', at + 46, at + 46 + nameLength);
        const local = zip.readUInt32LE(at + 42);
        const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
        const body = zip.subarray(start, start + zip.readUInt32LE(at + 20));
        const data = zip.readUInt16LE(at + 10) === 8 ? zlib.inflateRawSync(body) : body;
        expect(zlib.crc32(data)).toBe(zip.readUInt32LE(at + 16));
        entries[name] = data.toString('utf8');
        at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
    }
    return entries;
};

test('zips a build that passes, named for the package and its version, with index.html first', () => {
    build(BUILD);

    const { status, output } = pack();

    expect(status).toBe(0);
    expect(output).not.toContain('warning:');
    expect(output).toContain(`Packaged ${path.normalize(ZIP)}`);
    const entries = unzip(ZIP);
    expect(Object.keys(entries)).toEqual(['index.html', 'assets/index.css', 'assets/index.js', 'assets/level.json']);
    expect(entries).toEqual(BUILD);
});

test('names the zip for a scoped package without its scope', () => {
    fs.writeFileSync(path.join(project, 'package.json'), JSON.stringify({ name: '@studio/lens', version: '2.0.0' }));
    build(BUILD);

    expect(pack().status).toBe(0);
    expect(fs.existsSync(path.join(project, 'dist/studio-lens-v2.0.0.zip'))).toBe(true);
});

test('leaves source maps out of the zip', () => {
    build({ ...BUILD, 'assets/index.js.map': '{}' });

    const { status, output } = pack();

    expect(status).toBe(0);
    expect(output).toContain('Left 1 source map(s) out of the zip');
    expect(Object.keys(unzip(ZIP))).not.toContain('assets/index.js.map');
});

test('says how to build when there is no build', () => {
    const { status, output } = pack();

    expect(status).toBe(1);
    expect(output).toContain('No build found at');
});

describe('writes no zip', () => {
    test.each<[string, Record<string, string | Buffer>, string]>([
        [
            'without index.html at the root',
            { 'index.html': '', 'game/index.html': BUILD['index.html'] },
            'index.html must sit at the root'
        ],
        ['for an index.html over 1 MB', { 'index.html': 'x'.repeat(MB + 1) }, 'over the 1 MB limit'],
        ['for a zip over 8 MB', { 'assets/noise.bin': crypto.randomBytes(9 * MB) }, 'over the 8 MB limit'],
        ['for a file under __snap/', { '__snap/data.json': '{}' }, '__snap/ is reserved for Snapchat'],
        [
            'for a script from another host',
            { 'index.html': '<script src="https://cdn.example.com/lib.js"></script>' },
            'loads https://cdn.example.com/lib.js from another host'
        ],
        [
            'for a web font',
            { 'assets/index.css': '@import "https://fonts.example.com/css";' },
            'loads https://fonts.example.com/css from another host'
        ],
        [
            'for an absolute path in markup',
            { 'index.html': '<script type="module" src="/assets/index.js"></script>' },
            'refers to /assets/index.js by an absolute path. Use ./assets/index.js'
        ],
        [
            'for an absolute path in a style sheet',
            { 'assets/index.css': 'body { background: url(/bg.png); }' },
            'refers to /bg.png by an absolute path'
        ],
        [
            'for an absolute path to a build file in a script',
            { 'assets/index.js': 'fetch("/assets/level.json");' },
            'refers to /assets/level.json by an absolute path'
        ],
        ['for an <iframe>', { 'index.html': '<iframe src="./menu.html"></iframe>' }, 'blocks <iframe>'],
        [
            'for a web app manifest',
            { 'index.html': '<link rel="manifest" href="./app.webmanifest">' },
            'blocks web app manifests'
        ],
        [
            'for code that opens the camera',
            { 'assets/index.js': 'navigator.mediaDevices.getUserMedia({ video: true });' },
            'uses mediaDevices, getUserMedia'
        ]
    ])('%s', (_, files, message) => {
        build({ ...BUILD, ...files });
        // a zip left from an earlier run goes too, so it can't be uploaded by mistake
        fs.writeFileSync(path.join(project, ZIP), '');

        const { status, output } = pack();

        expect(status).toBe(1);
        expect(output).toContain(`error: `);
        expect(output).toContain(message);
        expect(fs.existsSync(path.join(project, ZIP))).toBe(false);
    });
});

describe('zips with a warning', () => {
    test.each<[string, Record<string, string>, string]>([
        [
            'for a host a script mentions',
            { 'assets/index.js': 'fetch("https://api.example.com/scores");' },
            'mentions api.example.com'
        ],
        [
            'for audio Snapchat serves as binary data',
            { 'assets/music.ogg': '', 'assets/hit.wav': '' },
            'assets/hit.wav, assets/music.ogg: Snapchat serves audio and video as generic binary data'
        ],
        [
            'for storage that starts empty every launch',
            { 'assets/index.js': 'localStorage.setItem("best", 1);' },
            'uses localStorage'
        ],
        [
            'for motion sensors',
            { 'assets/index.js': 'addEventListener("deviceorientation", () => {});' },
            'uses deviceorientation'
        ]
    ])('%s', (_, files, message) => {
        build({ ...BUILD, ...files });

        const { status, output } = pack();

        expect(status).toBe(0);
        expect(output).toContain(`warning: `);
        expect(output).toContain(message);
        expect(fs.existsSync(path.join(project, ZIP))).toBe(true);
    });

    test('but not for the hosts that bundles only mention as text', () => {
        build({ ...BUILD, 'assets/index.js': 'throw new Error("see https://react.dev/errors/418");' });

        const { status, output } = pack();

        expect(status).toBe(0);
        expect(output).not.toContain('warning:');
    });
});
