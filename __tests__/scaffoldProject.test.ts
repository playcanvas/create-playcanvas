import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prompts from '@clack/prompts';
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
    vi.unstubAllEnvs();
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

describe('package manager', () => {
    const readme = (install: string, run: string, host: string) =>
        [
            '# Demo',
            '',
            '```bash',
            install,
            `${run} dev`,
            '```',
            '',
            `Run these with \`${run} <script>\`, or open it on a phone with \`${host}\`.`,
            ''
        ].join('\n');

    test.each([
        ['npm', 'npm/12.0.1 node/v24.18.0', 'npm install', 'npm run', 'npm run dev -- --host'],
        ['pnpm', 'pnpm/10.20.0 npm/? node/v24.18.0', 'pnpm install', 'pnpm run', 'pnpm run dev --host'],
        ['yarn', 'yarn/1.22.22 npm/? node/v24.18.0', 'yarn', 'yarn', 'yarn dev --host'],
        ['bun', 'bun/1.3.1 npm/? node/v24.18.0', 'bun install', 'bun run', 'bun run dev --host'],
        // one whose commands differ from npm's in more than the name gets npm's
        ['deno', 'deno/2.5.6 npm/? deno/2.5.6', 'npm install', 'npm run', 'npm run dev -- --host'],
        ['none', undefined, 'npm install', 'npm run', 'npm run dev -- --host']
    ])('the README and closing message give commands for %s', (_, agent, install, run, host) => {
        vi.stubEnv('npm_config_user_agent', agent);
        write({ 'engine/base/README.md': readme('npm install', 'npm run', 'npm run dev -- --host') });

        const root = scaffold();

        expect(read(root, 'README.md')).toBe(readme(install, run, host));
        expect(prompts.outro).toHaveBeenLastCalledWith(
            `Project created. Now run:\n\n  cd app\n  ${install}\n  ${run} dev`
        );
    });
});

test('renames files once every layer is copied', () => {
    write({ '_common/_gitignore': 'node_modules\n', '_common/_npmrc': 'registry=https://registry.npmjs.org/\n' });

    const root = scaffold({ renameFiles: { _gitignore: '.gitignore', _npmrc: '.npmrc', _missing: '.missing' } });

    expect(list(root)).toEqual(['.gitignore', '.npmrc', 'package.json']);
    expect(read(root, '.gitignore')).toBe('node_modules\n');
});

describe('skills', () => {
    const README = '# Demo\n\n## Inspector\n\nPress `.\n\n## Agent skills\n\nSkills.\n\n## Further reading\n\nLinks.\n';

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

    test('keep their README section', () => {
        write({ 'engine/base/README.md': README });

        const root = scaffold({ skills: true });

        expect(read(root, 'README.md')).toBe(README);
    });

    test('are left out with --no-skills, along with their README section', () => {
        write({ 'engine/base/README.md': README });

        const root = scaffold({ skills: false });

        expect(fs.existsSync(path.join(root, '.claude'))).toBe(false);
        expect(fs.existsSync(path.join(root, '.agents'))).toBe(false);
        expect(read(root, 'README.md')).toBe('# Demo\n\n## Inspector\n\nPress `.\n\n## Further reading\n\nLinks.\n');
    });
});
