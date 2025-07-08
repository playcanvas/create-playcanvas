import * as prompts from '@clack/prompts'

export async function chooseTemplate({
  argTemplate,
  FRAMEWORKS,
  TEMPLATES,
  pkgInfo,
  getFullCustomCommand,
  cancel,
}: {
  argTemplate?: string
  FRAMEWORKS: Framework[]
  TEMPLATES: string[]
  pkgInfo?: PkgInfo
  getFullCustomCommand: (customCommand: string, pkgInfo?: PkgInfo) => string
  cancel: () => never
}): Promise<string> {
  let template = argTemplate
  let hasInvalidArgTemplate = false

  if (argTemplate && !TEMPLATES.includes(argTemplate)) {
    template = undefined
    hasInvalidArgTemplate = true
  }

  if (!template) {
    const framework = await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. Please choose from below: `
        : 'Select a framework:',
      options: FRAMEWORKS.map((framework) => {
        const frameworkColor = framework.color
        return {
          label: frameworkColor(framework.display || framework.name),
          value: framework,
          hint: framework.description,
        }
      }),
    })
    if (prompts.isCancel(framework)) return cancel()

    await prompts.select({
      message: 'Select a variant:',
      options: framework.variants.map((variant) => {
        const variantColor = variant.color
        const command = variant.customCommand
          ? getFullCustomCommand(variant.customCommand, pkgInfo).replace(
              / TARGET_DIR$/,
              '',
            )
          : undefined
        return {
          label: variantColor(variant.display || variant.name),
          value: variant.name,
          hint: command,
        }
      }),
    })

    template = framework.variants[0].name
  }

  return template!
} 

// Types replicated locally to avoid cross-file dependencies
export type ColorFunc = (str: string | number) => string

export type FrameworkVariant = {
  name: string
  display: string
  color: ColorFunc
  customCommand?: string
}
export type Framework = {
  name: string
  display: string
  color: ColorFunc
  description?: string
  variants: FrameworkVariant[]
}
interface PkgInfo {
  name: string
  version: string
}