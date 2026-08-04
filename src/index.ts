#!/usr/bin/env node

import * as prompts from '@clack/prompts';
import mri from 'mri';

import { chooseBoilerplate } from './steps/chooseBoilerplate.js';
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
}>(process.argv.slice(2), {
    alias: { h: 'help', t: 'template', b: 'boilerplate' },
    boolean: ['help', 'overwrite'],
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

    const help = argv.help;
    if (help) {
        console.log(helpMessage);
        return;
    }

    const cancel = () => {
        prompts.cancel('Operation cancelled');
        process.exit(0);
    };

    const targetDir = await getTargetDir({ argTargetDir, defaultTargetDir, cancel });
    await handleExistingDir({ targetDir, argOverwrite, cancel });
    const packageName = await getPackageName({ targetDir, cancel });
    const template = await chooseTemplate({ argTemplate, cancel });
    const boilerplate = await chooseBoilerplate({ argBoilerplate, cancel });

    scaffoldProject({
        cwd,
        targetDir,
        template,
        boilerplate,
        packageName,
        renameFiles
    });
};

init().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
