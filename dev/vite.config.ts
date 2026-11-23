import solid from '@solidjs/vite-plugin'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: [
      {
        find: /^eroxo-ui$/,
        replacement: fileURLToPath(new URL('../src/index.tsx', import.meta.url)),
      },
    ],
    dedupe: ['solid-js', '@solidjs/web'],
  },
  server: { port: 3000 },
})
