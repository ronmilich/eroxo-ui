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

export async function renderTokenCSS() {
  const dark = ':where([data-erx-theme="dark"])'
  const light = ':where([data-erx-theme="light"])'
  const system = ':root:where(:not([data-erx-theme="light"], [data-erx-theme="dark"]))'
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
