# Customizing Eroxo UI

**Draft (UL-19, 25 November 2026).** The examples use the planned Button and Dialog names; Button arrives with UL-20 (`0.1.0`), which also moves this guide into the docs site and the package.

Eroxo components are styled by default, and you can change their look without forking them. Five layers go from the broadest change to the narrowest: tokens, theme scopes, variants and sizes, parts and state attributes, and your own class and style. Every name in this guide is public API. Anything else, such as `--_erx-*` variables or the elements inside a component, can change in any release.

## How your CSS wins

Eroxo puts all of its CSS in two cascade layers, `erx.tokens` and `erx.components`. CSS outside any layer beats layered CSS whatever its specificity. So your ordinary stylesheet wins over every Eroxo rule, and you never need `!important`.

```css
/* Wins over Eroxo even with zero specificity. */
:where(.erx-button) {
  border-radius: 999px;
}
```

If your app uses its own layers, declare them after Eroxo's: `@layer erx, app;`.

## 1. Tokens

Every design value is a CSS custom property that starts with `--erx-`. The [token reference](https://ronmilich.github.io/eroxo-ui/tokens/) lists them. Set tokens in your stylesheet, on `:root` for the whole page or on any element for its subtree.

```css
:root {
  --erx-radius-control: 4px;
  --erx-font-sans: 'Inter', system-ui, sans-serif;
}
```

Prefer semantic roles, such as `--erx-color-primary` or `--erx-radius-control`, over palette shades such as `--erx-iris-700`. Roles have separate light and dark values and keep their contrast.

## 2. Theme scopes

`ThemeScope` applies a color scheme (`light`, `dark` or `system`), a custom theme and a density to everything inside it. Scopes nest, and switching never remounts the content. `createTheme` turns token overrides into static CSS; TypeScript checks the token names, and development builds warn when a color pair falls below its contrast minimum. `themeScript` applies a saved color scheme before the page paints.

```tsx
const brand = createTheme('brand', {
 light: { '--erx-color-primary': '#1c61bf' },
 dark: { '--erx-color-primary': '#8fb8ff' },
})


<ThemeScope root theme={brand} density="compact">
 <App />
</ThemeScope>
```

Load `brand.css` once, in a stylesheet or a `<style>` element. The [theming notes](ul-18-theming-api.md) cover persistence, first paint, portals and the native top layer.

## 3. Variants, tones and sizes

Components that offer a style choice take `variant`, `tone` and `size` props. Their values are `solid`, `soft`, `outline`, `ghost` and `text`; `primary`, `neutral`, `success`, `warning`, `danger` and `info`; and `sm`, `md` and `lg`. Each component supports only some of them, and TypeScript rejects the rest. The component writes the choice to `data-erx-variant`, `data-erx-tone` and `data-erx-size`, so your CSS can target it:

```css
.erx-button[data-erx-variant='ghost'] {
  text-decoration-line: underline;
}
```

`data-erx-size` appears only when you pass `size`. Without it, a control takes its size from the nearest density scope: `compact`, `standard` or `comfortable`.

## 4. Parts, state attributes and hooks

Each part of a component has a stable class: `erx-<component>` on the root and `erx-<component>__<part>` on parts, such as `erx-dialog__title`. Multi-part components also accept a `classes` prop that adds your class to a part: `classes={{ title: 'my-title' }}`.

State appears as data attributes. They mirror native and ARIA state; they never replace it.

| Attribute                                                   | Meaning                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `data-erx-state`                                            | Logical state: `open`, `closed`, `checked`, `unchecked`, `indeterminate` or `active` |
| `data-erx-disabled`, `data-erx-invalid`, `data-erx-loading` | Present, with an empty value, while the state applies                                |
| `data-erx-presence`                                         | Animation phase: `entering`, `open` or `exiting`                                     |
| `data-erx-side`                                             | Placement of a floating part after positioning                                       |

A component can offer up to four hooks: CSS variables named `--erx-<component>-<property>`, such as `--erx-button-bg`. Set a hook on the component or an ancestor; without it, the component uses its token.

```css
.checkout {
  --erx-button-bg: var(--erx-color-success);
}
```

## 5. Class and style

Every component passes `class`, `style` and other native attributes to its root element. Combine them with the part classes and state attributes above.

## Tailwind CSS (optional)

Eroxo never requires Tailwind. In a Tailwind v4 app, the bridge turns Eroxo tokens into Tailwind classes that follow light, dark and custom themes and density scopes:

```css
/* app.css */
@layer theme, base, erx, components, utilities;
@import 'tailwindcss';
@import 'eroxo-ui/tailwind.css';
```

Load this stylesheet before any Eroxo CSS, so that its first line sets the layer order. A `<link>` in `<head>` does that reliably; if you import it from JavaScript, import it first. The order puts Tailwind's preflight below Eroxo and Tailwind's utilities above it, and your unlayered CSS still wins.

| Eroxo token                          | Tailwind classes                                                         |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `--erx-color-<role>`                 | `bg-erx-surface`, `text-erx-text-secondary`, `border-erx-border-default` |
| `--erx-radius-<role>`                | `rounded-erx-control`                                                    |
| `--erx-elevation-<role>`             | `shadow-erx-popover`                                                     |
| `--erx-font-sans`, `--erx-font-mono` | `font-erx-sans`, `font-erx-mono`                                         |
| `--erx-density-<role>`               | `p-erx-card-padding`, `gap-erx-form-gap`                                 |

The bridge covers semantic roles only. Palette shades are left out because they don't change with the theme.
