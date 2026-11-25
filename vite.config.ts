import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig(({ isSsrBuild, mode }) => {
  const probe = mode === 'size-probe'
  const entry = probe
    ? [
        'fixtures/size/src/button.tsx',
        'fixtures/size/src/dialog.tsx',
        'fixtures/size/src/index.tsx',
      ]
    : ['src/index.tsx', 'src/hello.tsx', 'src/theme.tsx']
  return {
    plugins: [
      solid({ ssr: true }),
      {
        name: 'omit-server-styles',
        resolveId(id) {
          if (isSsrBuild && id.endsWith('.css')) return '\0eroxo-server-style'
        },
        load(id) {
          if (id === '\0eroxo-server-style') return ''
        },
      },
    ],
    build: {
      outDir: probe ? 'fixtures/size/dist' : 'dist',
      emptyOutDir: !isSsrBuild,
      sourcemap: true,
      lib: { entry, formats: ['es'] },
      rolldownOptions: {
        external: id =>
          /^(?:solid-js|@solidjs\/web)(?:\/|$)/.test(id) || (!isSsrBuild && id.endsWith('.css')),
        output: { entryFileNames: isSsrBuild ? '[name].server.js' : '[name].js' },
      },
    },
  }
})
