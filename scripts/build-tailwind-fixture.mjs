import path from 'node:path'
import { pathToFileURL } from 'node:url'
import solid from '@solidjs/vite-plugin'
import { build } from 'vite'

// Exit after building so Windows can unload the consumer's native Tailwind modules.
const root = process.argv[2]
const { default: tailwindcss } = await import(
  pathToFileURL(path.join(root, 'tailwind-plugin.mjs')).href
)
await build({ root, configFile: false, plugins: [solid(), tailwindcss()] })
