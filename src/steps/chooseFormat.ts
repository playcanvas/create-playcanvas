import * as prompts from '@clack/prompts';

import { FORMATS } from '../../templates/index.js';

export const chooseFormat = async ({
    argFormat,
    yes,
    cancel
}: {
    argFormat?: string;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argFormat && FORMATS.some((f) => f.name === argFormat)) return argFormat;

    // falling back to the picker would hang a scripted run, so fail loudly instead
    if (argFormat && (!process.stdout.isTTY || yes)) {
        throw new Error(`Unknown format: ${argFormat}. Choose from: ${FORMATS.map((f) => f.name).join(', ')}`);
    }

    if (yes) return FORMATS[0].name;

    const format = await prompts.select({
        message: argFormat ? `"${argFormat}" isn't a valid format. Please choose from below: ` : 'Select a format:',
        options: FORMATS.map((f) => ({
            label: f.color(f.display),
            value: f.name,
            hint: f.description
        }))
    });
    if (prompts.isCancel(format)) cancel();

    return format as string;
};
