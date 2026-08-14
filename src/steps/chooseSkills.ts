import * as prompts from '@clack/prompts';

export const chooseSkills = async ({
    argSkills,
    yes,
    cancel
}: {
    argSkills?: boolean;
    yes?: boolean;
    cancel: () => never;
}) => {
    if (argSkills !== undefined) return argSkills;

    // no TTY or --yes takes the default rather than blocking on a prompt
    if (!process.stdout.isTTY || yes) return true;

    const skills = await prompts.confirm({
        message: 'Include PlayCanvas agent skills?',
        initialValue: true
    });
    if (prompts.isCancel(skills)) cancel();

    return skills as boolean;
};
