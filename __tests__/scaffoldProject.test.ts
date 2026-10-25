import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { scaffoldProject } from '../src/steps/scaffoldProject.js';

vi.mock('@clack/prompts', () => ({ log: { step: vi.fn() }, outro: vi.fn() }));

// one starter using one feature, to match the fixture templates each test writes
vi.mock('../templates/index.js', () => ({
    FEATURES: { physics: { engine: ['assets'] } },
    STARTERS: [{ name: 'demo', features: ['physics'] }]
}));

// the layers of engine/demo, in the order they apply
const LAYERS = ['_common', 'engine/base', '_shared/demo', '_features/physics/assets', 'engine/demo'];

const SKILLS_DIR = fileURLToPath(new URL('../skills', import.meta.url));

let tmp: string;
let templates: string;

beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'create-playcanvas-'));
    templates = path.join(tmp, 'templates');
    fs.mkdirSync(path.join(templates, 'engine/demo'), { recursive: true });
});

afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
});

const write = (files: Record<string, string>) => {
    for (const [file, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(templates, file)), { recursive: true });
        fs.writeFileSync(path.join(templates, file), content);
    }
};

const scaffold = (options: Partial<Parameters<typeof scaffoldProject>[0]> = {}) => {
    scaffoldProject({
        cwd: tmp,
        targetDir: 'app',
        format: 'engine',
        starter: 'demo',
        packageName: 'my-app',
        skills: false,
        renameFiles: {},
        templatesDir: templates,
        ...options
    });
    return path.join(tmp, 'app');
};

const read = (root: string, file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const list = (dir: string) => (fs.readdirSync(dir, { recursive: true }) as string[]).sort();

test('a file in a later layer replaces the same file in an earlier one', () => {
    // N.txt is in layers 0 to N, so each layer has one file it should win
    LAYERS.forEach((layer, i) => {
        for (let n = i; n < LAYERS.length; n++) write({ [`${layer}/${n}.txt`]: layer });
    });

    const root = scaffold();

    expect(LAYERS.map((_, n) => read(root, `${n}.txt`))).toEqual(LAYERS);
});

test('package.json files merge in layer order, with their dependency maps sorted', () => {
    write({
        'engine/base/package.json': JSON.stringify({
            name: 'playcanvas-project',
            version: '0.0.0',
            description: 'A PlayCanvas project',
            scripts: { dev: 'vite', build: 'vite build' },
            dependencies: { playcanvas: '^2.0.0' },
            peerDependencies: {}
        }),
        '_shared/demo/package.json': JSON.stringify({
            description: 'A demo',
            scripts: { package: 'node package.mjs' }
        }),
        '_features/physics/assets/package.json': JSON.stringify({ dependencies: { 'sync-ammo': '^0.1.0' } }),
        'engine/demo/package.json': JSON.stringify({ dependencies: { playcanvas: '^2.1.0', '@snap/lens': '^1.0.0' } })
    });

    const root = scaffold();

    // keys keep the base's order, the name is the project's and empty maps are dropped
    const expected = {
        name: 'my-app',
        version: '0.0.0',
        description: 'A demo',
        scripts: { build: 'vite build', dev: 'vite', package: 'node package.mjs' },
        dependencies: { '@snap/lens': '^1.0.0', playcanvas: '^2.1.0', 'sync-ammo': '^0.1.0' }
    };
    expect(read(root, 'package.json')).toBe(`${JSON.stringify(expected, null, 4)}\n`);
});

test('the shared README is inserted into the base README above its Prerequisites', () => {
    write({
        'engine/base/README.md': '# PlayCanvas Engine\n\nA project.\n\n## Prerequisites\n\nNode.js.\n',
        // a `$` is kept as written, rather than read as a replacement pattern
        '_shared/demo/README.md': '## Demo\n\nRun `echo $$` and `$&`.\n\n'
    });

    const root = scaffold();

    expect(read(root, 'README.md')).toBe(
        '# PlayCanvas Engine\n\nA project.\n\n## Demo\n\nRun `echo $$` and `$&`.\n\n## Prerequisites\n\nNode.js.\n'
    );
});

test('renames files once every layer is copied', () => {
    write({ '_common/_gitignore': 'node_modules\n', '_common/_npmrc': 'registry=https://registry.npmjs.org/\n' });

    const root = scaffold({ renameFiles: { _gitignore: '.gitignore', _npmrc: '.npmrc', _missing: '.missing' } });

    expect(list(root)).toEqual(['.gitignore', '.npmrc', 'package.json']);
    expect(read(root, '.gitignore')).toBe('node_modules\n');
});

describe('skills', () => {
    test('copies every skill for Claude Code, and for Codex and Cursor', () => {
        const root = scaffold({ skills: true });

        const skills = fs
            .readdirSync(SKILLS_DIR, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        expect(skills).not.toHaveLength(0);
        for (const dir of ['.claude/skills', '.agents/skills']) {
            expect(fs.readdirSync(path.join(root, dir)).sort()).toEqual(skills.sort());
            for (const skill of skills) {
                expect(list(path.join(root, dir, skill))).toEqual(list(path.join(SKILLS_DIR, skill)));
            }
        }
    });

    test('are left out with --no-skills', () => {
        const root = scaffold({ skills: false });

        expect(fs.existsSync(path.join(root, '.claude'))).toBe(false);
        expect(fs.existsSync(path.join(root, '.agents'))).toBe(false);
    });
});
