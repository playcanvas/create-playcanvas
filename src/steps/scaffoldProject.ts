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
    renameFiles: Record<string, string>;
};

export const scaffoldProject = (opts: Options) => {
    const { cwd, targetDir, template, boilerplate, packageName, renameFiles } = opts;

    const root = path.resolve(cwd, targetDir);
    fs.mkdirSync(root, { recursive: true });

    const pkgManager = process.env.npm_config_user_agent?.split('/')[0] ?? 'npm';

    prompts.log.step(`Creating project in ${root}...`);

    // Locate template dir - works in both dev (src/steps/) and prod (dist/)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const possiblePaths = [
        path.resolve(__dirname, '../templates', template), // prod: dist/index.mjs → ../templates
        path.resolve(__dirname, '../../templates', template) // dev: src/steps/scaffoldProject.ts → ../../templates
    ];
    const templateDir = possiblePaths.find((p) => fs.existsSync(p));
    if (!templateDir) {
        throw new Error(`Template directory not found for: ${template}`);
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
