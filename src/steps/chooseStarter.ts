import * as prompts from '@clack/prompts';

import { STARTERS } from '../../templates/index.js';

export const chooseStarter = async ({
    argStarter,
    yes,
    cancel
}: {
    argStarter?: string;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argStarter && STARTERS.some((s) => s.name === argStarter)) return argStarter;

    // the picker cannot be answered without a TTY, so a scripted run takes the default rather than
    // blocking on it, and a bad name fails loudly rather than silently falling back
    if (!process.stdout.isTTY || yes) {
        if (!argStarter) return STARTERS[0].name;
        throw new Error(`Unknown starter: ${argStarter}. Choose from: ${STARTERS.map((s) => s.name).join(', ')}`);
    }

    const starter = await prompts.select({
        message: argStarter ? `"${argStarter}" isn't a valid starter. Please choose from below: ` : 'Select a starter:',
        initialValue: STARTERS[0].name,
        options: STARTERS.map((s) => ({
            label: s.display,
            value: s.name,
            hint: `${s.category} · ${s.description}`
        }))
    });
    if (prompts.isCancel(starter)) cancel();

    return starter as string;
};
