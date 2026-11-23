import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import stylelint from 'stylelint'
import { checkExports } from '../scripts/check-exports.mjs'

const configFile = fileURLToPath(new URL('../.stylelintrc.json', import.meta.url))
const order = '@layer erx.tokens, erx.components;'

test('Oxlint checks library-authored JSX data attributes and permits forwarded props', () => {
  const dir = mkdtempSync(join(tmpdir(), 'eroxo-conventions-'))
  const file = join(dir, 'src', 'part.tsx')
  const lint = source => {
    writeFileSync(file, source)
    const cli = fileURLToPath(new URL('../node_modules/oxlint/bin/oxlint', import.meta.url))
    return spawnSync(process.execPath, [cli, '--format', 'json', file], {
      encoding: 'utf8',
      cwd: dir,
    })
  }
  try {
    const projectConfig = new URL('../.oxlintrc.json', import.meta.url)
    const config = JSON.parse(readFileSync(projectConfig, 'utf8'))
    config.jsPlugins = config.jsPlugins.map(plugin => fileURLToPath(new URL(plugin, projectConfig)))
    writeFileSync(join(dir, '.oxlintrc.json'), JSON.stringify(config))
    mkdirSync(join(dir, 'src'))
    const accepted = lint(
      'export const Part = props => <div {...props} data-erx-state="open" data-erx-size="sm" data-erx-variant="outline" data-erx-tone="danger" />',
    )
    assert.equal(accepted.status, 0, accepted.stderr + accepted.stdout)
    const rejected = lint(
      'export const Part = () => <div data-state="open" data-erx-slot="content" data-erx-size="large" data-erx-variant="filled" data-erx-tone="error" />',
    )
    assert.equal(rejected.status, 1, rejected.stderr + rejected.stdout)
    const { diagnostics } = JSON.parse(rejected.stdout)
    assert.equal(diagnostics.length, 5)
    for (const diagnostic of diagnostics) assert.match(diagnostic.code, /eroxo.*data-attribute/)
    const legacy = lint(
      "export { render } from 'solid-js/web'; import { splitProps } from 'solid-js'; export { splitProps }",
    )
    assert.equal(legacy.status, 1, legacy.stderr + legacy.stdout)
    assert.match(legacy.stdout, /no-restricted-imports/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a component stylesheet can consume a public hook, set a private value and select a part', async () => {
  const code = `${order}
    @layer erx.components {
      .erx-alert-dialog__title[data-erx-state="open"][aria-live] {
        --_erx-title-color: var(--erx-color-primary);
        color: var(--erx-alert-dialog-title-color, var(--_erx-title-color));
      }
    }`
  const result = await stylelint.lint({ code, configFile })
  assert.deepEqual(result.results[0].warnings, [])
})

test('library CSS rejects broken part, attribute, property and layer conventions', async () => {
  const examples = [
    ['.erx-button {}', 'eroxo/layer-order'],
    [order + '.button {}', 'selector-class-pattern'],
    [order + '.erx-button--primary {}', 'selector-class-pattern'],
    [order + '[data-state] {}', 'selector-attribute-name-disallowed-list'],
    [order + '[data-erx-slot] {}', 'selector-attribute-name-disallowed-list'],
    [order + ':root { --brand: blue; }', 'custom-property-pattern'],
    [order + '.erx-button { color: var(--brand); }', 'custom-property-pattern'],
    [order + '.erx-button { color: red !important; }', 'declaration-no-important'],
  ]
  for (const [code, rule] of examples) {
    const result = await stylelint.lint({ code, configFile })
    assert.deepEqual(
      result.results[0].warnings.map(warning => warning.rule),
      [rule],
      code,
    )
  }
})

test('public exports resolve through explicit entries into dist', () => {
  const root = { types: './dist/index.d.ts', default: './dist/index.js' }
  checkExports({
    '.': root,
    './alert-dialog': root,
    './alert-dialog.css': './dist/css/alert-dialog.css',
  })
  assert.throws(() => checkExports({}))
  for (const key of ['./*', './button/root', './internal', './private.css', './AlertDialog']) {
    assert.throws(() => checkExports({ '.': root, [key]: root }), /Invalid public export/)
  }
  for (const target of [
    './src/button.tsx',
    './dist/../src/button.js',
    './dist/*.js',
    './dist/button.json',
    null,
    {},
  ]) {
    assert.throws(
      () => checkExports({ '.': root, './button': { default: target } }),
      /Invalid target/,
    )
  }
  assert.throws(
    () => checkExports({ '.': root, './button.css': './dist/button.js' }),
    /Invalid target/,
  )
})
