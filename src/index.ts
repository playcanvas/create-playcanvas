#!/usr/bin/env node

import * as prompts from '@clack/prompts';
import mri from 'mri';

import { chooseFormat } from './steps/chooseFormat.js';
import { chooseStarter } from './steps/chooseStarter.js';
import { getPackageName } from './steps/getPackageName.js';
import { getTargetDir } from './steps/getTargetDir.js';
import { handleExistingDir } from './steps/handleExistingDir.js';
import { scaffoldProject } from './steps/scaffoldProject.js';
import { formatTargetDir } from './utils/fs.js';

const argv = mri<{
    format?: string;
    starter?: string;
    template?: string;
    boilerplate?: string;
    help?: boolean;
    overwrite?: boolean;
    yes?: boolean;
    skills?: boolean;
}>(process.argv.slice(2), {
    alias: { b: 'boilerplate', f: 'format', h: 'help', s: 'starter', t: 'template', y: 'yes' },
    boolean: ['help', 'overwrite', 'yes'],
    string: ['format', 'starter', 'template', 'boilerplate']
});

const cwd = process.cwd();

const helpMessage = `\
Usage: npm create playcanvas@latest [OPTION]...

Create a new PlayCanvas project with TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -f, --format NAME          use a specific format
  -s, --starter NAME         use a specific starter
      --overwrite            remove existing files from a non-empty target directory
      --no-skills            omit the PlayCanvas agent skills
  -y, --yes                  skip the prompts and take the defaults
  -h, --help                 show help
`;

const renameFiles: Record<string, string> = {
    _gitignore: '.gitignore',
    _npmrc: '.npmrc'
};

const defaultTargetDir = 'playcanvas-project';

const init = async () => {
    const argTargetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : undefined;
    const argFormat = argv.format ?? argv.template;
    const argStarter = argv.starter ?? argv.boilerplate;
    const argOverwrite = argv.overwrite;
    const yes = argv.yes;

    const help = argv.help;
    if (help) {
        console.log(helpMessage);
        return;
    }

    const cancel = () => {
        prompts.cancel('Operation cancelled');
        process.exit(0);
    };

    const targetDir = await getTargetDir({ argTargetDir, defaultTargetDir, yes, cancel });
    await handleExistingDir({ targetDir, argOverwrite, yes, cancel });
    const packageName = await getPackageName({ targetDir, yes, cancel });
    const format = await chooseFormat({ argFormat, yes, cancel });
    const starter = await chooseStarter({ argStarter, yes, cancel });

    // included by default; --no-skills opts out
    const skills = argv.skills ?? true;

    scaffoldProject({
        cwd,
        targetDir,
        format,
        starter,
        packageName,
        skills,
        renameFiles
    });
};

init().catch((e) => {
    // a bad flag or a non-empty directory is a user error, so print the message rather than a stack
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
});
