import * as prompts from '@clack/prompts';

import { BOILERPLATES } from '../../templates/index.js';

export const chooseBoilerplate = async ({
    argBoilerplate,
    yes,
    cancel
}: {
    argBoilerplate?: string;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argBoilerplate && BOILERPLATES.some((b) => b.name === argBoilerplate)) return argBoilerplate;

    // the picker cannot be answered without a TTY, so a scripted run takes the default rather than
    // blocking on it, and a bad name fails loudly rather than silently falling back
    if (!process.stdout.isTTY || yes) {
        if (!argBoilerplate) return BOILERPLATES[0].name;
        throw new Error(
            `Unknown boilerplate: ${argBoilerplate}. Choose from: ${BOILERPLATES.map((b) => b.name).join(', ')}`
        );
    }

    const boilerplate = await prompts.select({
        message: argBoilerplate
            ? `"${argBoilerplate}" isn't a valid boilerplate. Please choose from below: `
            : 'Select a boilerplate:',
        initialValue: BOILERPLATES[0].name,
        options: BOILERPLATES.map((b) => ({
            label: b.display,
            value: b.name,
            hint: b.description
        }))
    });
    if (prompts.isCancel(boilerplate)) cancel();

    return boilerplate as string;
};
