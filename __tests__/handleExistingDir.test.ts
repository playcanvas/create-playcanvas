import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import * as prompts from '@clack/prompts';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handleExistingDir } from '../src/steps/handleExistingDir.js';

vi.mock('@clack/prompts', () => ({ select: vi.fn(), isCancel: vi.fn(() => false), cancel: vi.fn() }));

let dir: string;

beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-playcanvas-'));
});

afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    vi.clearAllMocks();
});

const cancel = () => {
    throw new Error('cancelled');
};

const run = (options: Partial<Parameters<typeof handleExistingDir>[0]> = {}) =>
    handleExistingDir({ targetDir: dir, cancel, ...options });

const add = (file: string) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), '');
};

test.each([
    ['is missing', () => fs.rmSync(dir, { recursive: true })],
    ['is empty', () => undefined],
    ['holds only a repository', () => add('.git/HEAD')]
])('a target directory that %s needs no decision', async (_, prepare) => {
    prepare();

    await expect(run({ yes: true })).resolves.toBe(false);
    await expect(run({ yes: true, argKeep: true })).resolves.toBe(false);
    expect(prompts.select).not.toHaveBeenCalled();
});

describe('a target directory with files in it', () => {
    beforeEach(() => add('spec.md'));

    test('fails without a prompt to answer, naming both flags and deleting nothing', async () => {
        await expect(run({ yes: true })).rejects.toThrow(/--keep .* --overwrite/);
        expect(fs.readdirSync(dir)).toEqual(['spec.md']);
    });

    test('is emptied with --overwrite, but for its repository', async () => {
        add('.git/HEAD');

        await expect(run({ yes: true, argOverwrite: true })).resolves.toBe(false);
        expect(fs.readdirSync(dir)).toEqual(['.git']);
    });

    test('keeps its files with --keep', async () => {
        await expect(run({ yes: true, argKeep: true })).resolves.toBe(true);
        expect(fs.readdirSync(dir)).toEqual(['spec.md']);
    });

    test("can't keep its files where one is a package.json", async () => {
        add('package.json');

        await expect(run({ yes: true, argKeep: true })).rejects.toThrow(/already has a package\.json/);
        expect(fs.readdirSync(dir)).toEqual(['package.json', 'spec.md']);
    });

    test('takes --keep or --overwrite, not both', async () => {
        await expect(run({ argKeep: true, argOverwrite: true })).rejects.toThrow('not both');
        expect(fs.readdirSync(dir)).toEqual(['spec.md']);
    });

    test.each([
        ['yes', false, []],
        ['keep', true, ['spec.md']]
    ])('does as the prompt answers: %s', async (answer, keep, left) => {
        vi.mocked(prompts.select).mockResolvedValue(answer);

        await expect(run()).resolves.toBe(keep);
        expect(fs.readdirSync(dir)).toEqual(left);
    });

    test('is left alone when the prompt is declined', async () => {
        vi.mocked(prompts.select).mockResolvedValue('no');

        await expect(run()).rejects.toThrow('cancelled');
        expect(fs.readdirSync(dir)).toEqual(['spec.md']);
    });
});
