import './tokens.css'
import './theme.css'
import { isServer, type JSX } from '@solidjs/web'
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  isHydrating,
  omit,
  onSettled,
  untrack,
  useContext,
} from 'solid-js'
import { createControllableState } from './internal/create-controllable-state.js'
import {
  type ColorScheme,
  colorSchemes,
  type CustomTheme,
  isThemeName,
  themeDocs,
} from './internal/custom-theme.js'
import { createMediaQuery } from './internal/media-query.js'
import { warnInDevelopment } from './internal/warnings.js'

export {
  type ColorScheme,
  type CustomTheme,
  createTheme,
  type ThemeColorToken,
  type ThemeDefinition,
  type ThemeToken,
} from './internal/custom-theme.js'
export { themeScript, type ThemeScriptOptions } from './internal/theme-script.js'

/** The color scheme in effect once `system` is resolved. */
export type ResolvedColorScheme = 'light' | 'dark'

/** Control size and spacing density. */
export type Density = 'compact' | 'standard' | 'comfortable'

const densities: readonly Density[] = ['compact', 'standard', 'comfortable']

/** The theme of the nearest scope, returned by `useTheme`. */
export interface ThemeState {
  /** The color scheme setting: `light`, `dark` or `system`. */
  readonly colorScheme: Accessor<ColorScheme>
  /**
   * `light` or `dark`. A `system` setting follows the operating system once the
   * component settles; the server and hydration render `light`.
   */
  readonly resolvedColorScheme: Accessor<ResolvedColorScheme>
  /** Asks the nearest scope that owns a color scheme to change it. */
  readonly setColorScheme: (colorScheme: ColorScheme) => void
  /** The custom theme name, or `iris` for the default theme. */
  readonly theme: Accessor<string>
  /** The density, or `undefined` when no scope sets one. */
  readonly density: Accessor<Density | undefined>
}

interface ThemeContextValue {
  readonly state: ThemeState
  // The tokens the scope writes. They are undefined while the scope follows <html>.
  readonly theme: Accessor<string | undefined>
  readonly scheme: Accessor<ColorScheme | undefined>
  readonly systemDark: Accessor<boolean>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const darkQuery = '(prefers-color-scheme: dark)'

interface DocumentTheme {
  readonly scheme?: ColorScheme
  readonly theme?: string
  readonly density?: Density
}

function readDocumentTheme(): DocumentTheme {
  const html = document.documentElement
  const tokens = html.getAttribute('data-erx-theme')?.trim().split(/\s+/) ?? []
  const density = html.getAttribute('data-erx-density')
  return {
    scheme: colorSchemes.find(scheme => tokens.includes(scheme)),
    theme: tokens.find(isThemeName),
    density: densities.find(value => value === density),
  }
}

// The outermost scope continues the theme on <html>, which a first-paint script
// may have applied. The server and hydration render without it, so read it
// once the component settles.
function createDocumentTheme(): Accessor<DocumentTheme> {
  const deferred = isServer || isHydrating()
  // Read <html> now, before a root scope writes its own values there. During
  // hydration, render without them and apply them once the component settles.
  const initial = isServer ? {} : readDocumentTheme()
  const [value, setValue] = createSignal<DocumentTheme>(deferred ? {} : initial)
  // Call onSettled exactly once. The server reserves one hydration ID for it.
  onSettled(() => {
    if (deferred) setValue(initial)
  })
  return value
}

function resolve(colorScheme: ColorScheme, systemDark: boolean): ResolvedColorScheme {
  if (colorScheme !== 'system') return colorScheme
  return systemDark ? 'dark' : 'light'
}

function restore(element: Element, name: string, value: string | null) {
  if (value === null) element.removeAttribute(name)
  else element.setAttribute(name, value)
}

type DivProps = JSX.IntrinsicElements['div']

/** Props for `ThemeScope`. Other props, such as `class`, `style` and `ref`, go to its `<div>`. */
export interface ThemeScopeProps extends DivProps {
  /**
   * The color scheme when the parent controls it. Pair it with `onColorSchemeChange`.
   * @defaultValue Inherited or system
   * @example <ThemeScope colorScheme={scheme()} onColorSchemeChange={setScheme} />
   */
  colorScheme?: ColorScheme
  /**
   * The initial color scheme when the scope manages it. Without `colorScheme` or
   * `defaultColorScheme`, a nested scope inherits its parent's scheme, and the
   * outermost scope continues the scheme on `<html>`, or follows the system.
   * @defaultValue Inherited or system
   * @example <ThemeScope defaultColorScheme="dark" />
   */
  defaultColorScheme?: ColorScheme
  /**
   * Called with the new color scheme when `setColorScheme` changes this scope.
   * Save the choice here.
   * @defaultValue none
   * @example <ThemeScope onColorSchemeChange={next => localStorage.setItem('scheme', next)} />
   */
  onColorSchemeChange?: (colorScheme: ColorScheme) => void
  /**
   * A theme from `createTheme`, the name of a theme defined in your CSS, or
   * `iris` for the default theme.
   * @defaultValue The parent scope's theme; for the outermost scope, the theme on `<html>` or "iris"
   * @example <ThemeScope theme={acme} />
   */
  theme?: CustomTheme | string
  /**
   * Control size and spacing density inside the scope.
   * @defaultValue The parent scope's density, or the density inherited from the document
   * @example <ThemeScope density="compact" />
   */
  density?: Density
  /**
   * Also applies the theme to `<html>`, so the page background, scrollbars and
   * portals mounted in `<body>` match. Use it on the outermost scope only.
   * @defaultValue false
   * @example <ThemeScope root />
   */
  root?: boolean
}

/**
 * Applies a color scheme, custom theme and density to its subtree through
 * `data-erx-theme` and `data-erx-density`. Scopes nest without changing
 * `:root`, and switching never remounts children.
 * @example
 * <ThemeScope root theme={acme} onColorSchemeChange={save}>
 *   <App />
 * </ThemeScope>
 */
export function ThemeScope(props: ThemeScopeProps): JSX.Element {
  const parent = useContext(ThemeContext)
  // A nested scope without its own setting forwards scheme changes to its parent.
  const owns =
    !parent ||
    untrack(() => props.colorScheme !== undefined || props.defaultColorScheme !== undefined)
  if (import.meta.env.DEV && parent && untrack(() => props.root)) {
    warnInDevelopment(
      'ThemeScope',
      'root is set on a nested scope',
      'Set root only on the outermost ThemeScope',
      themeDocs,
    )
  }
  const [own, setOwn] = createControllableState<ColorScheme | undefined>({
    component: 'ThemeScope',
    prop: 'colorScheme',
    fallback: undefined,
    get value() {
      return props.colorScheme
    },
    get defaultValue() {
      return props.defaultColorScheme
    },
    onChange: next => {
      if (next) props.onColorSchemeChange?.(next)
    },
  })
  // Only the outermost scope reads the document and the system preference.
  const documentTheme = parent ? undefined : createDocumentTheme()
  const systemDark = parent ? parent.systemDark : createMediaQuery(darkQuery)
  const scheme = createMemo(() => own() ?? (parent ? parent.scheme() : documentTheme!().scheme))
  const colorScheme = () => scheme() ?? 'system'
  // The theme token this scope writes. An explicit "iris" is written too, so
  // that the reset rules of an ancestor's custom theme apply.
  const themeToken = createMemo(() => {
    const value = props.theme
    if (value !== undefined) {
      const name = typeof value === 'string' ? value : value.name
      if (name === 'iris' || isThemeName(name)) return name
      warnInDevelopment(
        'ThemeScope',
        `theme ${JSON.stringify(name)} is not a valid theme name`,
        'Pass a theme from createTheme, iris, or a lowercase name with hyphens',
        themeDocs,
      )
    }
    return parent ? parent.theme() : documentTheme!().theme
  })
  const theme = () => themeToken() ?? 'iris'
  const density = () =>
    props.density ?? (parent ? parent.state.density() : documentTheme!().density)
  const attribute = createMemo(() => {
    const tokens = [themeToken(), scheme()].filter(token => token !== undefined)
    return tokens.length > 0 ? tokens.join(' ') : undefined
  })
  // Until the first request, skip a value the scope already shows, such as one
  // it continued from <html>. Later requests go to createControllableState,
  // which compares with the latest queued value, so none is lost.
  let requested = false
  const state: ThemeState = {
    colorScheme,
    resolvedColorScheme: () => resolve(colorScheme(), systemDark()),
    setColorScheme(next) {
      if (!colorSchemes.includes(next)) {
        warnInDevelopment(
          'ThemeScope',
          `color scheme ${JSON.stringify(next)} is not supported`,
          'Use light, dark or system',
          themeDocs,
        )
      } else if (!owns) parent.state.setColorScheme(next)
      else if (requested || next !== untrack(colorScheme)) {
        requested = true
        setOwn(next)
      }
    },
    theme,
    density,
  }

  if (!parent) {
    // Write only what this scope sets. Values it inherits from <html>, such as
    // those a first-paint script applied, stay as they were before the scope.
    createEffect(
      () =>
        props.root
          ? {
              theme: props.theme === undefined ? undefined : theme(),
              scheme: own(),
              density: props.density,
            }
          : undefined,
      value => {
        if (!value) return
        const html = document.documentElement
        const previousTheme = html.getAttribute('data-erx-theme')
        const previousDensity = html.getAttribute('data-erx-density')
        const previousTokens = previousTheme?.trim().split(/\s+/) ?? []
        const tokens = [
          value.theme === undefined ? previousTokens.find(isThemeName) : value.theme,
          value.scheme ?? colorSchemes.find(token => previousTokens.includes(token)),
        ].filter(token => token !== undefined && token !== 'iris')
        if (tokens.length > 0) html.setAttribute('data-erx-theme', tokens.join(' '))
        else html.removeAttribute('data-erx-theme')
        if (value.density) html.setAttribute('data-erx-density', value.density)
        return () => {
          restore(html, 'data-erx-theme', previousTheme)
          restore(html, 'data-erx-density', previousDensity)
        }
      },
    )
  }

  const others = omit(
    props,
    'colorScheme',
    'defaultColorScheme',
    'onColorSchemeChange',
    'theme',
    'density',
    'root',
    'class',
    'children',
  )
  return (
    <ThemeContext value={{ state, theme: themeToken, scheme, systemDark }}>
      <div
        {...others}
        class={['erx-theme-scope', props.class]}
        data-erx-theme={attribute()}
        data-erx-density={density()}
      >
        {props.children}
      </div>
    </ThemeContext>
  )
}

/**
 * Returns the theme of the nearest `ThemeScope`. Outside any scope, it reports
 * the theme on `<html>` or the system color scheme, and `setColorScheme` does nothing.
 * @example
 * const theme = useTheme()
 * <button onClick={() => theme.setColorScheme('dark')}>{theme.resolvedColorScheme()}</button>
 */
export function useTheme(): ThemeState {
  const context = useContext(ThemeContext)
  if (context) return context.state
  const documentTheme = createDocumentTheme()
  const systemDark = createMediaQuery(darkQuery)
  const colorScheme = () => documentTheme().scheme ?? 'system'
  return {
    colorScheme,
    resolvedColorScheme: () => resolve(colorScheme(), systemDark()),
    setColorScheme: () =>
      warnInDevelopment(
        'useTheme',
        'setColorScheme was called outside a ThemeScope',
        'Render a ThemeScope around this component',
        themeDocs,
      ),
    theme: () => documentTheme().theme ?? 'iris',
    density: () => documentTheme().density,
  }
}
