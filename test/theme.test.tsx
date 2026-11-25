import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  type ColorScheme,
  createTheme,
  type Density,
  ThemeScope,
  themeScript,
  type ThemeState,
  useTheme,
} from '../src'
import { useTheme as useSubpathTheme } from '../src/theme.jsx'
import { useReducedMotion } from '../src/internal/motion.jsx'
import { irisValues } from '../src/internal/theme-tokens.js'

const dark = '(prefers-color-scheme: dark)'
const html = document.documentElement
let media: ReturnType<typeof stubMedia>

function stubMedia() {
  const values = new Map<string, boolean>()
  const lists = new Map<string, EventTarget>()
  const matchMedia = vi.fn((query: string) => {
    let list = lists.get(query)
    if (!list) {
      list = Object.defineProperty(new EventTarget(), 'matches', {
        get: () => values.get(query) ?? false,
      })
      lists.set(query, list)
    }
    return list
  })
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    list: (query: string) => matchMedia(query),
    set(query: string, value: boolean) {
      values.set(query, value)
      lists.get(query)?.dispatchEvent(new Event('change'))
      flush()
    },
  }
}

// Dispose every tree after each test, so that a failed assertion can't leave a
// shared media-query listener alive for the next test.
const mounted = new Set<() => void>()
function mount(view: () => unknown) {
  const root = document.createElement('main')
  document.body.append(root)
  const unmount = render(view as () => never, root)
  const dispose = () => {
    if (mounted.delete(dispose)) unmount()
  }
  mounted.add(dispose)
  flush()
  return { root, dispose }
}

let state!: ThemeState
function Reader(props: { id?: string }) {
  const theme = useTheme()
  if (!props.id) state = theme
  return (
    <p id={props.id}>
      {theme.theme()} {theme.colorScheme()} {theme.resolvedColorScheme()}{' '}
      {theme.density() ?? 'inherited'}
    </p>
  )
}

const acme = createTheme('acme', {
  light: { '--erx-color-primary': '#1c61bf' },
  dark: { '--erx-color-primary': '#8fb8ff' },
})

beforeEach(() => {
  media = stubMedia()
})

afterEach(() => {
  for (const dispose of [...mounted]) dispose()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
  html.removeAttribute('data-erx-theme')
  html.removeAttribute('data-erx-density')
  localStorage.clear()
})

describe('ThemeScope', () => {
  it('nests theme, color scheme and density without remounting stateful children', () => {
    const [scheme, setScheme] = createSignal<ColorScheme>('light')
    const [theme, setTheme] = createSignal<typeof acme | undefined>()
    const [density, setDensity] = createSignal<Density>()
    const { root, dispose } = mount(() => (
      <ThemeScope
        colorScheme={scheme()}
        theme={theme()}
        id="outer"
        class="app"
        style={{ gap: '4px' }}
      >
        <input />
        <ThemeScope density={density()}>
          <Reader />
        </ThemeScope>
        <ThemeScope theme="iris" colorScheme="dark">
          <Reader id="iris" />
        </ThemeScope>
      </ThemeScope>
    ))
    const outer = root.querySelector<HTMLElement>('#outer')!
    const [, inner, iris] = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    const input = root.querySelector('input')!
    input.value = 'Keep this draft'
    expect(outer.className).toBe('erx-theme-scope app')
    expect(outer.style.gap).toBe('4px')
    expect(outer.dataset.erxTheme).toBe('light')
    expect(inner!.dataset.erxTheme).toBe('light')
    expect(inner!.hasAttribute('data-erx-density')).toBe(false)
    expect(root.querySelector('p')!.textContent).toBe('iris light light inherited')

    setScheme('dark')
    setTheme(acme)
    setDensity('compact')
    flush()
    expect(outer.dataset.erxTheme).toBe('acme dark')
    expect(inner!.dataset.erxTheme).toBe('acme dark')
    expect(inner!.dataset.erxDensity).toBe('compact')
    expect(iris!.dataset.erxTheme).toBe('iris dark')
    expect(root.querySelector('p')!.textContent).toBe('acme dark dark compact')
    expect(root.querySelector('#iris')!.textContent).toBe('iris dark dark inherited')
    expect(root.querySelector('input')).toBe(input)
    expect(input.value).toBe('Keep this draft')
    dispose()
  })

  it('reports uncontrolled requests once and forwards them from inheriting scopes', () => {
    const onRoot = vi.fn()
    const onNested = vi.fn()
    const onOwning = vi.fn()
    let owning!: ThemeState
    function Owning() {
      owning = useTheme()
      return null
    }
    const { root, dispose } = mount(() => (
      <ThemeScope onColorSchemeChange={onRoot}>
        <ThemeScope onColorSchemeChange={onNested}>
          <Reader />
        </ThemeScope>
        <ThemeScope defaultColorScheme="light" onColorSchemeChange={onOwning}>
          <Owning />
        </ThemeScope>
      </ThemeScope>
    ))
    const [outer, , own] = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    expect(outer!.hasAttribute('data-erx-theme')).toBe(false)
    expect(state.colorScheme()).toBe('system')
    state.setColorScheme('system')
    state.setColorScheme('dark')
    state.setColorScheme('dark')
    flush()
    expect(onRoot.mock.calls).toEqual([['dark']])
    expect(onNested).not.toHaveBeenCalled()
    expect(outer!.dataset.erxTheme).toBe('dark')
    expect(state.colorScheme()).toBe('dark')
    owning.setColorScheme('dark')
    flush()
    expect(onOwning.mock.calls).toEqual([['dark']])
    expect(own!.dataset.erxTheme).toBe('dark')
    expect(onRoot).toHaveBeenCalledOnce()
    dispose()
  })

  it('leaves a controlled color scheme to its owner', () => {
    const [scheme, setScheme] = createSignal<ColorScheme>('light')
    const onChange = vi.fn((next: ColorScheme) => setScheme(next))
    const ignored = vi.fn()
    const { root, dispose } = mount(() => (
      <>
        <ThemeScope colorScheme={scheme()} onColorSchemeChange={onChange}>
          <Reader />
        </ThemeScope>
        <ThemeScope colorScheme="light" onColorSchemeChange={ignored}>
          <Reader id="fixed" />
        </ThemeScope>
      </>
    ))
    const [scope, fixed] = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    state.setColorScheme('light')
    expect(onChange).not.toHaveBeenCalled()
    state.setColorScheme('dark')
    flush()
    expect(onChange.mock.calls).toEqual([['dark']])
    expect(scope!.dataset.erxTheme).toBe('dark')
    expect(fixed!.dataset.erxTheme).toBe('light')
    dispose()
  })

  it('keeps every request made before a flush', () => {
    const onChange = vi.fn()
    const { root, dispose } = mount(() => (
      <ThemeScope defaultColorScheme="light" onColorSchemeChange={onChange}>
        <Reader />
      </ThemeScope>
    ))
    state.setColorScheme('dark')
    state.setColorScheme('light')
    flush()
    expect(onChange.mock.calls).toEqual([['dark'], ['light']])
    expect(root.querySelector<HTMLElement>('.erx-theme-scope')!.dataset.erxTheme).toBe('light')
    dispose()
  })

  it('writes an explicit iris theme on nested scopes too, so ancestor themes can reset', () => {
    const { root, dispose } = mount(() => (
      <ThemeScope colorScheme="light" theme={acme}>
        <ThemeScope theme="iris">
          <ThemeScope density="compact">
            <Reader />
          </ThemeScope>
        </ThemeScope>
      </ThemeScope>
    ))
    const [outer, iris, inner] = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    expect(outer!.dataset.erxTheme).toBe('acme light')
    expect(iris!.dataset.erxTheme).toBe('iris light')
    expect(inner!.dataset.erxTheme).toBe('iris light')
    expect(root.querySelector('p')!.textContent).toBe('iris light light compact')
    dispose()
  })

  it('renders without matchMedia, as in jsdom, and treats the system scheme as light', () => {
    vi.unstubAllGlobals()
    expect(typeof window.matchMedia).toBe('undefined')
    function Motion() {
      const reduced = useReducedMotion()
      return <output>{reduced() ? 'reduced' : 'full'}</output>
    }
    const { root, dispose } = mount(() => (
      <ThemeScope>
        <Reader />
        <Motion />
      </ThemeScope>
    ))
    expect(root.querySelector('p')!.textContent).toBe('iris system light inherited')
    expect(root.querySelector('output')!.textContent).toBe('full')
    dispose()
  })

  it('warns about unsupported values and a nested root, and ignores them', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { root, dispose } = mount(() => (
      <ThemeScope colorScheme="dark">
        <ThemeScope root theme="Brand Theme">
          <Reader />
        </ThemeScope>
      </ThemeScope>
    ))
    state.setColorScheme('auto' as ColorScheme)
    flush()
    const scopes = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    expect(scopes[1]!.dataset.erxTheme).toBe('dark')
    expect(html.hasAttribute('data-erx-theme')).toBe(false)
    expect(warning.mock.calls.map(([message]) => message)).toEqual([
      expect.stringMatching(/^\[eroxo-ui\] ThemeScope: root is set on a nested scope\. /),
      expect.stringContaining('theme "Brand Theme" is not a valid theme name'),
      expect.stringContaining('color scheme "auto" is not supported. Use light, dark or system.'),
    ])
    dispose()
  })

  it('resolves system schemes from one shared preference listener', () => {
    media.set(dark, true)
    const list = media.list(dark)
    const add = vi.spyOn(list, 'addEventListener')
    const remove = vi.spyOn(list, 'removeEventListener')
    function Motion() {
      useReducedMotion()
      return null
    }
    const { root, dispose } = mount(() => (
      <>
        <ThemeScope>
          <Reader />
          <ThemeScope colorScheme="light">
            <Reader id="light" />
            <ThemeScope colorScheme="system">
              <Reader id="system" />
            </ThemeScope>
          </ThemeScope>
        </ThemeScope>
        <ThemeScope colorScheme="light">
          <Motion />
        </ThemeScope>
      </>
    ))
    const text = (selector: string) => root.querySelector(selector)!.textContent
    expect(text('p')).toBe('iris system dark inherited')
    expect(text('#light')).toBe('iris light light inherited')
    expect(text('#system')).toBe('iris system dark inherited')
    expect(
      root.querySelector('#system')!.closest('[data-erx-theme]')!.getAttribute('data-erx-theme'),
    ).toBe('system')
    media.set(dark, false)
    expect(text('p')).toBe('iris system light inherited')
    expect(text('#system')).toBe('iris system light inherited')
    expect(
      media.matchMedia.mock.calls.map(([query]) => query).filter(query => query === dark),
    ).toHaveLength(2)
    expect(media.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(add).toHaveBeenCalledOnce()
    dispose()
    expect(remove).toHaveBeenCalledExactlyOnceWith('change', add.mock.calls[0]?.[1])
  })

  it('continues the theme on html in the outermost scope', () => {
    html.setAttribute('data-erx-theme', 'acme dark')
    html.setAttribute('data-erx-density', 'comfortable')
    const { root, dispose } = mount(() => (
      <>
        <ThemeScope>
          <Reader />
        </ThemeScope>
        <ThemeScope theme="iris" defaultColorScheme="light">
          <Reader id="own" />
        </ThemeScope>
      </>
    ))
    const [adopting, own] = root.querySelectorAll<HTMLElement>('.erx-theme-scope')
    expect(adopting!.dataset.erxTheme).toBe('acme dark')
    expect(adopting!.dataset.erxDensity).toBe('comfortable')
    expect(root.querySelector('p')!.textContent).toBe('acme dark dark comfortable')
    expect(own!.dataset.erxTheme).toBe('iris light')
    dispose()
  })

  it('writes only explicit values to html and keeps the inherited ones', () => {
    html.setAttribute('data-erx-theme', 'acme dark')
    html.setAttribute('data-erx-density', 'comfortable')
    const [theme, setTheme] = createSignal<string>()
    const { dispose } = mount(() => (
      <ThemeScope root theme={theme()}>
        <Reader />
      </ThemeScope>
    ))
    expect(html.dataset.erxTheme).toBe('acme dark')
    state.setColorScheme('light')
    flush()
    expect(html.dataset.erxTheme).toBe('acme light')
    setTheme('iris')
    flush()
    expect(html.dataset.erxTheme).toBe('light')
    expect(html.dataset.erxDensity).toBe('comfortable')
    dispose()
    expect(html.dataset.erxTheme).toBe('acme dark')
  })

  it('applies the outermost theme to html and restores it on disposal', () => {
    html.setAttribute('data-erx-theme', 'light')
    const [scheme, setScheme] = createSignal<ColorScheme>('dark')
    const [theme, setTheme] = createSignal<typeof acme | undefined>(acme)
    const { dispose } = mount(() => (
      <ThemeScope root colorScheme={scheme()} theme={theme()} density="compact">
        <ThemeScope colorScheme="light" />
      </ThemeScope>
    ))
    expect(html.dataset.erxTheme).toBe('acme dark')
    expect(html.dataset.erxDensity).toBe('compact')
    setScheme('system')
    setTheme(undefined)
    flush()
    expect(html.dataset.erxTheme).toBe('system')
    dispose()
    expect(html.dataset.erxTheme).toBe('light')
    expect(html.hasAttribute('data-erx-density')).toBe(false)
  })

  it('reports the document theme outside a scope and warns on changes', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    html.setAttribute('data-erx-theme', 'brand light')
    const { root, dispose } = mount(() => <Reader />)
    expect(root.textContent).toBe('brand light light inherited')
    state.setColorScheme('dark')
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^\[eroxo-ui\] useTheme: setColorScheme was called outside a ThemeScope\. Render a ThemeScope around this component\. https:\/\/\S+\.md$/,
      ),
    )
    dispose()
    html.removeAttribute('data-erx-theme')
    media.set(dark, true)
    const standalone = mount(() => <Reader />)
    expect(standalone.root.textContent).toBe('iris system dark inherited')
    standalone.dispose()
  })

  it('shares one implementation through the root and subpath entries', () => {
    expect(useSubpathTheme).toBe(useTheme)
    expectTypeOf(state.resolvedColorScheme).returns.toEqualTypeOf<'light' | 'dark'>()
  })
})

describe('createTheme', () => {
  // The Iris declaration for a token: a pair becomes light-dark() when the modes differ.
  const iris = (token: keyof typeof irisValues) => {
    const value = irisValues[token]
    if (value === null) return 'initial'
    if (typeof value === 'string') return value
    return value[0] === value[1] ? value[0] : `light-dark(${value[0]}, ${value[1]})`
  }

  it('writes partial overrides as static CSS with Iris fallbacks and an iris reset', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const theme = createTheme('quiet-study', {
      shared: { '--erx-radius-control': '4px', '--erx-color-overlay-scrim': 'rgb(0 0 0 / 50%)' },
      light: { '--erx-color-primary': ' #1c61bf ' },
      dark: { '--erx-color-primary': '#8fb8ff', '--erx-color-canvas': '#101418' },
    })
    expect(theme.name).toBe('quiet-study')
    expect(theme.css).toBe(
      [
        '@layer erx.tokens, erx.components;',
        '',
        '@layer erx.tokens {',
        "  [data-erx-theme~='quiet-study'] {",
        '    --erx-radius-control: 4px;',
        '    --erx-color-overlay-scrim: rgb(0 0 0 / 50%);',
        '    --erx-color-primary: light-dark(#1c61bf, #8fb8ff);',
        `    --erx-color-canvas: light-dark(${(irisValues['--erx-color-canvas'] as readonly [string, string])[0]}, #101418);`,
        '  }',
        '',
        '  /* A nested scope with theme="iris" returns to the Iris values. */',
        "  [data-erx-theme~='quiet-study'] [data-erx-theme~='iris'] {",
        `    --erx-radius-control: ${iris('--erx-radius-control')};`,
        `    --erx-color-overlay-scrim: ${iris('--erx-color-overlay-scrim')};`,
        `    --erx-color-primary: ${iris('--erx-color-primary')};`,
        `    --erx-color-canvas: ${iris('--erx-color-canvas')};`,
        '  }',
        '}',
        '',
      ].join('\n'),
    )
    expect(createTheme('one-mode', { light: { '--erx-color-primary': '#1c61bf' } }).css).toContain(
      `--erx-color-primary: light-dark(#1c61bf, ${(irisValues['--erx-color-primary'] as readonly [string, string])[1]});`,
    )
    expect(createTheme('same', { light: { '--erx-iris-700': '#5145CD' } }).css).toContain(
      '--erx-iris-700: #5145CD;',
    )
    expect(warning).not.toHaveBeenCalled()
  })

  it('re-derives the colors that read a changed palette shade', () => {
    const css = createTheme('palette', { shared: { '--erx-iris-700': '#0a7d4f' } }).css
    const [scope, reset] = css.split('/* A nested scope')
    // Without a color-scheme word on the scope, only this declaration makes the shade reach the role.
    expect(scope).toContain('--erx-iris-700: #0a7d4f;')
    expect(scope).toContain(`--erx-color-primary: ${iris('--erx-color-primary')};`)
    expect(reset).toContain(`--erx-iris-700: ${iris('--erx-iris-700')};`)
    expect(reset).toContain(`--erx-color-primary: ${iris('--erx-color-primary')};`)
  })

  it('resets optional and wide-screen tokens for nested iris scopes', () => {
    const css = createTheme('display', {
      shared: { '--erx-type-display-size': '4rem', '--erx-type-body-family': 'Georgia, serif' },
    }).css
    expect(css).toContain(`--erx-type-display-size: ${iris('--erx-type-display-size')};`)
    expect(css).toContain('--erx-type-body-family: initial;')
    expect(css).toMatch(
      /@media \(min-width: 48rem\) \{\n {4}\[data-erx-theme~='display'\] \[data-erx-theme~='iris'\] \{\n {6}--erx-type-display-size: 3rem;/,
    )
  })

  it('rejects names, tokens and values that would break the stylesheet', () => {
    for (const name of ['Acme', 'dark', 'iris', 'two words', '', 'a--b']) {
      expect(() => createTheme(name, {})).toThrow(
        /^\[eroxo-ui\] createTheme: .* is not a valid theme name\./,
      )
    }
    const shared = (values: Record<string, string>) => createTheme('acme', { shared: values })
    for (const value of [
      'red; } body { display: none',
      'red !important',
      ' ',
      'Inter /* brand',
      'rgb(1 2 3',
      'rgb(1 2 3))',
      'a]',
      "'Inter",
      'Inter\\',
      'Inter\nSerif',
      'url(</style>)',
    ]) {
      expect(() => shared({ '--erx-font-sans': value }), value).toThrow('has the unsupported value')
    }
    for (const value of [
      "'Segoe UI', sans-serif",
      'rgb(0 0 0 / 50%)',
      'color-mix(in srgb, red 50%, blue)',
    ]) {
      expect(shared({ '--erx-font-sans': value }).css).toContain(`--erx-font-sans: ${value};`)
    }
    expect(() => shared({ 'color: red': 'blue' })).toThrow('is not an Eroxo token name')
    expect(() =>
      createTheme('acme', { light: { '--erx-radius-control': '4px' } as never }),
    ).toThrow('--erx-radius-control is not an Iris color token')
  })

  it('rejects motion tokens and warns about tokens that have no effect in a scope', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const shared = (values: Record<string, string>) => createTheme('acme', { shared: values })
    expect(() => shared({ '--erx-motion-hover-duration': '400ms' })).toThrow(
      /^\[eroxo-ui\] createTheme: --erx-motion-hover-duration follows the reduced-motion preference\./,
    )
    expect(shared({ '--erx-radius-md': '4px' }).css).toContain('--erx-radius-md: 4px;')
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^\[eroxo-ui\] createTheme: --erx-radius-md has no effect in a theme, because root or density aliases copy it\./,
      ),
    )
  })

  it('warns in development when a changed pair fails its contrast minimum', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    createTheme('pale', {
      light: { '--erx-color-primary': 'var(--erx-iris-200)' },
      dark: { '--erx-color-canvas': '#fff', '--erx-color-surface': 'rgb(255 255 255)' },
    })
    expect(warning).toHaveBeenCalledOnce()
    const [message] = warning.mock.calls[0] as [string]
    expect(message).toMatch(/^\[eroxo-ui\] createTheme: Theme "pale" fails 2 contrast checks: /)
    expect(message).toMatch(
      /light --erx-color-on-primary on --erx-color-primary measures 1\.\d\d:1, below 4\.5:1/,
    )
    expect(message).toMatch(
      /dark --erx-color-text on --erx-color-canvas measures 1\.\d\d:1, below 4\.5:1/,
    )
    expect(message).toMatch(
      /Adjust the colors until each pair meets its minimum\. https:\/\/\S+\.md$/,
    )
  })
})

describe('themeScript', () => {
  function run(source: string) {
    new Function(source)()
    return html.getAttribute('data-erx-theme')
  }

  it('applies a valid stored scheme, or the default, to html', () => {
    const source = themeScript({ storageKey: 'app-scheme', theme: acme })
    expect(run(source)).toBe('acme system')
    localStorage.setItem('app-scheme', 'dark')
    expect(run(source)).toBe('acme dark')
    localStorage.setItem('app-scheme', 'blue')
    expect(run(themeScript({ storageKey: 'app-scheme', defaultColorScheme: 'light' }))).toBe(
      'light',
    )
    localStorage.setItem('app-scheme', 'system')
    expect(run(themeScript({ storageKey: 'app-scheme', theme: 'iris' }))).toBe('system')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage is disabled')
    })
    expect(run(themeScript({ storageKey: 'app-scheme', defaultColorScheme: 'dark' }))).toBe('dark')
  })

  it('emits inline-safe source and validates its options', () => {
    const source = themeScript({ storageKey: '</script><script>alert(1)//&\u2028' })
    expect(source).not.toMatch(/[<>&\u2028]/)
    expect(source).toContain('\\u003c/script\\u003e')
    localStorage.setItem('</script><script>alert(1)//&\u2028', 'light')
    expect(run(source)).toBe('light')
    expect(() => themeScript({ storageKey: '' })).toThrow(
      /^\[eroxo-ui\] themeScript: storageKey is empty\./,
    )
    expect(() =>
      themeScript({ storageKey: 'k', defaultColorScheme: 'auto' as ColorScheme }),
    ).toThrow('defaultColorScheme "auto" is not supported')
    expect(() => themeScript({ storageKey: 'k', theme: 'dark' })).toThrow(
      'is not a valid theme name',
    )
  })
})
