import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [solid()],
  build: {
    emptyOutDir: !isSsrBuild,
    lib: { entry: 'src/index.tsx', formats: ['es'], fileName: 'index' },
    rolldownOptions: {
      output: { entryFileNames: isSsrBuild ? 'server.js' : 'index.js' },
      external: [/^solid-js(?:\/|$)/, /^@solidjs\/web(?:\/|$)/],
    },
  },
}))
