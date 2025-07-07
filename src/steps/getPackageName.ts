import path from 'node:path'
import * as prompts from '@clack/prompts'
import { isValidPackageName, toValidPackageName } from '../utils.js'

export async function getPackageName({
  targetDir,
  cancel,
}: {
  targetDir: string
  cancel: () => never
}): Promise<string> {
  let packageName = path.basename(path.resolve(targetDir))

  if (!isValidPackageName(packageName)) {
    const packageNameResult = await prompts.text({
      message: 'Package name:',
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return 'Invalid package.json name'
        }
      },
    })
    if (prompts.isCancel(packageNameResult)) return cancel()
    packageName = packageNameResult as string
  }

  return packageName
} 