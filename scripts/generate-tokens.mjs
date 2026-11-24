import { writeFile } from 'node:fs/promises'
import { renderTokenCSS } from './iris-tokens.mjs'

const css = await renderTokenCSS()
await writeFile(new URL('../src/tokens.css', import.meta.url), css)
