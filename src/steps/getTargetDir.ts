import * as prompts from '@clack/prompts';

import { formatTargetDir } from '../utils/fs.js';

export const getTargetDir = async ({
    argTargetDir,
    defaultTargetDir,
    cancel
}: {
    argTargetDir?: string;
    defaultTargetDir: string;
    cancel: () => never;
}) => {
    let targetDir = argTargetDir ? formatTargetDir(String(argTargetDir)) : undefined;

    if (!targetDir) {
        const projectName = await prompts.text({
            message: 'Project name:',
            defaultValue: defaultTargetDir,
            placeholder: defaultTargetDir
        });

        if (prompts.isCancel(projectName)) {
            cancel();
        }
        targetDir = formatTargetDir(projectName as string);
    }

    return targetDir!;
};
