import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const ssr = mode === 'ssr'
  return {
    plugins: [solid()],
    test: {
      environment: ssr ? 'node' : 'jsdom',
      include: ssr ? ['test/server.test.{ts,tsx}'] : ['test/*.test.{ts,tsx}'],
      exclude: ssr ? [] : ['test/server.test.{ts,tsx}'],
    },
  }
})
