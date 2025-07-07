import fs from 'node:fs'
import * as prompts from '@clack/prompts'
import { isEmpty, emptyDir } from '../utils/fs.js'

export async function handleExistingDir({
  targetDir,
  argOverwrite,
  cancel,
}: {
  targetDir: string
  argOverwrite?: boolean
  cancel: () => never
}): Promise<void> {
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? 'yes'
      : await prompts.select({
          message:
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          options: [
            { label: 'Cancel operation', value: 'no' },
            { label: 'Remove existing files and continue', value: 'yes' },
            { label: 'Ignore files and continue', value: 'ignore' },
          ],
        })

    if (prompts.isCancel(overwrite)) return cancel()

    switch (overwrite) {
      case 'yes':
        emptyDir(targetDir)
        break
      case 'no':
        cancel()
        return
    }
  }
} 