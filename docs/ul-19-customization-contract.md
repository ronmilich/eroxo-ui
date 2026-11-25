# UL-19 Customization contract

This milestone makes the five customization layers of [08 §3.1](https://github.com/ronmilich/taotale/blob/master/docs/08-taotale-design-system.md) enforceable and testable. It adds internal styling helpers, lint rules for library CSS, a reusable browser harness that every component milestone runs, a private multi-part test component, the opt-in Tailwind v4 bridge and a first draft of the [Customization guide](customization.md). On 25 November 2026 the owner chose a bridge that maps semantic roles only and put the guide's first draft in the repository docs. [Component rulebook §3 and §8](design-system/eroxo-iris-component-anatomy-api-spec.md)

## Styling helpers

`src/internal/styling.ts` holds the helpers that components use. They are internal, like the other primitives.

- `defineStyleAxes({ component, variants, defaultVariant, tones, defaultTone, sized })` declares a component's style axes. `StyleAxisProps<typeof axes>` types the matching props, so an unsupported variant, tone or size fails to type-check, and an axis without values has no prop.
- `createStyleAttributes(axes, props)` returns reactive getters for `data-erx-variant`, `data-erx-tone` and `data-erx-size`; spread them on the root. Variant and tone always render their resolved value. Size renders only when it is set, so an omitted size follows the density scope. An unsupported value from untyped code gives a development warning and falls back to the default.
- `createStateAttributes({ state, disabled, invalid, loading })` returns `data-erx-state` and the flag attributes. Flags are present with an empty value when true and absent otherwise. Pass getters to keep them reactive. They never replace native or ARIA state.
- `createPartClasses(block, props)` returns `part()` for the root (`erx-<block>` plus `class`) and `part(name)` for a part (`erx-<block>__<name>` plus its `classes` entry), in Solid's class-list form.

## Library CSS rules

Stylelint now enforces the contract on `src/**/*.css` and on the test component's CSS:

- `eroxo/layered-rules`: every rule sits inside `@layer erx.tokens` or `@layer erx.components`. Unlayered consumer CSS therefore always wins, so `!important` is never needed.
- `eroxo/public-properties`: public `--erx-*` values are declared only in `erx.tokens`. Components set private `--_erx-*` variables.
- `eroxo/component-hooks`: in `erx.components`, a `var(--erx-*)` that is not an Iris token must be a hook named `--erx-<component>-<property>` for a component class in the same selector. Each component may read at most four. The rule also catches misspelled token names.

`src/tailwind.css` is exempt from the layer statement, layered rules and the `--erx-` name pattern, because it contains Tailwind theme variables.

## Contract harness

`test/browser/customization/` holds the harness. A component fixture renders `ContractScenarios` with a `render(scenario)` function and puts `contractTheme.css` in its head. Its build adds `contractStyles(contract)` to the head, and the browser check calls `checkCustomizationContract(page, contract)`. The contract names the root selector, a themed property, a property that follows a token the theme omits, a part, the part that receives `classes`, a variant to render, and a hook with its fallback token. The harness checks five things:

1. **Custom theme:** a theme that changes only the primary color reaches the component, and other tokens keep their Iris values.
2. **Nested theme:** a dark scope applies inside, and its light sibling is unaffected.
3. **Slot override:** consumer CSS on the part class wins, and the `classes` entry lands on the right part.
4. **Variant override:** the attribute reports the resolved variant, and consumer CSS for it wins.
5. **Missing-token fallback:** without the hook, the component uses its token; a consumer hook replaces it.

The consumer CSS uses zero-specificity `:where()` selectors, so it can win only through layer precedence. As a negative control, the check failed when the test component's CSS lost its layer.

`Probe` (`test/browser/customization/probe.tsx`) is the private test component: a root, an icon part and a label part, two variants, three tones, sizes, a disabled state and three hooks. The customization fixture runs the harness on it. A separate restyle section changes every part, a state, a tone, a size and a hook from unlayered CSS. The check scans that CSS and accepts only documented classes, attributes and hooks, and no `--_erx-*` or `!important`.

## Tailwind bridge

`pnpm generate:tokens` writes `src/tailwind.css` from `tokens/iris.json`: one `@theme inline` block mapping 134 color roles, 20 radius roles, 9 elevation roles, the two font families and 21 density aliases into Tailwind's `color`, `radius`, `shadow`, `font` and `spacing` namespaces. `inline` makes each utility read the Eroxo variable where it is used, which keeps utilities correct in nested theme and density scopes. The style build copies the file unchanged: no Lightning CSS pass and no `erx` layer statement, because the consumer's stylesheet sets the order. The package exports it as `eroxo-ui/tailwind.css`, and `styles.css` doesn't include it.

The documented consumer order is `@layer theme, base, erx, components, utilities;` before `@import 'tailwindcss'`, in a stylesheet that loads before any Eroxo CSS. The Tailwind fixture (`fixtures/tailwind`) installs `tailwindcss` 4.3.5, `@tailwindcss/vite` 4.3.5 and `vite` 8.3.8 in its own temporary project. It checks base < Eroxo < utilities < unlayered CSS with an ID-specific base-layer rule, and checks the utilities in light, dark, custom-theme and compact scopes. It also confirms that the generated `.bg-erx-surface` reads `var(--erx-color-surface)`. Tailwind's shadow utilities stack the Eroxo shadow after their transparent ring layers. Without the `@layer` line, the check fails, which is the negative control.

## Verification

Unit tests cover the helpers, the type restrictions and the test component's attributes. Node tests cover the lint rules, the Tailwind exemption and the generated bridge. The customization harness and the Tailwind fixture passed in Chromium 156 and WebKit 27.2 against a local build; Firefox runs in CI. Tailwind was downloaded for the local run only, with the owner's permission; the repository has no Tailwind dependency.

To open the customization fixture, run these commands and visit `/customization/` on the preview server.

```sh
pnpm build
node --input-type=module -e "import { buildCustomizationFixture } from './test/browser/customization.mjs'; await buildCustomizationFixture(process.cwd())"
pnpm exec vite preview --host 127.0.0.1
```
