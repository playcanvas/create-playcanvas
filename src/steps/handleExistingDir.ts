import fs from 'node:fs';
import path from 'node:path';

import * as prompts from '@clack/prompts';

import { isEmpty, emptyDir } from '../utils/fs.js';

// resolves to whether the project is to be added to the files the target directory already holds
export const handleExistingDir = async ({
    targetDir,
    argOverwrite,
    argKeep,
    yes,
    cancel
}: {
    targetDir: string;
    argOverwrite?: boolean;
    argKeep?: boolean;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argOverwrite && argKeep) {
        throw new Error('Pass --keep or --overwrite, not both.');
    }

    if (!fs.existsSync(targetDir) || isEmpty(targetDir)) return false;

    let choice: unknown = 'no';
    if (argOverwrite) {
        choice = 'yes';
    } else if (argKeep) {
        choice = 'keep';
    } else if (yes) {
        // --yes takes the defaults, and no default touches files that are already there
        throw new Error(
            `Target directory "${targetDir}" is not empty. Pass --keep to add the project to its files, or --overwrite to remove them.`
        );
    } else {
        choice = await prompts.select({
            message:
                (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
                ` is not empty. Please choose how to proceed:`,
            options: [
                { label: 'Cancel operation', value: 'no' },
                { label: 'Remove existing files and continue', value: 'yes' },
                { label: 'Keep existing files and continue', value: 'keep' }
            ]
        });
    }

    if (prompts.isCancel(choice)) return cancel();

    switch (choice) {
        case 'yes':
            emptyDir(targetDir);
            return false;
        case 'keep':
            // an existing file is never replaced, and a project can't work from another's manifest
            if (fs.existsSync(path.join(targetDir, 'package.json'))) {
                throw new Error(
                    `Target directory "${targetDir}" already has a package.json, so it can't keep its files. Pass --overwrite to remove them.`
                );
            }
            return true;
        default:
            return cancel();
    }
};
