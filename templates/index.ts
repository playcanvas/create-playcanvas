import colors from 'picocolors'

/**
 * You can add new frameworks here.
 * 
 * The framework name is used to create the directory name.
 * The framework display name is used to display the framework name in the CLI.
 * The framework description is used to display the framework description in the CLI.
 * The framework color is used to display the framework color in the CLI.
 * The framework variants are used to display the framework variants in the CLI.
 * 
 */
export const FRAMEWORKS: Framework[] = [
]

export const TEMPLATES = FRAMEWORKS.flatMap((f) => f.variants.map((v) => v.name)) 

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
