import path from 'node:path';

import * as prompts from '@clack/prompts';

import { isValidPackageName, toValidPackageName } from '../utils.js';

export const getPackageName = async ({
    targetDir,
    yes,
    cancel
}: {
    targetDir: string;
    yes?: boolean;
    cancel: () => never;
}) => {
    let packageName = path.basename(path.resolve(targetDir));

    if (!isValidPackageName(packageName)) {
        if (yes) return toValidPackageName(packageName);

        const packageNameResult = await prompts.text({
            message: 'Package name:',
            defaultValue: toValidPackageName(packageName),
            placeholder: toValidPackageName(packageName),
            validate: (dir) => {
                if (!dir || !isValidPackageName(dir)) {
                    return 'Invalid package.json name';
                }
            }
        });
        if (prompts.isCancel(packageNameResult)) return cancel();
        packageName = packageNameResult as string;
    }

    return packageName;
};
