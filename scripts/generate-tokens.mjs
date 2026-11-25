import { writeFile } from 'node:fs/promises'
import { renderTailwindCSS, renderThemeTokens, renderTokenCSS } from './iris-tokens.mjs'

await writeFile(new URL('../src/tokens.css', import.meta.url), await renderTokenCSS())
await writeFile(
  new URL('../src/internal/theme-tokens.ts', import.meta.url),
  await renderThemeTokens(),
)
await writeFile(new URL('../src/tailwind.css', import.meta.url), await renderTailwindCSS())
