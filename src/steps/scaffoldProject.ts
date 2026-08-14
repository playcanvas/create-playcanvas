import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prompts from '@clack/prompts';

type Options = {
    cwd: string;
    targetDir: string;
    template: string;
    boilerplate: string;
    packageName: string;
    skills: boolean;
    renameFiles: Record<string, string>;
};

export const scaffoldProject = (opts: Options) => {
    const { cwd, targetDir, template, boilerplate, packageName, skills, renameFiles } = opts;

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
    const templatesDir = possiblePaths.find((p) => fs.existsSync(path.join(p, template)));
    if (!templatesDir) {
        throw new Error(`Template directory not found for: ${template}`);
    }
    const templateDir = path.join(templatesDir, template);

    // Assets a boilerplate needs in every template are held once in _shared and seeded from there,
    // so a model or texture is not duplicated per template
    const sharedDir = path.join(templatesDir, '_shared', boilerplate);
    if (fs.existsSync(sharedDir)) {
        fs.cpSync(sharedDir, root, { recursive: true });
    }

    // Shared tooling first, then the boilerplate over the top - a boilerplate file of the same name
    // wins. ponytail: a boilerplate needing extra dependencies has to ship a whole package.json;
    // merge the dependency maps instead if that becomes common.
    for (const layer of ['base', boilerplate]) {
        const layerDir = path.join(templateDir, layer);
        if (!fs.existsSync(layerDir)) {
            throw new Error(`Boilerplate directory not found: ${template}/${layer}`);
        }
        fs.cpSync(layerDir, root, { recursive: true });
    }

    for (const [from, to] of Object.entries(renameFiles)) {
        const fromPath = path.join(root, from);
        if (fs.existsSync(fromPath)) {
            fs.renameSync(fromPath, path.join(root, to));
        }
    }

    const pkgPath = path.join(root, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
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
        prompts.log.step('Added PlayCanvas agent skills');
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
