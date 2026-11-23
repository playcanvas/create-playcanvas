import * as prompts from '@clack/prompts';
import { afterEach, expect, test, vi } from 'vitest';

import { chooseStarter } from '../src/steps/chooseStarter.js';
import { RENAMED_STARTERS, STARTERS } from '../templates/index.js';

vi.mock('@clack/prompts', () => ({ select: vi.fn(), isCancel: vi.fn(() => false), log: { warn: vi.fn() } }));

afterEach(() => {
    vi.clearAllMocks();
});

const cancel = () => {
    throw new Error('cancelled');
};

const run = (options: Partial<Parameters<typeof chooseStarter>[0]> = {}) => chooseStarter({ cancel, ...options });

test('takes a starter by name', async () => {
    await expect(run({ argStarter: 'model-viewer', yes: true })).resolves.toBe('model-viewer');
    expect(prompts.log.warn).not.toHaveBeenCalled();
});

test('takes the default where none is named and nothing can answer a prompt', async () => {
    await expect(run({ yes: true })).resolves.toBe(STARTERS[0].name);
    expect(prompts.select).not.toHaveBeenCalled();
});

test.each([...RENAMED_STARTERS])('takes %s, the name %s had before, and says what it is now', async (old, name) => {
    await expect(run({ argStarter: old, yes: true })).resolves.toBe(name);
    await expect(run({ argStarter: old })).resolves.toBe(name);

    expect(prompts.log.warn).toHaveBeenCalledWith(`The "${old}" starter is now "${name}"`);
    expect(prompts.select).not.toHaveBeenCalled();
});

// "constructor" is on every object, so it must not pass for a name
test.each(['nope', 'constructor'])(
    'fails on a name it does not know where nothing can answer a prompt: %s',
    async (name) => {
        await expect(run({ argStarter: name, yes: true })).rejects.toThrow(
            `Unknown starter: ${name}. Choose from: blank,`
        );
    }
);

test('asks where a terminal can answer, starting on the default', async () => {
    vi.mocked(prompts.select).mockResolvedValue('vr');

    await expect(run()).resolves.toBe('vr');
    expect(prompts.select).toHaveBeenCalledWith(expect.objectContaining({ initialValue: STARTERS[0].name }));
});
