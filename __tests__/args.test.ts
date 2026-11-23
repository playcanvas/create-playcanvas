import { describe, expect, test } from 'vitest';

import { parseArgs } from '../src/args.js';

const parse = (line: string) => parseArgs(line.split(' ').filter(Boolean));

test('with nothing passed, leaves every choice open and includes the skills', () => {
    expect(parse('')).toEqual({
        targetDir: undefined,
        format: undefined,
        starter: undefined,
        overwrite: undefined,
        keep: undefined,
        yes: undefined,
        skills: true,
        help: undefined,
        version: undefined
    });
});

test.each([
    'my-game --format react --starter vr --yes --keep',
    'my-game -f react -s vr -y --keep',
    'my-game --format=react --starter=vr -y --keep',
    '--keep -y -s vr -f react my-game'
])('takes the directory and the options: %s', (line) => {
    expect(parse(line)).toMatchObject({ targetDir: 'my-game', format: 'react', starter: 'vr', yes: true, keep: true });
});

test('takes the previous --template and --boilerplate flags, and their shorthands', () => {
    expect(parse('--template react --boilerplate vr')).toMatchObject({ format: 'react', starter: 'vr' });
    expect(parse('-t react -b vr')).toMatchObject({ format: 'react', starter: 'vr' });
});

test('leaves the skills out with --no-skills', () => {
    expect(parse('my-game --no-skills')).toMatchObject({ targetDir: 'my-game', skills: false });
});

test.each([
    ['--help', 'help'],
    ['-h', 'help'],
    ['--version', 'version'],
    ['-v', 'version'],
    ['--overwrite', 'overwrite']
])('takes %s', (flag, name) => {
    expect(parse(flag)).toMatchObject({ [name]: true, targetDir: undefined });
});

// pnpm, yarn and bun may hand the creator the `--` that npm needs before the options
test('takes the options after a -- that the package manager passed on', () => {
    expect(parse('my-game -- -f react -y')).toMatchObject({ targetDir: 'my-game', format: 'react', yes: true });
});

describe('fails rather than create a project that was not asked for', () => {
    test.each([
        ['--formt react', '--formt'],
        ['my-game --typescript', '--typescript'],
        ['my-game -x', '-x'],
        ['my-game --no-git', '--no-git']
    ])('on an option it does not know: %s', (line, flag) => {
        expect(() => parse(line)).toThrow(`Unknown option: ${flag}. Pass --help`);
    });

    test('naming every option it does not know', () => {
        expect(() => parse('--formt react --git')).toThrow('Unknown options: --formt, --git.');
    });

    test.each([
        ['my-game --starter', '--starter'],
        ['my-game -s', '--starter'],
        ['--format --yes', '--format'],
        ['-t', '--template']
    ])('on an option that needs a name and has none: %s', (line, flag) => {
        expect(() => parse(line)).toThrow(`${flag} needs a name`);
    });

    test('on an option passed more than once', () => {
        expect(() => parse('-f react -f engine')).toThrow('--format was passed more than once');
    });

    test('on a second directory, as from a name with spaces left unquoted', () => {
        expect(() => parse('my game -f react')).toThrow('Expected one directory, but got 2: my, game');
    });
});

test('takes a directory name with spaces', () => {
    expect(parseArgs(['My Cool Game', '-y'])).toMatchObject({ targetDir: 'My Cool Game', yes: true });
});
