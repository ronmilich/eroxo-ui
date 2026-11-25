# UL-18 Theming API

The theming API is public: the root entry and `eroxo-ui/theme` export `ThemeScope`, `useTheme`, `createTheme` and `themeScript`, and `eroxo-ui/theme.css` holds the scope styles. On 25 November 2026 the owner chose a small typed theme helper, confirmed that 1.0 has no `unstyled` mode, and made the API public in canary builds. Names can still change before `0.1.0`. It implements the theme-scope layer of [08 §3.1](https://github.com/ronmilich/taotale/blob/master/docs/08-taotale-design-system.md) with CSS custom properties, `color-scheme`, `prefers-color-scheme` and `light-dark()`. `light-dark()` became Baseline Newly available on 13 May 2024, so it is Baseline Widely available from 13 November 2026, as [ADR 08](adr/08-support.md) requires. [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/) · [light-dark()](https://web-platform-dx.github.io/web-features-explorer/features/light-dark)

## Theme attributes

`data-erx-theme` holds a space-separated list: an optional custom theme name and a color scheme, for example `acme dark`. Select a value with `~=`, as in `[data-erx-theme~='acme']`. The color scheme is `light`, `dark` or `system`. `system` follows `prefers-color-scheme` in CSS, so it paints correctly before any script runs. The root follows the system unless it selects `light` or `dark`. A custom name without a scheme keeps the inherited scheme. `iris`, `light`, `dark` and `system` are reserved. Every built-in token selector has zero specificity, so a custom theme rule in `erx.tokens` always wins. `data-erx-density` keeps its UL-13 values.

## ThemeScope

`ThemeScope` renders a `<div class="erx-theme-scope">` with `data-erx-theme` and `data-erx-density`, and passes other props, such as `class`, `style` and `ref`, to it. The class paints `--erx-color-canvas` and `--erx-color-text`, so a nested scheme stays readable. Override it with your own class, for example to keep a portal wrapper transparent. Switching changes attributes only, so children keep their state.

| Prop                                                       | Meaning                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `colorScheme`, `defaultColorScheme`, `onColorSchemeChange` | A controlled or uncontrolled pair built on `createControllableState`. The callback fires once per real change. |
| `theme`                                                    | A `createTheme` result, the name of a theme in your CSS, or `iris`.                                            |
| `density`                                                  | `compact`, `standard` or `comfortable`.                                                                        |
| `root`                                                     | Also writes the theme and density to `<html>`, and restores the earlier values on disposal.                    |

A nested scope inherits each value it doesn't set from its parent through context, and writes the inherited values on its own element. The outermost scope continues the theme, scheme and density on `<html>`, which a first-paint script may have applied. Without them, it follows the system. During hydration it renders without them and reads `<html>` once it settles.

Without its own `colorScheme` or `defaultColorScheme`, a nested scope passes `setColorScheme` requests to its parent. A theme toggle inside it therefore changes the scope that owns the setting. The outermost scope always owns its setting. Use `root` on one outermost scope. Then the page background, scrollbars and portals mounted in `<body>` follow it.

## useTheme

`useTheme()` returns accessors for `colorScheme`, `resolvedColorScheme`, `theme` and `density`, and a `setColorScheme(scheme)` request. `resolvedColorScheme` is `light` or `dark`. It resolves `system` with one shared media-query listener for the page. Only the outermost scope and hooks outside any scope subscribe. The server and hydration render `light` for `system`, and the value updates once the component settles. Outside any scope, the hook reports the theme on `<html>` or the system scheme, and `setColorScheme` gives a development warning.

## Custom themes

`createTheme(name, { shared, light, dark })` returns `{ name, css }`. `shared` sets tokens for both schemes. `light` and `dark` set colors for one scheme. TypeScript checks the keys against `ThemeToken` and `ThemeColorToken`, which `pnpm generate:tokens` writes to `src/internal/theme-tokens.ts` from `tokens/iris.json`. `ThemeToken` excludes three kinds of token:

- tokens that a root alias copies, such as `--erx-radius-md` inside `--erx-radius-control`;
- density aliases, which the `density` prop owns;
- motion tokens that reduced motion replaces, so a theme can't defeat that preference.

Set the role token instead, for example `--erx-radius-control`.

```ts
const quietStudy = createTheme('quiet-study', {
  shared: { '--erx-radius-control': '4px' },
  light: { '--erx-color-primary': '#3d6b57', '--erx-color-canvas': '#fbf8f1' },
  dark: { '--erx-color-primary': '#86d3b1' },
})
// [data-erx-theme~='quiet-study'] {
//   --erx-radius-control: 4px;
//   --erx-color-primary: light-dark(#3d6b57, #86d3b1);
//   --erx-color-canvas: light-dark(#fbf8f1, var(--erx-neutral-950));
// }
```

A color set for one scheme uses the shared value or the Iris value in the other scheme. `light-dark()` resolves where the token is used, from that element's `color-scheme`. The same theme therefore works under an explicit, inherited or system scheme. The rule sits in `@layer erx.tokens`, so your unlayered CSS still overrides it. Invalid names, token names and values containing braces, semicolons, angle brackets or `!` throw a `TypeError`. In development, the helper resolves each documented contrast pair with your overrides and warns about any pair below its minimum. It checks only opaque hex colors.

Load `css` once. The best place is a stylesheet written at build time, because `createTheme` runs in Node. A `<style>` element in the server-rendered `<head>` also works. Calling `createTheme` in browser code adds the Iris color table, about 2.3 KB gzipped. Apps that only use `ThemeScope` don't load the table.

## First paint

`themeScript({ storageKey, defaultColorScheme, theme })` returns the source of a small inline script. It reads `light`, `dark` or `system` from `localStorage` and writes it, with the theme name, to `<html>`. Without a valid stored value it uses `defaultColorScheme`, which defaults to `system`. Put it in `<head>` before any body content, for example `<script innerHTML={themeScript(options)} />` in a server-rendered document. In a Vite SPA, inject the same string into `index.html` with a `transformIndexHtml` hook. The source contains no `<`, `>` or `&`, so it is identical in HTML and JSX text. Add a `nonce` when the page uses a Content Security Policy.

Saving the choice stays with the app: write it in `onColorSchemeChange`. With a stored preference and SSR, leave the outermost scope uncontrolled. It continues the scheme the script applied once it hydrates, so the server and client render the same markup. An app that knows the preference on the server, from a cookie for example, can render `data-erx-theme` on `<html>` and pass `colorScheme` instead.

## Overlays

Native top-layer content, such as `<dialog>.showModal()` and popovers, keeps its place in the DOM. It inherits the nearest scope, and `::backdrop` inherits from its dialog. Solid portals mount in `<body>` and inherit `<html>`. That matches the outermost scope when it uses `root`. Inside a nested scope, wrap portal content in a `ThemeScope` without props. It writes the nested scope's theme, scheme and density again from context. App CSS on an ancestor, such as `.panel { --erx-color-primary: … }`, doesn't travel with a portal. Put such overrides in a theme.

## Shared media queries

`createMediaQuery(query)` in `src/internal/media-query.ts` serves both themes and motion. Each query has one source and at most one listener while consumers exist. A new client render reads the query at once. Hydration keeps the server value, `false`, until the component settles. Each call registers exactly one `onSettled`, because the server reserves a hydration ID for it.

Code that runs only in development must not create Solid owners, such as effects, memos or `onSettled`, in a hydrating component. A server built without development mode would then disagree with a development client about hydration IDs. The development-only effect in `createControllableState` breaks this rule: it is safe while the server and the client agree on `import.meta.env.DEV`, as they do in Vite.

## Verification

The browser fixture imports the packed package from both entries. It checks first paint with a stored scheme before the application module runs: stored dark on a light system, stored light on a dark system, and the system default. It then checks that hydration keeps the server element, and that light, dark, system and custom themes switch without remounting an edited input. It also covers the nested dark compact scope, dialog and backdrop inheritance, portal inheritance with and without a scope, the saved choice, a reload and the restored `<html>` after disposal. Axe runs in light and dark.

Unit tests cover inheritance, ownership, the shared listener, document adoption, `<html>` restoration, the theme CSS, validation, contrast warnings and the script. Server tests render nested scopes. Chromium 156 and WebKit 27.2 passed locally. Firefox can't run on the maintainer's Mac, so the CI run covers it. Removing the inline script made the stored dark scheme paint light, which shows that the first-paint check detects a flash.

To open the fixture, run the following commands and visit `/theme/` on the preview server.

```sh
pnpm build
node --input-type=module -e "import { buildThemeFixture } from './test/browser/theme.mjs'; await buildThemeFixture(process.cwd())"
pnpm exec vite preview --host 127.0.0.1
```
