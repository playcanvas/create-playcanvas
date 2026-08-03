import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as prompts from '@clack/prompts';

type Options = {
    cwd: string;
    targetDir: string;
    template: string;
    packageName: string;
    renameFiles: Record<string, string | undefined>;
};

export const scaffoldProject = (opts: Options) => {
    const { cwd, targetDir, template, packageName, renameFiles } = opts;

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

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file);
        if (content !== undefined) {
            fs.writeFileSync(targetPath, content);
        } else {
            fs.cpSync(path.join(templateDir, file), targetPath, { recursive: true });
        }
    };

    const files = fs.readdirSync(templateDir);
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file);
    }

    const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'));

    pkg.name = packageName;
    write('package.json', JSON.stringify(pkg, null, 4) + '\n');

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
