#!/usr/bin/env node

import fs from 'node:fs';

import * as prompts from '@clack/prompts';

import { FORMATS, STARTERS } from '../templates/index.js';

import { parseArgs } from './args.js';
import { chooseFormat } from './steps/chooseFormat.js';
import { chooseStarter } from './steps/chooseStarter.js';
import { getPackageName } from './steps/getPackageName.js';
import { getTargetDir } from './steps/getTargetDir.js';
import { handleExistingDir } from './steps/handleExistingDir.js';
import { scaffoldProject } from './steps/scaffoldProject.js';
import { formatTargetDir } from './utils/fs.js';

const cwd = process.cwd();

// the names --format and --starter take, in the options' two columns. The first is the default
const catalog = (items: { name: string; description: string }[]) =>
    items.map((item, i) => `  ${item.name.padEnd(27)}${item.description}${i ? '' : ' (default)'}`).join('\n');

const helpMessage = `\
Usage: npm create playcanvas@latest [DIRECTORY] -- [OPTION]...

Create a new PlayCanvas project with TypeScript in DIRECTORY.
With no arguments, start the CLI in interactive mode.
npm needs the -- before the options. pnpm, yarn and bun take them without it.

Options:
  -f, --format NAME          use a specific format
  -s, --starter NAME         use a specific starter
      --overwrite            remove existing files from a non-empty target directory
      --keep                 add the project to a non-empty target directory, replacing no files
      --no-skills            omit the PlayCanvas agent skills
  -y, --yes                  skip the prompts and take the defaults
  -h, --help                 show help
  -v, --version              show the version

Formats:
${catalog(FORMATS)}

Starters:
${catalog(STARTERS)}

Without a terminal, as when an AI agent or CI runs it, the CLI takes the
defaults for any option not passed, as --yes does.
`;

const renameFiles: Record<string, string> = {
    _gitignore: '.gitignore',
    _npmrc: '.npmrc'
};

const defaultTargetDir = 'playcanvas-project';

const init = async () => {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
        console.log(helpMessage);
        return;
    }

    if (args.version) {
        // package.json is one folder up from both dist/ and src/
        const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
            version: string;
        };
        console.log(pkg.version);
        return;
    }

    const argTargetDir = args.targetDir ? formatTargetDir(args.targetDir) : undefined;
    const argFormat = args.format;
    const argStarter = args.starter;
    const argOverwrite = args.overwrite;
    const argKeep = args.keep;

    // nothing can answer a prompt without a terminal, as when an AI agent or CI runs the command,
    // so take the defaults as --yes does, rather than exit without creating a project
    const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    const yes = args.yes || !interactive;

    if (!interactive && !args.yes) {
        prompts.log.info('Not running in a terminal, so using the defaults for any option not passed');
    }

    const cancel = () => {
        prompts.cancel('Operation cancelled');
        process.exit(0);
    };

    const targetDir = await getTargetDir({ argTargetDir, defaultTargetDir, yes, cancel });
    const keep = await handleExistingDir({ targetDir, argOverwrite, argKeep, yes, cancel });
    const packageName = await getPackageName({ targetDir, yes, cancel });
    const format = await chooseFormat({ argFormat, yes, cancel });
    const starter = await chooseStarter({ argStarter, yes, cancel });

    scaffoldProject({
        cwd,
        targetDir,
        format,
        starter,
        packageName,
        skills: args.skills,
        keep,
        renameFiles
    });
};

init().catch((e) => {
    // a bad flag or a non-empty directory is a user error, so print the message rather than a stack
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
});
