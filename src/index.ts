#!/usr/bin/env node

import * as prompts from '@clack/prompts';
import mri from 'mri';

import { chooseBoilerplate } from './steps/chooseBoilerplate.js';
import { chooseSkills } from './steps/chooseSkills.js';
import { chooseTemplate } from './steps/chooseTemplate.js';
import { getPackageName } from './steps/getPackageName.js';
import { getTargetDir } from './steps/getTargetDir.js';
import { handleExistingDir } from './steps/handleExistingDir.js';
import { scaffoldProject } from './steps/scaffoldProject.js';
import { formatTargetDir } from './utils/fs.js';

const argv = mri<{
    template?: string;
    boilerplate?: string;
    help?: boolean;
    overwrite?: boolean;
    yes?: boolean;
    skills?: boolean;
}>(process.argv.slice(2), {
    alias: { h: 'help', t: 'template', b: 'boilerplate', y: 'yes' },
    boolean: ['help', 'overwrite', 'yes'],
    string: ['template', 'boilerplate']
});

const cwd = process.cwd();

const helpMessage = `\
Usage: npm create playcanvas@latest [OPTION]...

Create a new PlayCanvas project with TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template
  -b, --boilerplate NAME     use a specific boilerplate
      --overwrite            remove existing files from a non-empty target directory
      --no-skills            omit the PlayCanvas agent skills
  -y, --yes                  skip the prompts and take the defaults
  -h, --help                 show help
`;

const renameFiles: Record<string, string> = {
    _gitignore: '.gitignore'
};

const defaultTargetDir = 'playcanvas-project';

const init = async () => {
    const argTargetDir = argv._[0] ? formatTargetDir(String(argv._[0])) : undefined;
    const argTemplate = argv.template;
    const argBoilerplate = argv.boilerplate;
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
    const template = await chooseTemplate({ argTemplate, yes, cancel });
    const boilerplate = await chooseBoilerplate({ argBoilerplate, yes, cancel });
    const skills = await chooseSkills({ argSkills: argv.skills, yes, cancel });

    scaffoldProject({
        cwd,
        targetDir,
        template,
        boilerplate,
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
