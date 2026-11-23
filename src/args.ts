import mri from 'mri';

const ALIASES = { b: 'boilerplate', f: 'format', h: 'help', s: 'starter', t: 'template', v: 'version', y: 'yes' };
const BOOLEANS = ['help', 'version', 'overwrite', 'keep', 'yes', 'skills'];
const STRINGS = ['format', 'starter', 'template', 'boilerplate'];
const KNOWN = new Set([...BOOLEANS, ...STRINGS, ...Object.keys(ALIASES)]);

// an option as it was typed: --no-name for one switched off, -n for a shorthand
const typed = (name: string, value: unknown) =>
    value === false ? `--no-${name}` : name.length === 1 ? `-${name}` : `--${name}`;

// Reads the command line, and fails on anything it can't act on. Carrying on without a mistyped
// option would create a project that isn't the one asked for, with nothing to say so
export const parseArgs = (args: string[]) => {
    const argv = mri<{
        format?: string;
        starter?: string;
        template?: string;
        boilerplate?: string;
        help?: boolean;
        version?: boolean;
        overwrite?: boolean;
        keep?: boolean;
        yes?: boolean;
        skills?: boolean;
    }>(
        // npm needs a `--` before the options and takes it out. A package manager that passes it on
        // would have every option after it read as a directory
        args.filter((arg) => arg !== '--'),
        // copies, since mri adds to what it is given
        { alias: { ...ALIASES }, boolean: [...BOOLEANS], string: [...STRINGS] }
    );

    // everything that was passed, whether or not it is an option the creator has
    const passed: Record<string, unknown> = argv;

    const unknown = Object.keys(passed).filter((name) => name !== '_' && !KNOWN.has(name));
    if (unknown.length) {
        throw new Error(
            `Unknown option${unknown.length > 1 ? 's' : ''}: ${unknown.map((name) => typed(name, passed[name])).join(', ')}. Pass --help to list the options.`
        );
    }

    for (const name of STRINGS) {
        const value = passed[name];
        if (Array.isArray(value)) throw new Error(`--${name} was passed more than once.`);
        // passed, but with no name after it
        if (value !== undefined && !value) throw new Error(`--${name} needs a name. Pass --help to list them.`);
    }

    const dirs = argv._.map(String);
    if (dirs.length > 1) {
        throw new Error(
            `Expected one directory, but got ${dirs.length}: ${dirs.join(', ')}. Put a name with spaces in quotes.`
        );
    }

    return {
        targetDir: dirs[0] as string | undefined,
        format: argv.format ?? argv.template,
        starter: argv.starter ?? argv.boilerplate,
        overwrite: argv.overwrite,
        keep: argv.keep,
        yes: argv.yes,
        // included by default; --no-skills opts out
        skills: argv.skills ?? true,
        help: argv.help,
        version: argv.version
    };
};
