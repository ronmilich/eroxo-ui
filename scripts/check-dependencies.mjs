import { readFileSync } from 'node:fs'

// ADR 07 is the source of truth for the published library.
const peers = new Map([
  ['solid-js', '^2.0.3'],
  ['@solidjs/web', '^2.0.3'],
])

const manifest = JSON.parse(
  readFileSync(process.argv[2] ?? new URL('../package.json', import.meta.url), 'utf8'),
)
const errors = []
for (const field of ['dependencies', 'optionalDependencies']) {
  for (const name of Object.keys(manifest[field] ?? {})) {
    errors.push(`${field}.${name} is outside the runtime allow-list`)
  }
}
for (const name of Object.keys(manifest.peerDependencies ?? {})) {
  if (!peers.has(name)) errors.push(`peerDependencies.${name} is outside the runtime allow-list`)
}
for (const [name, range] of peers) {
  if (
    manifest.peerDependencies?.[name] !== range ||
    manifest.peerDependenciesMeta?.[name]?.optional
  ) {
    errors.push(`Expected required peer ${name}@${range}`)
  }
}
for (const field of ['bundledDependencies', 'bundleDependencies']) {
  const value = manifest[field]
  if (value !== undefined && value !== false && !(Array.isArray(value) && value.length === 0)) {
    errors.push(`${field} declares bundled runtime dependencies`)
  }
}
if (errors.length) {
  console.error('Runtime dependency policy (docs/adr/07-dependencies.md)\n' + errors.join('\n'))
  process.exitCode = 1
}
