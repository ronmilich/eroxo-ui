import { contrastPairs, irisColors, type ThemeColorToken, type ThemeToken } from './theme-tokens.js'
import { warnInDevelopment } from './warnings.js'

export type { ThemeColorToken, ThemeToken }

export const themeDocs = 'https://github.com/ronmilich/eroxo-ui/blob/main/docs/ul-18-theming-api.md'

/** A color scheme setting. `system` follows the operating system preference. */
export type ColorScheme = 'light' | 'dark' | 'system'

export const colorSchemes: readonly ColorScheme[] = ['light', 'dark', 'system']

/** A custom theme returned by `createTheme`. */
export interface CustomTheme {
  /** The name that `ThemeScope` and `themeScript` write to `data-erx-theme`. */
  readonly name: string
  /** Static CSS for the theme. Load it once, in a stylesheet or a `<style>` element. */
  readonly css: string
}

/** Token values for `createTheme`. Each value is one CSS value, such as `#1c61bf` or `4px`. */
export interface ThemeDefinition {
  /** Tokens for both color schemes. */
  readonly shared?: Readonly<Partial<Record<ThemeToken, string>>>
  /** Colors for light mode. An omitted color uses its shared value or the Iris light value. */
  readonly light?: Readonly<Partial<Record<ThemeColorToken, string>>>
  /** Colors for dark mode. An omitted color uses its shared value or the Iris dark value. */
  readonly dark?: Readonly<Partial<Record<ThemeColorToken, string>>>
}

/** Whether `name` can be a custom theme name: a lowercase token that isn't reserved. */
export function isThemeName(name: unknown): name is string {
  return (
    typeof name === 'string' &&
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name) &&
    !['light', 'dark', 'system', 'iris'].includes(name)
  )
}

export function failure(component: string, problem: string, fix: string): TypeError {
  return new TypeError(`[eroxo-ui] ${component}: ${problem}. ${fix}. ${themeDocs}`)
}

type Values = Readonly<Record<string, string | undefined>>

function entries(values: Values | undefined, component: string): [string, string][] {
  const result: [string, string][] = []
  for (const [token, value] of Object.entries(values ?? {})) {
    if (value === undefined) continue
    if (!/^--erx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(token)) {
      throw failure(
        component,
        `"${token}" is not an Eroxo token name`,
        'Use a name such as --erx-color-primary',
      )
    }
    if (typeof value !== 'string' || !value.trim() || /[{};<>!]/.test(value)) {
      throw failure(
        component,
        `${token} has the unsupported value ${JSON.stringify(value)}`,
        'Use one CSS value without braces, semicolons, angle brackets or !important',
      )
    }
    result.push([token, value.trim()])
  }
  return result
}

function irisValue(token: string, mode: 0 | 1): string | undefined {
  const value = (irisColors as Readonly<Record<string, string | readonly [string, string]>>)[token]
  return typeof value === 'string' ? value : value?.[mode]
}

/**
 * Creates a custom theme from partial token overrides and returns its static CSS.
 * Tokens the theme omits keep their Iris values for the same color scheme.
 * In development, it warns when a documented contrast pair falls below its minimum.
 * @example
 * const acme = createTheme('acme', {
 *   light: { '--erx-color-primary': '#1c61bf' },
 *   dark: { '--erx-color-primary': '#8fb8ff' },
 * })
 */
export function createTheme(name: string, definition: ThemeDefinition): CustomTheme {
  if (!isThemeName(name)) {
    throw failure(
      'createTheme',
      `${JSON.stringify(name)} is not a valid theme name`,
      'Use lowercase letters, digits and single hyphens, and avoid light, dark, system and iris',
    )
  }
  const shared = new Map(entries(definition.shared, 'createTheme'))
  const light = new Map(entries(definition.light, 'createTheme'))
  const dark = new Map(entries(definition.dark, 'createTheme'))
  const declarations: string[] = []
  for (const [token, value] of shared) {
    if (!light.has(token) && !dark.has(token)) declarations.push(`${token}: ${value};`)
  }
  for (const token of new Set([...light.keys(), ...dark.keys()])) {
    if (irisValue(token, 0) === undefined) {
      throw failure(
        'createTheme',
        `${token} is not an Iris color token`,
        'Set it in shared, or choose a color token from the token reference',
      )
    }
    const lightValue = light.get(token) ?? shared.get(token) ?? irisValue(token, 0)
    const darkValue = dark.get(token) ?? shared.get(token) ?? irisValue(token, 1)
    // light-dark() follows the color-scheme of the element that uses the token,
    // so the theme works under an inherited, system or explicit color scheme.
    const value = lightValue === darkValue ? lightValue : `light-dark(${lightValue}, ${darkValue})`
    declarations.push(`${token}: ${value};`)
  }
  if (import.meta.env.DEV) checkContrast(name, shared, light, dark)
  const body = declarations.map(declaration => `    ${declaration}\n`).join('')
  return {
    name,
    css:
      '@layer erx.tokens, erx.components;\n\n@layer erx.tokens {\n' +
      `  [data-erx-theme~='${name}'] {\n${body}  }\n}\n`,
  }
}

function luminance(hex: string): number | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)
  if (!match) return undefined
  const digits = match[1]!.length === 3 ? match[1]!.replace(/./g, '$&$&') : match[1]!
  const [red = 0, green = 0, blue = 0] = (digits.match(/../g) ?? []).map(pair => {
    const value = Number.parseInt(pair, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

function checkContrast(
  name: string,
  shared: Map<string, string>,
  light: Map<string, string>,
  dark: Map<string, string>,
) {
  const failures: string[] = []
  for (const [mode, values, index] of [
    ['light', light, 0],
    ['dark', dark, 1],
  ] as const) {
    const resolve = (token: string, depth = 0): string | undefined => {
      const value = values.get(token) ?? shared.get(token) ?? irisValue(token, index)
      const reference = value && /^var\((--erx-[a-z0-9-]+)\)$/.exec(value)
      return reference && depth < 8 ? resolve(reference[1]!, depth + 1) : value
    }
    for (const [foreground, background, minimum] of contrastPairs) {
      const a = luminance(resolve(foreground) ?? '')
      const b = luminance(resolve(background) ?? '')
      if (a === undefined || b === undefined) continue
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      if (ratio < minimum) {
        failures.push(
          `${mode} ${foreground} on ${background} measures ${ratio.toFixed(2)}:1, below ${minimum}:1`,
        )
      }
    }
  }
  if (failures.length > 0) {
    warnInDevelopment(
      'createTheme',
      `Theme "${name}" fails ${failures.length} contrast ${failures.length === 1 ? 'check' : 'checks'}: ${failures.join('; ')}`,
      'Adjust the colors until each pair meets its minimum',
      themeDocs,
    )
  }
}
