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
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['**/*.d.ts'],
        reportsDirectory: 'artifacts/coverage',
        reporter: ['text', 'html', 'lcov'],
        thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
      },
    },
  }
})
