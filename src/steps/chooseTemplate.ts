import * as prompts from '@clack/prompts';

import { TEMPLATES } from '../../templates/index.js';

export const chooseTemplate = async ({
    argTemplate,
    yes,
    cancel
}: {
    argTemplate?: string;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argTemplate && TEMPLATES.some((t) => t.name === argTemplate)) return argTemplate;

    // falling back to the picker would hang a scripted run, so fail loudly instead
    if (argTemplate && (!process.stdout.isTTY || yes)) {
        throw new Error(`Unknown template: ${argTemplate}. Choose from: ${TEMPLATES.map((t) => t.name).join(', ')}`);
    }

    if (yes) return TEMPLATES[0].name;

    const template = await prompts.select({
        message: argTemplate
            ? `"${argTemplate}" isn't a valid template. Please choose from below: `
            : 'Select a template:',
        options: TEMPLATES.map((t) => ({
            label: t.color(t.display),
            value: t.name,
            hint: t.description
        }))
    });
    if (prompts.isCancel(template)) cancel();

    return template as string;
};
