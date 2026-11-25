import {
  contrastPairs,
  inertThemeTokens,
  irisValues,
  irisWideValues,
  reducedMotionTokens,
  type ThemeColorToken,
  type ThemeToken,
} from './theme-tokens.js'
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

type IrisValue = string | readonly [light: string, dark: string] | null
const iris = irisValues as Readonly<Record<string, IrisValue | undefined>>
const irisWide = irisWideValues as Readonly<Record<string, string | undefined>>

// One CSS value: nothing that can end a declaration, a rule or a <style>
// element, no comments or escapes, and balanced quotes and brackets.
function isSafeValue(value: string): boolean {
  if (!value.trim() || /[{};<>!\\\r\n]|\/\*|\*\//.test(value)) return false
  let quote: string | undefined
  const closers: string[] = []
  for (const character of value) {
    if (quote) {
      if (character === quote) quote = undefined
    } else if (character === '"' || character === "'") quote = character
    else if (character === '(') closers.push(')')
    else if (character === '[') closers.push(']')
    else if ((character === ')' || character === ']') && closers.pop() !== character) return false
  }
  return quote === undefined && closers.length === 0
}

function entries(values: Readonly<Record<string, string | undefined>> | undefined) {
  const result: [string, string][] = []
  for (const [token, value] of Object.entries(values ?? {})) {
    if (value === undefined) continue
    if (!/^--erx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(token)) {
      throw failure(
        'createTheme',
        `"${token}" is not an Eroxo token name`,
        'Use a name such as --erx-color-primary',
      )
    }
    if (reducedMotionTokens.includes(token)) {
      throw failure(
        'createTheme',
        `${token} follows the reduced-motion preference`,
        'Leave motion tokens out of themes, so reduced motion keeps working',
      )
    }
    if (typeof value !== 'string' || !isSafeValue(value)) {
      throw failure(
        'createTheme',
        `${token} has the unsupported value ${JSON.stringify(value)}`,
        'Use one CSS value with balanced quotes and brackets, and no braces, semicolons, angle brackets, comments, backslashes or !important',
      )
    }
    if (import.meta.env.DEV && inertThemeTokens.includes(token)) {
      warnInDevelopment(
        'createTheme',
        `${token} has no effect in a theme, because root or density aliases copy it`,
        'Set the token that uses it instead, such as --erx-radius-control for --erx-radius-md',
        themeDocs,
      )
    }
    result.push([token, value.trim()])
  }
  return result
}

const pair = (light: string, dark: string) =>
  light === dark ? light : `light-dark(${light}, ${dark})`

function irisMode(token: string, mode: 0 | 1): string | undefined {
  const value = iris[token]
  return typeof value === 'object' && value !== null ? value[mode] : undefined
}

// The Iris declaration of a token. An optional token becomes unset again.
function irisDeclaration(token: string): string {
  const value = iris[token]
  if (value === null || value === undefined) return 'initial'
  return typeof value === 'string' ? value : pair(value[0], value[1])
}

function references(value: string): string[] {
  return Array.from(value.matchAll(/var\((--erx-[a-z0-9-]+)\)/g), match => match[1]!)
}

// Color roles that read a changed token, directly or through other roles. A
// theme re-declares them, so that a new palette shade takes effect in a scope
// that no color-scheme rule re-declares, such as one that inherits its scheme.
function dependentRoles(changed: ReadonlySet<string>): string[] {
  const affected = new Set(changed)
  const roles: string[] = []
  for (let grew = true; grew;) {
    grew = false
    for (const [token, value] of Object.entries(iris)) {
      if (affected.has(token) || typeof value !== 'object' || value === null) continue
      if (value.some(raw => references(raw).some(name => affected.has(name)))) {
        affected.add(token)
        roles.push(token)
        grew = true
      }
    }
  }
  return roles
}

function block(selector: string, declarations: string[], indent = '  '): string {
  const body = declarations.map(declaration => `${indent}  ${declaration}\n`).join('')
  return `${indent}${selector} {\n${body}${indent}}\n`
}

/**
 * Creates a custom theme from partial token overrides and returns its static CSS.
 * Tokens the theme omits keep their Iris values for the same color scheme, and
 * colors that read a changed palette shade follow it. A nested scope with
 * `theme="iris"` returns to the Iris values. In development, it warns when a
 * documented contrast pair falls below its minimum.
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
  const shared = new Map(entries(definition.shared))
  const light = new Map(entries(definition.light))
  const dark = new Map(entries(definition.dark))
  const colors = new Set([...light.keys(), ...dark.keys()])
  const declarations: string[] = []
  for (const [token, value] of shared) {
    if (!colors.has(token)) declarations.push(`${token}: ${value};`)
  }
  for (const token of colors) {
    if (irisMode(token, 0) === undefined) {
      throw failure(
        'createTheme',
        `${token} is not an Iris color token`,
        'Set it in shared, or choose a color token from the token reference',
      )
    }
    // light-dark() follows the color-scheme of the element that uses the token,
    // so the theme works under an inherited, system or explicit color scheme.
    const lightValue = light.get(token) ?? shared.get(token) ?? irisMode(token, 0)!
    const darkValue = dark.get(token) ?? shared.get(token) ?? irisMode(token, 1)!
    declarations.push(`${token}: ${pair(lightValue, darkValue)};`)
  }
  const changed = new Set([...shared.keys(), ...colors])
  const dependents = dependentRoles(changed)
  for (const token of dependents) declarations.push(`${token}: ${irisDeclaration(token)};`)
  if (import.meta.env.DEV) checkContrast(name, shared, light, dark)

  const scope = `[data-erx-theme~='${name}']`
  const reset = `${scope} [data-erx-theme~='iris']`
  const resets = [...changed, ...dependents].map(token => `${token}: ${irisDeclaration(token)};`)
  const wideResets = [...changed]
    .filter(token => irisWide[token] !== undefined)
    .map(token => `${token}: ${irisWide[token]};`)
  let css =
    '@layer erx.tokens, erx.components;\n\n@layer erx.tokens {\n' + block(scope, declarations)
  if (resets.length > 0) {
    css += '\n  /* A nested scope with theme="iris" returns to the Iris values. */\n'
    css += block(reset, resets)
  }
  if (wideResets.length > 0) {
    css += '\n  @media (min-width: 48rem) {\n' + block(reset, wideResets, '    ') + '  }\n'
  }
  return { name, css: css + '}\n' }
}

function luminance(hex: string): number | undefined {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)
  if (!match) return undefined
  const digits = match[1]!.length === 3 ? match[1]!.replace(/./g, '&&') : match[1]!
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
      const value = values.get(token) ?? shared.get(token) ?? irisMode(token, index)
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
