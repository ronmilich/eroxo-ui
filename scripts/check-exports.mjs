import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const publicEntry = /^\.\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.css)?$/
const privateEntry = /^\.\/(?:internal|private|src|dist)(?:[-.]|$)/
const distTarget = /^\.\/dist\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+$/

function validTarget(target, css, types = false) {
  if (typeof target === 'string') {
    if (!distTarget.test(target)) return false
    if (css) return target.endsWith(types ? '.d.css.ts' : '.css')
    if (types) return target.endsWith('.d.ts') || target.endsWith('.d.mts')
    return /\.(?:mjs|jsx?)$/.test(target)
  }
  if (!target || typeof target !== 'object' || Array.isArray(target)) return false
  const conditions = Object.entries(target)
  return (
    conditions.length > 0 &&
    conditions.every(
      ([key, value]) =>
        /^[a-z][a-z0-9-]*$/.test(key) && validTarget(value, css, types || key === 'types'),
    )
  )
}

export function checkExports(exports) {
  if (!exports || typeof exports !== 'object' || !Object.hasOwn(exports, '.')) {
    throw new Error('package.json must export the package root "."')
  }
  for (const [key, target] of Object.entries(exports)) {
    if (key !== '.' && (!publicEntry.test(key) || privateEntry.test(key))) {
      throw new Error(`Invalid public export "${key}". Use a flat, kebab-case entry.`)
    }
    if (!validTarget(target, key.endsWith('.css'))) {
      throw new Error(
        `Invalid target for "${key}". Point each condition to its built file under ./dist/.`,
      )
    }
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  checkExports(manifest.exports)
}
