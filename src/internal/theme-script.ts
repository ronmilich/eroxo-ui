import {
  type ColorScheme,
  colorSchemes,
  type CustomTheme,
  failure,
  isThemeName,
} from './custom-theme.js'

/** Options for `themeScript`. */
export interface ThemeScriptOptions {
  /** The `localStorage` key where your app saves `light`, `dark` or `system`. */
  readonly storageKey: string
  /**
   * The color scheme to apply when nothing valid is stored.
   * @defaultValue 'system'
   */
  readonly defaultColorScheme?: ColorScheme
  /** A custom theme to apply with the stored color scheme. */
  readonly theme?: CustomTheme | string
}

// Embed a string in inline script text. The escapes keep the HTML parser from
// ending the element early and keep Solid's server renderer from escaping it.
function literal(value: string): string {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    character => '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0'),
  )
}

/**
 * Returns the source of a small inline script that applies the stored color
 * scheme to `<html>` before the page renders. Put it in `<head>`, before any
 * stylesheet or body content. Saving the choice stays with your app.
 * @example
 * <script innerHTML={themeScript({ storageKey: 'app-color-scheme' })} />
 */
export function themeScript(options: ThemeScriptOptions): string {
  const { storageKey, defaultColorScheme = 'system', theme } = options
  if (typeof storageKey !== 'string' || !storageKey) {
    throw failure('themeScript', 'storageKey is empty', 'Pass the localStorage key your app writes')
  }
  if (!colorSchemes.includes(defaultColorScheme)) {
    throw failure(
      'themeScript',
      `defaultColorScheme ${JSON.stringify(defaultColorScheme)} is not supported`,
      'Use light, dark or system',
    )
  }
  const name = typeof theme === 'object' ? theme.name : theme
  if (name !== undefined && name !== 'iris' && !isThemeName(name)) {
    throw failure(
      'themeScript',
      `${JSON.stringify(name)} is not a valid theme name`,
      'Pass the theme from createTheme or its name',
    )
  }
  const prefix = name === undefined || name === 'iris' ? '' : name + ' '
  // The source avoids <, > and & so it is the same in HTML and in JSX text.
  return (
    '(function(d,s){try{s=localStorage.getItem(' +
    literal(storageKey) +
    ')}catch(e){}if(["light","dark","system"].indexOf(s)==-1)s=' +
    literal(defaultColorScheme) +
    ';d.setAttribute("data-erx-theme",' +
    literal(prefix) +
    '+s)})(document.documentElement)'
  )
}
