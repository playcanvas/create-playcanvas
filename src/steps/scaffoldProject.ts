import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prompts from '@clack/prompts';

import { FEATURES, STARTERS } from '../../templates/index.js';

const PACKAGE_MAPS = ['scripts', 'dependencies', 'devDependencies', 'peerDependencies', 'engines'] as const;
const README_SECTION = '## Prerequisites';
const SKILLS_SECTION = '## Agent skills';

// the package managers whose commands the README and the closing message give; any other, such as
// Deno, gets npm's
const PKG_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

// how each installs a project's dependencies and runs one of its scripts
const pkgCommands = (pkgManager: string) =>
    pkgManager === 'yarn'
        ? { install: 'yarn', run: 'yarn' }
        : { install: `${pkgManager} install`, run: `${pkgManager} run` };

type Options = {
    cwd: string;
    targetDir: string;
    format: string;
    starter: string;
    packageName: string;
    skills: boolean;
    renameFiles: Record<string, string>;
    // defaults to the templates shipped with the CLI; tests point it at fixtures
    templatesDir?: string;
};

export const scaffoldProject = (opts: Options) => {
    const { cwd, targetDir, format, starter, packageName, skills, renameFiles } = opts;

    const root = path.resolve(cwd, targetDir);
    fs.mkdirSync(root, { recursive: true });

    const agent = process.env.npm_config_user_agent?.split('/')[0] ?? 'npm';
    const pkgManager = PKG_MANAGERS.includes(agent) ? agent : 'npm';
    const { install, run } = pkgCommands(pkgManager);

    prompts.log.step(`Creating project in ${root}...`);

    // Locate template dir - works in both dev (src/steps/) and prod (dist/)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatesDir =
        opts.templatesDir ??
        [
            path.resolve(__dirname, '../templates'), // prod: dist/index.mjs → ../templates
            path.resolve(__dirname, '../../templates') // dev: src/steps/scaffoldProject.ts → ../../templates
        ].find((p) => fs.existsSync(path.join(p, format)));
    if (!templatesDir) {
        throw new Error(`Format directory not found for: ${format}`);
    }

    const selected = STARTERS.find((s) => s.name === starter);
    if (!selected) {
        throw new Error(`Starter not found: ${starter}`);
    }

    const sharedDir = path.join(templatesDir, '_shared', starter);
    const starterDir = path.join(templatesDir, format, starter);
    if (!fs.existsSync(starterDir)) {
        throw new Error(`Starter directory not found: ${format}/${starter}`);
    }

    // Layers apply in this order, and a file in a later layer replaces the same file in an earlier
    // one: files every project gets, the format's tooling, the starter's format-independent files,
    // the features it uses, then the starter's own files for this format
    const layers = [
        path.join(templatesDir, '_common'),
        path.join(templatesDir, format, 'base'),
        sharedDir,
        ...(selected.features ?? []).flatMap((feature) =>
            FEATURES[feature][format].map((layer) => path.join(templatesDir, '_features', feature, layer))
        ),
        starterDir
    ].filter((dir) => fs.existsSync(dir));

    // package.json files are merged in the same order instead, and the shared README.md is spliced
    // into the base README rather than replacing it
    const sharedReadme = path.join(sharedDir, 'README.md');
    for (const dir of layers) {
        const manifest = path.join(dir, 'package.json');
        fs.cpSync(dir, root, { recursive: true, filter: (src) => src !== manifest && src !== sharedReadme });
    }

    const readmePath = path.join(root, 'README.md');
    if (fs.existsSync(readmePath)) {
        let readme = fs.readFileSync(readmePath, 'utf8');
        if (fs.existsSync(sharedReadme)) {
            const section = `${fs.readFileSync(sharedReadme, 'utf8').trimEnd()}\n\n${README_SECTION}`;
            // a function, so a `$` in the README is not read as a replacement pattern
            readme = readme.replace(README_SECTION, () => section);
        }
        if (!skills) {
            readme = readme
                .split(/^(?=## )/m)
                .filter((section) => !section.startsWith(SKILLS_SECTION))
                .join('');
        }
        // the READMEs give npm commands, so name the package manager that ran the creator instead. Only
        // npm needs `--` before the script's own arguments; pnpm would pass it on to the script
        if (pkgManager !== 'npm') {
            readme = readme
                .replace(/\bnpm run ([^\s`]+) -- /g, `${run} $1 `)
                .replace(/\bnpm run\b/g, run)
                .replace(/\bnpm install\b/g, install);
        }
        fs.writeFileSync(readmePath, readme);
    }

    for (const [from, to] of Object.entries(renameFiles)) {
        const fromPath = path.join(root, from);
        if (fs.existsSync(fromPath)) {
            fs.renameSync(fromPath, path.join(root, to));
        }
    }

    const manifests = layers
        .map((dir) => path.join(dir, 'package.json'))
        .filter((file) => fs.existsSync(file))
        .map((file) => JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>);
    const pkg = Object.assign({}, ...manifests) as Record<string, unknown>;
    for (const key of PACKAGE_MAPS) {
        const value = Object.assign(
            {},
            ...manifests.map((part) => part[key] as Record<string, unknown> | undefined)
        ) as Record<string, unknown>;
        // sort, so keys a starter adds land in order, as npm writes them and the project's lint expects
        const entries = Object.entries(value).sort(([a], [b]) => (a > b ? 1 : -1));
        if (entries.length) pkg[key] = Object.fromEntries(entries);
        else delete pkg[key];
    }
    pkg.name = packageName;
    fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg, null, 4) + '\n');

    if (skills) {
        const skillsDir = [
            path.resolve(__dirname, '../skills'), // prod: dist/index.mjs → ../skills
            path.resolve(__dirname, '../../skills') // dev: src/steps → ../../skills
        ].find((p) => fs.existsSync(p));
        if (!skillsDir) {
            throw new Error('Skills directory not found');
        }

        // one skill set feeds every agent: .claude/skills for Claude Code, .agents/skills for Codex and Cursor
        const names = fs
            .readdirSync(skillsDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        for (const dir of ['.claude/skills', '.agents/skills']) {
            for (const name of names) {
                fs.cpSync(path.join(skillsDir, name), path.join(root, dir, name), {
                    recursive: true
                });
            }
        }
        prompts.log.step('Added PlayCanvas agent skills (opt out with --no-skills)');
    }

    let doneMessage = 'Project created. Now run:\n';
    const cdProjectName = path.isAbsolute(targetDir) ? root : path.relative(cwd, root);

    if (root !== cwd) {
        doneMessage += `\n  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`;
    }
    doneMessage += `\n  ${install}`;
    doneMessage += `\n  ${run} dev`;
    prompts.outro(doneMessage);
};
