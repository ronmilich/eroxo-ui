#!/usr/bin/env node
import { readFile, writeFile, rename, unlink, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'

const begin = '<!-- eroxo-ui:start -->'
const end = '<!-- eroxo-ui:end -->'
const version = createRequire(import.meta.url)('../package.json').version
async function refresh() {
  const file = 'AGENTS.md'
  const original = await readFile(file, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  const source = original ?? ''
  const newline = source.includes('\r\n') ? '\r\n' : '\n'
  const block = [
    begin,
    '## Eroxo UI',
    '',
    'Use the documentation shipped with eroxo-ui ' +
      version +
      ' in `node_modules/eroxo-ui/dist/docs/`. Start with `llms.txt` and the component Markdown and metadata under `components/`.',
    end,
  ].join(newline)
  const start = source.indexOf(begin)
  const finish = source.indexOf(end)
  if (
    start < 0 !== finish < 0 ||
    finish < start ||
    source.lastIndexOf(begin) !== start ||
    source.lastIndexOf(end) !== finish
  )
    throw new Error('Repair the Eroxo UI section markers in AGENTS.md before refreshing.')
  const updated =
    start < 0
      ? source +
        (source ? (source.endsWith('\n') ? newline : newline + newline) : '') +
        block +
        newline
      : source.slice(0, start) + block + source.slice(finish + end.length)
  if (original === null) await writeFile(file, updated, { flag: 'wx' })
  else if (updated !== original) {
    const temporary = '.eroxo-agents-' + randomUUID()
    await writeFile(temporary, updated, { flag: 'wx', mode: (await stat(file)).mode })
    try {
      await rename(temporary, file)
    } finally {
      await unlink(temporary).catch(error => {
        if (error.code !== 'ENOENT') throw error
      })
    }
  }
  await writeFile('CLAUDE.md', '@AGENTS.md' + newline, { flag: 'wx' }).catch(error => {
    if (error.code !== 'EEXIST') throw error
  })
}
if (process.argv.length === 3 && process.argv[2] === 'agents-md') {
  try {
    await refresh()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
} else {
  console.error('Usage: eroxo-ui agents-md')
  process.exitCode = 1
}
