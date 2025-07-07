import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mri from 'mri'
import * as prompts from '@clack/prompts'
import { formatTargetDir } from './utils/fs.js'
import { getFullCustomCommand } from './utils/packageManager.js'
import { scaffoldProject } from './steps/scaffoldProject.js'
import type { PkgInfo } from './utils/packageManager.js'
import { FRAMEWORKS, TEMPLATES } from '../templates/index.js'

// Step helpers
import { getTargetDir } from './steps/getTargetDir.js'
import { handleExistingDir } from './steps/handleExistingDir.js'
import { getPackageName } from './steps/getPackageName.js'
import { chooseTemplate } from './steps/chooseTemplate.js'

const argv = mri<{
  template?: string
  help?: boolean
  overwrite?: boolean
  delete: string
}>(process.argv.slice(2), {
  alias: { h: 'help', t: 'template', d: 'delete' },
  boolean: ['help', 'overwrite'],
  string: ['template'],
})

const cwd = process.cwd()

const helpMessage = `\
Usage: create-playcanvas [OPTION]... [DIRECTORY]

Create a new PlayCanvas project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template
`

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

const defaultTargetDir = 'playcanvas-project'

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined
  const argTemplate = argv.template
  const argOverwrite = argv.overwrite

  const help = argv.help
  if (help) {
    console.log(helpMessage)
    return
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
  const cancel = () => prompts.cancel('Operation cancelled') as never

  // 1. Get project name and target dir
  const targetDir = await getTargetDir({ argTargetDir, defaultTargetDir, cancel })

  // 2. Handle directory if exist and not empty
  await handleExistingDir({ targetDir, argOverwrite, cancel })

  // 3. Get package name
  const packageName = await getPackageName({ targetDir, cancel })

  // 4. Choose a framework and variant
  const template = await chooseTemplate({
    argTemplate,
    FRAMEWORKS,
    TEMPLATES,
    pkgInfo,
    getFullCustomCommand,
    cancel,
  })

  // 5. Scaffold project
  await scaffoldProject({
    cwd,
    targetDir,
    template,
    packageName,
    renameFiles,
    pkgInfo,
  })
}

function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
  if (!userAgent) return undefined
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

init().catch((e) => {
  console.error(e)
})