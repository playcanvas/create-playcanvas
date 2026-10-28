import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

import { FEATURES, FORMATS, STARTERS } from '../templates/index.js';

const TEMPLATES_DIR = fileURLToPath(new URL('../templates', import.meta.url));

// the files each format's base leaves to the starter
const ENTRIES: Record<string, string[]> = {
    engine: ['src/main.ts'],
    react: ['src/App.tsx'],
    'web-components': ['index.html', 'src/main.ts']
};

const exists = (file: string) => fs.existsSync(path.join(TEMPLATES_DIR, file));

test('every starter exists in every format', () => {
    expect(Object.keys(ENTRIES).sort()).toEqual(FORMATS.map((f) => f.name).sort());

    const missing = FORMATS.flatMap((f) =>
        STARTERS.flatMap((s) => ENTRIES[f.name].map((entry) => `${f.name}/${s.name}/${entry}`))
    ).filter((file) => !exists(file));

    expect(missing).toEqual([]);
});

test('every feature a starter uses has its layers in every format', () => {
    const missing = STARTERS.flatMap((s) =>
        (s.features ?? []).flatMap((feature) =>
            FORMATS.flatMap((f) => {
                const dirs = (FEATURES[feature]?.[f.name] ?? []).map((layer) => `_features/${feature}/${layer}`);
                return dirs.length ? dirs.filter((dir) => !exists(dir)) : [`${feature} has no ${f.name} layers`];
            })
        )
    );

    expect([...new Set(missing)]).toEqual([]);
});

test('every starter directory belongs to a starter in the catalog', () => {
    const names = new Set(STARTERS.map((s) => s.name));
    const strays = ['_shared', ...FORMATS.map((f) => f.name)].flatMap((dir) =>
        fs
            .readdirSync(path.join(TEMPLATES_DIR, dir))
            .filter((name) => name !== 'base' && !names.has(name))
            .map((name) => `${dir}/${name}`)
    );

    expect(strays).toEqual([]);
});

test.each([
    ['README.md', '## Prerequisites'],
    ['AGENTS.md', '## Checking your work']
])('every base %s has the heading the shared ones are inserted above, and a skills section', (doc, heading) => {
    for (const f of FORMATS) {
        // a whole line, whichever line endings the checkout has
        const line = (text: string) => new RegExp(`^${text}\\r?$`, 'm');
        const text = fs.readFileSync(path.join(TEMPLATES_DIR, f.name, 'base', doc), 'utf8');
        expect(text).toMatch(line(heading));
        // --no-skills removes this section
        expect(text).toMatch(line('## Agent skills'));
    }
});

test('every project gets a CLAUDE.md that imports its AGENTS.md', () => {
    expect(fs.readFileSync(path.join(TEMPLATES_DIR, '_common', 'CLAUDE.md'), 'utf8')).toBe('@AGENTS.md\n');
});
