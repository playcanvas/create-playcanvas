import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prompts from '@clack/prompts';

import { FORMATS, STARTERS } from '../../templates/index.js';

const PACKAGE_MAPS = ['scripts', 'dependencies', 'devDependencies', 'peerDependencies', 'engines'] as const;
const TEMPLATE_ENTRIES: Record<string, string> = {
    engine: 'src/main.ts',
    react: 'src/App.tsx',
    'web-components': 'src/main.ts'
};

type Options = {
    cwd: string;
    targetDir: string;
    format: string;
    starter: string;
    packageName: string;
    skills: boolean;
    renameFiles: Record<string, string>;
};

export const scaffoldProject = (opts: Options) => {
    const { cwd, targetDir, format, starter, packageName, skills, renameFiles } = opts;

    const root = path.resolve(cwd, targetDir);
    fs.mkdirSync(root, { recursive: true });

    const pkgManager = process.env.npm_config_user_agent?.split('/')[0] ?? 'npm';

    prompts.log.step(`Creating project in ${root}...`);

    // Locate template dir - works in both dev (src/steps/) and prod (dist/)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const possiblePaths = [
        path.resolve(__dirname, '../templates'), // prod: dist/index.mjs → ../templates
        path.resolve(__dirname, '../../templates') // dev: src/steps/scaffoldProject.ts → ../../templates
    ];
    const templatesDir = possiblePaths.find((p) => fs.existsSync(path.join(p, format)));
    if (!templatesDir) {
        throw new Error(`Format directory not found for: ${format}`);
    }
    const formatDir = path.join(templatesDir, format);

    for (const f of FORMATS) {
        for (const s of STARTERS) {
            const dir = path.join(templatesDir, f.name, s.name);
            const entry = TEMPLATE_ENTRIES[f.name];
            if (!entry || !fs.existsSync(path.join(dir, entry))) {
                throw new Error(`Incomplete starter matrix: ${f.name}/${s.name}`);
            }
        }
    }

    // shared concept files, format tooling, then format-specific scene files
    const dirs = [
        path.join(templatesDir, '_shared', starter),
        path.join(formatDir, 'base'),
        path.join(formatDir, starter)
    ];
    const manifests = dirs.map((dir) => {
        const file = path.join(dir, 'package.json');
        return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf-8')) as Record<string, unknown>) : {};
    });
    const mergeOrder = [manifests[1], manifests[0], manifests[2]];

    for (const dir of dirs) {
        if (dir === dirs[2] && !fs.existsSync(dir)) {
            throw new Error(`Starter directory not found: ${format}/${starter}`);
        }
        if (fs.existsSync(dir)) {
            fs.cpSync(dir, root, { recursive: true });
        }
    }

    for (const [from, to] of Object.entries(renameFiles)) {
        const fromPath = path.join(root, from);
        if (fs.existsSync(fromPath)) {
            fs.renameSync(fromPath, path.join(root, to));
        }
    }

    const pkgPath = path.join(root, 'package.json');
    const pkg = Object.assign({}, ...mergeOrder) as Record<string, unknown>;
    for (const key of PACKAGE_MAPS) {
        const value = Object.assign(
            {},
            ...mergeOrder.map((part) => part?.[key] as Record<string, unknown> | undefined)
        );
        if (Object.keys(value).length) pkg[key] = value;
        else delete pkg[key];
    }
    pkg.name = packageName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');

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
    switch (pkgManager) {
        case 'yarn':
            doneMessage += '\n  yarn';
            doneMessage += '\n  yarn dev';
            break;
        default:
            doneMessage += `\n  ${pkgManager} install`;
            doneMessage += `\n  ${pkgManager} run dev`;
            break;
    }
    prompts.outro(doneMessage);
};
