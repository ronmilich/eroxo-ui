import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { contrastRatio, iris, renderTokenCSS, resolveToken } from '../scripts/iris-tokens.mjs'

test('checked-in token CSS matches the Iris source', async () => {
  const css = await readFile(new URL('../src/tokens.css', import.meta.url), 'utf8')
  const generated = await renderTokenCSS()
  assert.equal(css.replaceAll('\r\n', '\n'), generated, 'Run pnpm generate:tokens')
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
