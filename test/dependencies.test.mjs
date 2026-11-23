import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const check = fileURLToPath(new URL('../scripts/check-dependencies.mjs', import.meta.url))
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('the published manifest passes the runtime policy', () => {
  const result = spawnSync(process.execPath, [check], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})

test('the same CLI used in CI rejects unapproved runtime dependencies', () => {
  const dir = mkdtempSync(join(tmpdir(), 'eroxo-deps-'))
  const file = join(dir, 'package.json')
  try {
    const cases = [
      [{ dependencies: { '@kobalte/core': '*' } }, 'dependencies.@kobalte/core'],
      [
        { optionalDependencies: { '@floating-ui/dom': '*' } },
        'optionalDependencies.@floating-ui/dom',
      ],
      [
        { peerDependencies: { ...manifest.peerDependencies, other: '*' } },
        'peerDependencies.other',
      ],
      [{ peerDependencies: { 'solid-js': '^2.0.3' } }, 'Expected required peer @solidjs/web'],
      [
        { peerDependenciesMeta: { 'solid-js': { optional: true } } },
        'Expected required peer solid-js',
      ],
      [{ bundledDependencies: ['other'] }, 'bundledDependencies'],
      [{ bundleDependencies: true }, 'bundleDependencies'],
    ]
    for (const [change, expected] of cases) {
      writeFileSync(file, JSON.stringify({ ...manifest, ...change }))
      const result = spawnSync(process.execPath, [check, file], { encoding: 'utf8' })
      assert.equal(result.status, 1, result.stderr)
      assert.ok(result.stderr.includes(expected), result.stderr)
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
