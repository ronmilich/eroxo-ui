import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

export const iris = JSON.parse(
  readFileSync(new URL('../tokens/iris.json', import.meta.url), 'utf8'),
)

const shared = {}
const themes = { light: {}, dark: {} }

for (const { primitives, roles } of Object.values(iris.groups)) {
  Object.assign(shared, primitives)
  for (const [name, value] of Object.entries(roles)) {
    if (Array.isArray(value)) {
      const [light, dark] = value
      themes.light[name] = light
      themes.dark[name] = dark
    } else {
      shared[name] = value
    }
  }
}

function references(value) {
  return Array.from(value.matchAll(/var\(--erx-([a-z0-9-]+)\)/g), match => match[1])
}

function aliasesOf(names) {
  const changed = new Set(names)
  const aliases = {}
  let previousSize
  do {
    previousSize = changed.size
    for (const [name, value] of Object.entries(shared)) {
      if (!changed.has(name) && references(value).some(reference => changed.has(reference))) {
        changed.add(name)
        aliases[name] = value
      }
    }
  } while (changed.size !== previousSize)
  return aliases
}

function declarations(values) {
  return Object.entries(values)
    .map(([name, value]) => '    --erx-' + name + ': ' + value + ';\n')
    .join('')
}

function rule(selector, values, scheme) {
  return (
    '  ' +
    selector +
    ' {\n' +
    (scheme ? '    color-scheme: ' + scheme + ';\n' : '') +
    declarations(values) +
    '  }\n'
  )
}

function media(query, rule) {
  return '  @media (' + query + ') {\n' + rule.trimEnd().replace(/^/gm, '  ') + '\n  }\n'
}

// data-erx-theme holds a space-separated list: an optional custom theme name
// and a color scheme, for example "acme dark". Every selector here has zero
// specificity so that custom theme rules in the same layer always win.
const scheme = name => '[data-erx-theme~="' + name + '"]'

export async function renderTokenCSS() {
  const dark = ':where(' + scheme('dark') + ')'
  const light = ':where(' + scheme('light') + ', ' + scheme('system') + ')'
  // The root follows the system preference unless it selects light or dark.
  const system =
    ':where(:root:not(' +
    scheme('light') +
    ', ' +
    scheme('dark') +
    ')),\n  :where(' +
    scheme('system') +
    ')'
  const motion = { ...iris.reduced, ...aliasesOf(Object.keys(iris.reduced)) }

  const rules = [
    rule(':root', shared),
    rule(':where(:root),\n  ' + light, themes.light, 'light'),
    media('prefers-color-scheme: dark', rule(system, themes.dark, 'dark')),
    rule(dark, themes.dark, 'dark'),
    rule(':where([data-erx-theme])', aliasesOf(Object.keys(themes.light))),
    ...['standard', 'compact', 'comfortable'].map(name => {
      const scope = ':where([data-erx-density="' + name + '"])'
      return rule(name === 'standard' ? ':where(:root),\n  ' + scope : scope, iris.density[name])
    }),
    media('min-width: 48rem', rule(':root', iris.wide)),
    media('prefers-reduced-motion: reduce', rule(':root', motion)),
    rule(':where([data-erx-motion="reduce"])', motion),
  ]

  const stylesheet =
    '@layer erx.tokens, erx.components;\n\n/* Generated from tokens/iris.json. Run pnpm generate:tokens. */\n@layer erx.tokens {\n' +
    rules.join('\n') +
    '}\n'
  const filepath = fileURLToPath(new URL('../src/tokens.css', import.meta.url))
  return format(stylesheet, { filepath, ...(await resolveConfig(filepath)) })
}

// A custom theme scope can override a token only when every use reads it
// inside the scope. Exclude tokens copied by root-only aliases or density
// aliases, which resolve before the scope, and the motion tokens that reduced
// motion replaces, so a theme can't defeat that preference.
export function themeTokenNames() {
  const themeAliases = new Set(Object.keys(aliasesOf(Object.keys(themes.light))))
  const reduced = new Set([
    ...Object.keys(iris.reduced),
    ...Object.keys(aliasesOf(Object.keys(iris.reduced))),
  ])
  const copied = new Set()
  for (const [name, value] of Object.entries(shared)) {
    if (!themeAliases.has(name)) for (const reference of references(value)) copied.add(reference)
  }
  for (const values of Object.values(iris.density)) {
    for (const value of Object.values(values)) {
      for (const reference of references(value)) copied.add(reference)
    }
  }
  const allowed = name => !copied.has(name) && !reduced.has(name)
  const names = ({ primitives, roles }) => [...Object.keys(primitives), ...Object.keys(roles)]
  return {
    color: names(iris.groups.Color).filter(allowed),
    all: [
      ...new Set([
        ...Object.values(iris.groups).flatMap(names).filter(allowed),
        ...Object.keys(iris.optional),
      ]),
    ],
  }
}

export async function renderThemeTokens() {
  const { color, all } = themeTokenNames()
  const colors = new Set(color)
  const literal = name => "'--erx-" + name + "'"
  const union = names => names.map(name => '\n  | ' + literal(name)).join('')
  const value = name => {
    const raw = shared[name] ?? [themes.light[name], themes.dark[name]]
    return JSON.stringify(raw)
  }
  const source = [
    '// Generated from tokens/iris.json. Run pnpm generate:tokens.',
    '',
    '/** An Iris color token that a custom theme can set separately for light and dark mode. */',
    'export type ThemeColorToken =' + union(color),
    '',
    '/**',
    ' * An Iris token that a custom theme can set. Tokens copied by root or density',
    ' * aliases, and motion tokens that reduced motion replaces, are excluded.',
    ' */',
    'export type ThemeToken =\n  | ThemeColorToken' + union(all.filter(name => !colors.has(name))),
    '',
    '/** Iris color values before var() references resolve: one value, or light and dark. */',
    'export const irisColors: Readonly<',
    '  Record<ThemeColorToken, string | readonly [light: string, dark: string]>',
    '> = {',
    ...color.map(name => '  ' + literal(name) + ': ' + value(name) + ','),
    '}',
    '',
    '/** Documented contrast pairs: foreground, background and the minimum ratio. */',
    'export const contrastPairs: readonly (readonly [ThemeColorToken, ThemeColorToken, number])[] = [',
    ...iris.contrast.map(
      ([foreground, background, minimum]) =>
        '  [' + literal(foreground) + ', ' + literal(background) + ', ' + minimum + '],',
    ),
    ']',
    '',
  ].join('\n')
  const filepath = fileURLToPath(new URL('../src/internal/theme-tokens.ts', import.meta.url))
  return format(source, { filepath, ...(await resolveConfig(filepath)) })
}

// The opt-in Tailwind v4 bridge maps semantic roles into Tailwind theme
// namespaces. `inline` makes each utility read the Eroxo variable where it is
// used, so utilities follow nested theme and density scopes.
export function tailwindTokens() {
  const roles = group => Object.keys(iris.groups[group].roles)
  const map = (names, prefix, namespace) =>
    names
      .filter(name => name.startsWith(prefix))
      .map(name => [namespace + '-erx-' + name.slice(prefix.length), name])
  return [
    ...map(roles('Color'), 'color-', 'color'),
    ...map(roles('Shape and borders'), 'radius-', 'radius'),
    ...map(roles('Elevation and depth'), 'elevation-', 'shadow'),
    ...map(Object.keys(iris.groups.Typography.primitives), 'font-', 'font').filter(
      ([, name]) => !name.startsWith('font-weight-'),
    ),
    ...map(Object.keys(iris.density.standard), 'density-', 'spacing'),
  ]
}

export async function renderTailwindCSS() {
  const css =
    '/* Generated from tokens/iris.json. Run pnpm generate:tokens. */\n' +
    '/* Opt-in Tailwind v4 bridge: import it after tailwindcss. docs/customization.md lists the layer order. */\n' +
    '@theme inline {\n' +
    tailwindTokens()
      .map(([variable, token]) => '  --' + variable + ': var(--erx-' + token + ');\n')
      .join('') +
    '}\n'
  const filepath = fileURLToPath(new URL('../src/tailwind.css', import.meta.url))
  return format(css, { filepath, ...(await resolveConfig(filepath)) })
}

export function resolveToken(name, mode, trail = []) {
  if (trail.includes(name))
    throw new Error('Circular token reference: ' + [...trail, name].join(' → '))
  const value = themes[mode][name] ?? shared[name]
  if (value === undefined) throw new Error('Unknown token --erx-' + name)
  return value.replace(/var\(--erx-([a-z0-9-]+)\)/g, (_, ref) =>
    resolveToken(ref, mode, [...trail, name]),
  )
}

export function contrastRatio(foreground, background) {
  function luminance(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Expected opaque sRGB hex: ' + hex)
    const linear = hex
      .slice(1)
      .match(/../g)
      .map(pair => {
        const value = parseInt(pair, 16) / 255
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
      })
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
  }

  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
