import * as prompts from '@clack/prompts';

import { TEMPLATES } from '../../templates/index.js';

export const chooseTemplate = async ({ argTemplate, cancel }: { argTemplate?: string; cancel: () => never }) => {
    if (argTemplate && TEMPLATES.some((t) => t.name === argTemplate)) return argTemplate;

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
