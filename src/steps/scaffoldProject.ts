import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as prompts from '@clack/prompts'
import { copy } from '../utils/fs.js'
import { createEnvFile } from '../utils/dotenv'
import type { PkgInfo } from '../utils/packageManager.js'

interface Options {
  cwd: string
  targetDir: string
  template: string
  packageName: string
  renameFiles: Record<string, string | undefined>
  pkgInfo?: PkgInfo
}

export async function scaffoldProject(opts: Options): Promise<void> {
  const { cwd, targetDir, template, packageName, renameFiles, pkgInfo } = opts

  const root = path.join(cwd, targetDir)
  fs.mkdirSync(root, { recursive: true })

  // Generate a minimal .env file
  await createEnvFile({}, root)

  const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

  prompts.log.step(`Creating project in ${root}...`)

  // Locate template dir relative to this file
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    `../../src/templates/${template}`,
  )

  // Helper to write/copy files
  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  // Copy everything except package.json first
  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  // Read / patch / write package.json
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8')
  );

  pkg.name = packageName
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');

  // Final instructions
  let doneMessage = ''
  const cdProjectName = path.relative(cwd, root);

  doneMessage += `Project created. Now run:\n`;

  if (root !== cwd) {
    doneMessage += `\n  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`
  }
  switch (pkgManager) {
    case 'yarn':
      doneMessage += '\n  yarn'
      doneMessage += '\n  yarn dev'
      break
    default:
      doneMessage += `\n  ${pkgManager} install`
      doneMessage += `\n  ${pkgManager} run dev`
      break
  }
  prompts.outro(doneMessage)
} 