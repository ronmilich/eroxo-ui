import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'

// Report hydration while a scope is created, as in a hydrated server render.
const hydration = vi.hoisted(() => ({ active: false }))
vi.mock('solid-js', async importOriginal => ({
  ...(await importOriginal<typeof import('solid-js')>()),
  isHydrating: () => hydration.active,
}))

const { ThemeScope, useTheme } = await import('../src/theme.jsx')

const html = document.documentElement

afterEach(() => {
  html.removeAttribute('data-erx-theme')
  html.removeAttribute('data-erx-density')
  document.body.replaceChildren()
})

it('continues the theme on html as it was before the root scope wrote to it', () => {
  vi.stubGlobal('matchMedia', () =>
    Object.defineProperty(new EventTarget(), 'matches', { get: () => false }),
  )
  html.setAttribute('data-erx-theme', 'dark')
  const [theme, setTheme] = createSignal<string | undefined>('acme')
  const [density, setDensity] = createSignal<'compact' | undefined>('compact')
  function Reader() {
    const state = useTheme()
    return <p>{`${state.theme()} ${state.colorScheme()} ${state.density() ?? 'inherited'}`}</p>
  }
  const root = document.createElement('main')
  hydration.active = true
  const dispose = render(
    () => (
      <ThemeScope root theme={theme()} density={density()}>
        <Reader />
      </ThemeScope>
    ),
    root,
  )
  hydration.active = false
  flush()
  expect(html.dataset.erxTheme).toBe('acme dark')
  expect(html.dataset.erxDensity).toBe('compact')
  setTheme(undefined)
  setDensity(undefined)
  flush()
  const scope = root.querySelector<HTMLElement>('.erx-theme-scope')!
  expect(scope.dataset.erxTheme).toBe('dark')
  expect(scope.hasAttribute('data-erx-density')).toBe(false)
  expect(root.querySelector('p')!.textContent).toBe('iris dark inherited')
  expect(html.dataset.erxTheme).toBe('dark')
  expect(html.hasAttribute('data-erx-density')).toBe(false)
  dispose()
  vi.unstubAllGlobals()
})
