import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import {
  contrastRatio,
  iris,
  renderTailwindCSS,
  renderThemeTokens,
  renderTokenCSS,
  resolveToken,
  tailwindTokens,
  themeTokenNames,
} from '../scripts/iris-tokens.mjs'

test('checked-in token CSS matches the Iris source', async () => {
  const css = await readFile(new URL('../src/tokens.css', import.meta.url), 'utf8')
  const generated = await renderTokenCSS()
  assert.equal(css.replaceAll('\r\n', '\n'), generated, 'Run pnpm generate:tokens')
})

test('checked-in theme token types match the Iris source', async () => {
  const source = await readFile(new URL('../src/internal/theme-tokens.ts', import.meta.url), 'utf8')
  assert.equal(
    source.replaceAll('\r\n', '\n'),
    await renderThemeTokens(),
    'Run pnpm generate:tokens',
  )
})

test('checked-in Tailwind bridge matches the Iris source', async () => {
  const source = await readFile(new URL('../src/tailwind.css', import.meta.url), 'utf8')
  assert.equal(
    source.replaceAll('\r\n', '\n'),
    await renderTailwindCSS(),
    'Run pnpm generate:tokens',
  )
})

test('the Tailwind bridge maps only semantic roles into Tailwind namespaces', () => {
  const mapped = new Map(tailwindTokens())
  assert.equal(mapped.size, tailwindTokens().length, 'Duplicate Tailwind variable')
  assert.equal(mapped.get('color-erx-surface'), 'color-surface')
  assert.equal(mapped.get('radius-erx-control'), 'radius-control')
  assert.equal(mapped.get('shadow-erx-popover'), 'elevation-popover')
  assert.equal(mapped.get('font-erx-sans'), 'font-sans')
  assert.equal(mapped.get('spacing-erx-card-padding'), 'density-card-padding')
  for (const [variable] of mapped) {
    assert.match(variable, /^(color|radius|shadow|font|spacing)-erx-[a-z0-9-]+$/)
    assert.doesNotMatch(variable, /-erx-(iris|neutral|success|error|warning|info)-\d|z-|weight/)
  }
})

test('custom themes can set only tokens that every use reads inside the scope', () => {
  const { color, all } = themeTokenNames()
  for (const name of ['color-primary', 'iris-700', 'radius-control', 'font-sans', 'shadow-1']) {
    assert.ok(all.includes(name), name + ' should be themeable')
  }
  // Root aliases copy these, density owns spacing, and reduced motion owns durations.
  for (const name of ['radius-md', 'space-4', 'motion-duration-fast', 'density-card-padding']) {
    assert.ok(!all.includes(name), name + ' should not be themeable')
  }
  assert.ok(color.every(name => all.includes(name)))
  for (const [foreground, background] of iris.contrast) {
    assert.ok(color.includes(foreground) && color.includes(background))
  }
})

test('Iris tokens have unique names and resolve in both themes', () => {
  const names = new Set()
  for (const { primitives, roles } of Object.values(iris.groups)) {
    for (const name of [...Object.keys(primitives), ...Object.keys(roles)]) {
      assert.ok(!names.has(name), 'Duplicate token --erx-' + name)
      names.add(name)
      for (const mode of ['light', 'dark']) assert.ok(resolveToken(name, mode))
    }
  }

  const standard = Object.keys(iris.density.standard).sort()
  for (const density of Object.values(iris.density)) {
    assert.deepEqual(Object.keys(density).sort(), standard)
    for (const value of Object.values(density)) {
      const name = value.match(/^var\(--erx-([a-z0-9-]+)\)$/)?.[1]
      assert.ok(names.has(name), 'Undefined density alias: ' + value)
    }
  }
})

for (const mode of ['light', 'dark']) {
  test('Iris ' + mode + ' contrast meets every documented threshold', () => {
    for (const [foreground, background, required] of iris.contrast) {
      const ratio = contrastRatio(resolveToken(foreground, mode), resolveToken(background, mode))
      assert.ok(
        ratio >= required,
        '--erx-' +
          foreground +
          ' on --erx-' +
          background +
          ' measures ' +
          ratio.toFixed(2) +
          ':1, expected ' +
          required +
          ':1',
      )
    }
  })
}
