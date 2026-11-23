# Eroxo Iris — Spacing & Sizing System Specification

**Specification ID:** ERX-DS-SPACE-001  
**Version:** 0.2.0  
**Date:** 23 November 2026  
**Status:** Design decisions finalized; implementation and browser/SSR conformance pending  
**Maintainer:** Eroxo UI  
**Depends on:** ERX-DS-COLOR-001 (color) and ERX-DS-TYPE-001 (typography)  
**Applies to:** SolidJS 2, TypeScript, ordinary CSS, light/dark/custom themes, nested density scopes, international layouts, SSR.

> **0.2.0 (23 November 2026):** revised to match the approved [Iris reconciliation record](reconciliation.md): C2, C7, D1, D2, D6, and its gaps on paths and missing companion files. Choices it leaves open are listed under "Open items after 0.2.0".

> **Normative scope.** This document specifies geometry and spacing for Eroxo's base components. **MUST** denotes a release requirement; **SHOULD** a strong design recommendation. The token JSON, planned but not yet in the repository, is the machine-readable source; the tables below define its intended behavior, and UL-13 may generate the JSON from them. Approval of the design contract is **not** a claim of complete browser, accessibility, or package verification.

## 1. Approved decisions and non-goals

1. **Grid:** a 4px nominal spacing grid with 2px micro-adjustments for precise internal alignment. Spacing is generated in `rem`, not fixed px.
1. **Size vocabulary:** public interactive component size values are `sm` **/** `md` **/** `lg`; no `xs` / `xl` in the initial baseline.
1. **Density model A:** inherited `compact` **/** `standard` **/** `comfortable` chooses the *default* component size `sm` / `md` / `lg`, respectively. An explicit `size` prop overrides density for that component's size-dependent geometry.
1. **Container rhythm:** balanced cards and dialogs. Standard card padding 20px and standard dialog padding 24px; compact/comfortable mappings are specified below.
1. **Responsive behavior:** controls do **not** automatically change size at viewport breakpoints. Applications select touch-friendly `lg` controls or a `comfortable` scope explicitly. Layout *may* reflow automatically to avoid overflow.
1. **Typography independence:** the 14px UI / 16px body roles, the system font defaults, and font fallback behavior from ERX-DS-TYPE-001 are unchanged by density. Component text uses semantic type tokens.
1. **Color independence:** backgrounds, borders, text, and focus indicators consume `--erx-color-*` from ERX-DS-COLOR-001; spacing tokens do not vary between light/dark unless a consumer intentionally overrides them.
1. **Accessibility:** every documented control must preserve pointer targets, focus visibility, text enlargement, 320px viewport reflow, international glyphs, and keyboard behavior. Geometry values denote **minimums**, never a license to clip content.
1. **Style architecture:** generated CSS uses `@layer erx.tokens`, no Tailwind, no runtime CSS-in-JS, and no global application width or font-size resets.
1. **Unresolved separate foundations:** corner radii, shadow levels, icon artwork, and motion remain distinct specifications. This document freezes only size and spacing constraints; reference visuals may use temporary decorative styles.

## 2. Terminology and precedence

- **Spacing primitive:** fixed nominal interval such as `--erx-space-4` (16px equivalent).
- **Explicit size primitive:** dimensions for `sm`, `md`, `lg`, e.g. `--erx-control-height-lg` (a *minimum* of 48px).
- **Density semantic token:** active mapping on the nearest `[data-erx-density]` scope, e.g. `--erx-control-default-min-block-size` or `--erx-card-padding`.
- **Component geometry:** component CSS consumes those tokens; `data-erx-size="lg"` is an explicit size override.
- **Scope:** ordinary DOM ancestor with `data-erx-density`, or the element itself. Overlays render in the browser's top layer in place, so they stay descendants of their scope and inherit its density; a portal fallback, if the UL-05 native-first ADR ever needs one, is only a descendant if the actual DOM placement preserves ancestry.

**Resolution rule:** component-scoped/consumer CSS override > explicit `size` component rules > active density defaults > root (`standard`) defaults. This is a **semantic precedence policy**, not a promise that arbitrary CSS declarations automatically outrank specificity or cascade layers; CSS authors must honor the documented cascade.

Crucially: **do not set** `data-erx-size="md"` **on every default component**. Leave the size attribute absent when the `size` prop is omitted, allowing density to select the default. If a consumer explicitly passes `size="md"`, it MUST be rendered and wins even in compact/comfortable scopes.

## 3. Primitive spacing scale

The root font size is consumer/browser-controlled. `1rem` equals 16px only at a 16px root; these px values are documentation equivalents, not hardcoded CSS lengths. Consumers who increase their root font size should see proportional spacing and controls.

| Scale key | Nominal px | CSS value | Use |
|---|---|---|---|
| `0` | 0 | `0` | Zero |
| `0-5` | 2 | `0.125rem` | Micro |
| `1` | 4 | `0.25rem` | Standard |
| `1-5` | 6 | `0.375rem` | Micro |
| `2` | 8 | `0.5rem` | Standard |
| `2-5` | 10 | `0.625rem` | Micro |
| `3` | 12 | `0.75rem` | Standard |
| `4` | 16 | `1rem` | Standard |
| `5` | 20 | `1.25rem` | Standard |
| `6` | 24 | `1.5rem` | Standard |
| `7` | 28 | `1.75rem` | Standard |
| `8` | 32 | `2rem` | Standard |
| `10` | 40 | `2.5rem` | Standard |
| `12` | 48 | `3rem` | Standard |
| `14` | 56 | `3.5rem` | Standard |
| `16` | 64 | `4rem` | Standard |
| `20` | 80 | `5rem` | Standard |
| `24` | 96 | `6rem` | Standard |

**Governance:** `0.5` (2px), `1.5` (6px), and `2.5` (10px) are intentionally allowed micro-steps, especially for icon/text gaps, labels, table alignment, tooltip padding, and glyph adjustments. Standard structure should generally use 4px multiples. Do not invent arbitrary 3, 5, 7 or 13px values inside components; propose a token with a cross-component use case if necessary.

## 4. Explicit control sizes

At the 16px reference root:

| Size | Minimum height (px) | Inline padding / side (px) | Block padding / side (px) | Internal gap (px) | Icon box (px) |
|---|---|---|---|---|---|
| `sm` | 32 | 12 | 4 | 6 | 16 |
| `md` | 40 | 16 | 6 | 8 | 18 |
| `lg` | 48 | 20 | 8 | 10 | 20 |

**CSS names:** `--erx-control-height-{size}`, `--erx-control-padding-inline-{size}`, `--erx-control-padding-block-{size}`, `--erx-control-gap-{size}`, and `--erx-control-icon-size-{size}`. The `height` name is historical shorthand; implementations MUST apply it with `min-block-size`, not a rigid `height`. The control minimum includes border and padding under `box-sizing: border-box`.

### 4.1 Sizing behavior for actual components

- **Button / IconButton / input / Select trigger / Combobox trigger / Toggle / Tabs trigger / menu item:** use the selected minimum block size, suitable content-based padding, and the semantic UI text role. Items can grow when text wraps, when fallback fonts expand, or when the user enlarges text.
- **IconButton:** minimum *inline and block* target dimensions are 32/40/48px; an accessible label is required. Optical icon drawing can be smaller than its hit area.
- **TextField:** no global fixed width; use `min-inline-size: 0` in flexible containers, a component-documented preferred width if necessary, and a `fullWidth` option. The inline field is allowed to shrink as its container narrows.
- **Checkbox / Radio:** the clickable label row has 32/40/48px minimum block size, while the square/circle glyph is 16/18/20px (separate geometry). The entire label and indicator should activate the native input where applicable.
- **Switch:** interactive target follows 32/40/48px; the visual track is 32×18 / 36×20 / 44×24px. Do not shrink the hit area to the track's visual box.
- **Slider:** thumb visual diameter 16/18/20px is independent of the control's hit target. Ensure at least a 24×24 CSS-pixel effective target or the applicable spacing/exception conditions; a generous interaction surface is recommended.
- **Badge:** 20/24/28px minimum block size; a noninteractive badge is not a button. **Interactive Chip:** 28/32/40px minimum block size and documented target/spacing rules.
- **Textarea:** minimum block size 80/96/112px; user input and translated labels may grow it. Do not force `overflow: hidden` on an editable area.
- **Table:** row minimum 36/44/52px; cell padding is density-aware and row height remains content-driven. Dense data tables need separate horizontal-scroll and reflow strategy.
- **Progress, skeleton, separators, toast, popover, dialog:** consume semantic component geometry; do not indiscriminately apply control heights to decorative elements.

### 4.2 Additional geometry primitives

| Primitive suffix (`--erx-…-{size}`) | sm (px) | md (px) | lg (px) |
|---|---|---|---|
| `badge-min-block-size` | 20 | 24 | 28 |
| `chip-min-block-size` | 28 | 32 | 40 |
| `textarea-min-block-size` | 80 | 96 | 112 |
| `check-glyph-size` | 16 | 18 | 20 |
| `switch-track-inline-size` | 32 | 36 | 44 |
| `switch-track-block-size` | 18 | 20 | 24 |
| `slider-thumb-size` | 16 | 18 | 20 |
| `table-row-min-block-size` | 36 | 44 | 52 |

The geometry above is not a separate fourth public size vocabulary: it maps to the same `sm/md/lg` values. Geometry keys are consumed only by components that need them.

## 5. Density mappings — authoritative values

All quantities below are nominal pixels except the first row (size name). These are **semantic aliases scoped to the nearest density provider**. At the default root, standard values apply.

| Token role | Compact | Standard | Comfortable |
|---|---|---|---|
| Control default size | sm | md | lg |
| Card padding | 16 | 20 | 24 |
| Dialog padding | 20 | 24 | 32 |
| Form vertical gap | 12 | 16 | 20 |
| Field label gap | 4 | 6 | 8 |
| Field helper gap | 4 | 6 | 8 |
| Action group gap | 8 | 12 | 16 |
| Section gap | 24 | 32 | 40 |
| Page gutter | 16 | 24 | 32 |
| Popover padding | 12 | 16 | 20 |
| Tooltip padding | 8 | 10 | 12 |
| Alert padding | 12 | 16 | 20 |
| Toast padding | 12 | 16 | 20 |
| Menu padding | 4 | 6 | 8 |
| Table cell padding block | 8 | 10 | 12 |
| Table cell padding inline | 12 | 16 | 20 |
| List-row gap | 6 | 8 | 10 |

**Generated token grammar:** `--erx-{role}` for the role names in the table (e.g. `--erx-card-padding`, `--erx-form-gap`, `--erx-field-label-gap`, `--erx-table-cell-padding-inline`). Density also sets `--erx-control-default-{min-block-size|padding-inline|padding-block|gap|icon-size}` to the selected size primitives. The active mapping controls un-sized components, card/dialog padding and layout rhythm; an explicit control size overrides its own axes **but must not unexpectedly change the containing card's density**.

### 5.1 Density-sensitive versus invariant properties

| Changes with density | Invariant unless explicitly overridden |
|---|---|
| Default control minimum height and padding | UI/body type roles and font-size |
| Component icon box/gaps | Light/dark Iris colors and focus-ring colors |
| Card/dialog/popover/tooltip/menu spacing | Corner radii (future Shape spec) |
| Form, section, action and page rhythm | Keyboard behavior, text semantics and required labels |
| Table cell padding and row content rhythm | Viewport breakpoints; no mobile-only size changes |

**Important:** setting an explicit `size="lg"` on a Button inside a compact Card does not increase the Card's padding. To change both, apply a comfortable density scope to the Card or a wrapper.

## 6. CSS mapping, cascade and scoped overrides

### 6.1 Minimum viable generated CSS

```css
@layer erx.tokens, erx.components;

/* Shared with the Eroxo color and typography token stylesheets. */
@layer erx.tokens {
  :root {
    --erx-space-1: 0.25rem;
    --erx-space-4: 1rem;
    --erx-control-height-sm: 2rem;
    --erx-control-height-md: 2.5rem;
    --erx-control-height-lg: 3rem;
  }
  :root, [data-erx-density="standard"] {
    --erx-control-default-min-block-size: var(--erx-control-height-md);
    --erx-card-padding: 1.25rem;
  }
  [data-erx-density="compact"] {
    --erx-control-default-min-block-size: var(--erx-control-height-sm);
    --erx-card-padding: 1rem;
  }
  [data-erx-density="comfortable"] {
    --erx-control-default-min-block-size: var(--erx-control-height-lg);
    --erx-card-padding: 1.5rem;
  }
}
```

The **real generated stylesheet** includes every token in Sections 3–5. Values must be generated from `tokens/spacing.json`; never manually maintain a separate CSS truth.

### 6.2 Component implementation and explicit-size precedence

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    min-inline-size: 0;
    min-block-size: var(--erx-control-default-min-block-size);
    padding-block: var(--erx-control-default-padding-block);
    padding-inline: var(--erx-control-default-padding-inline);
    gap: var(--erx-control-default-gap);
    font-size: var(--erx-type-ui-strong-size);
    line-height: var(--erx-type-ui-strong-line-height);
    color: var(--erx-color-on-primary);
    background: var(--erx-color-primary);
    /* Shape, focus and interaction rules are separate contracts. */
  }
  .erx-button[data-erx-size="lg"] {
    min-block-size: var(--erx-control-height-lg);
    padding-block: var(--erx-control-padding-block-lg);
    padding-inline: var(--erx-control-padding-inline-lg);
    gap: var(--erx-control-gap-lg);
  }
}
```

A complete reference `sm/md/lg` button stylesheet and SolidJS usage sketch are planned but not yet in the repository. **These are implementation examples, not an already-published** `Button` **API.** Prefer `min-block-size` and soft wrapping rather than exact height; never hide focus outlines. Apply `box-sizing: border-box` inside each component boundary rather than imposing a universal selector on the consumer application.

### 6.3 Custom-property inheritance pitfall

CSS variables are inherited **as computed values**. If `--erx-control-default-min-block-size` is computed on an ancestor using `var(--erx-control-height-md)`, changing only `--erx-control-height-md` on a descendant **will not retroactively recompute the inherited default alias**.

Therefore, a nested density scope MUST re-declare its default aliases locally (the generated CSS does so). For a local size adjustment, either set `data-erx-size` explicitly, re-declare `--erx-control-default-min-block-size` on that scope/element, or override the component's public size variable according to the customization API. Do not rely on descendant primitive overrides alone. Verify with computed styles in the browser.

### 6.4 Nested scopes and explicit control overrides

```tsx
<DensityScope density="compact">
  <Button>Small by default</Button>
  <Button size="lg">48px minimum even here</Button>
  <DensityScope density="comfortable">
    <Button>48px by default in nested scope</Button>
    <Button size="sm">32px minimum explicitly</Button>
  </DensityScope>
</DensityScope>
```

`DensityScope` is a **reference example**, not yet in the repository. The actual design-system provider API should merge density with Eroxo's existing theme scope during UL-18. The library MUST not assume the consumer uses a particular tag name for scope elements; the essential contract is the generated `data-erx-density` attribute and CSS inheritance.

## 7. Layout, widths and responsive containment

Eroxo's component package does not apply any global page width. It provides **opt-in width presets** and guards that components may use. Applications own their page grid, container queries, breakpoints and overall layout design.

| Public token | Nominal px | CSS value |
|---|---|---|
| `--erx-layout-content-readable` | 672px | `42rem` |
| `--erx-layout-content-wide` | 1152px | `72rem` |
| `--erx-layout-dialog-sm` | 448px | `28rem` |
| `--erx-layout-dialog-md` | 576px | `36rem` |
| `--erx-layout-dialog-lg` | 768px | `48rem` |
| `--erx-layout-popover-min-inline-size` | 192px | `12rem` |
| `--erx-layout-popover-max-inline-size` | 384px | `24rem` |

- **Readable content** 42rem is a reference text-column maximum; **wide content** 72rem is a reference page-container maximum. Do not force either on consumer `body` or `main`.
- **Dialogs:** optional inline-width presets 28/36/48rem, constrained by the viewport and a margin. For example `inline-size: min(100%, var(--erx-layout-dialog-md))` plus `max-inline-size: calc(100vi - 2 * var(--erx-page-gutter))`; ensure padded viewports still reflow.
- **Popover:** optional 12rem minimum / 24rem maximum where available space allows; never allow a minimum to force overflow below that width. Use placement and available-space information from the overlay primitive.
- **Inputs and components in flex/grid:** set `min-inline-size: 0` where necessary; containers may use `minmax(0, 1fr)` and `max-inline-size: 100%` so narrow viewports don't overflow.
- **Content expansion:** content-driven block size; dialogs or menus may scroll internally if large enough to preserve keyboard navigation and a perceivable close path. No hardcoded full-viewport heights.
- **RTL/vertical writing:** use CSS logical properties (`padding-inline`, `margin-inline`, `min-block-size`, `inline-size`) rather than hardcoded left/right. Icons and meaning-dependent order need separate direction-aware logic.
- **Viewport:** automatic *reflow* and width containment do not count as automatically changing the control `size`; this preserves the approved explicit responsive sizing policy.

## 8. Integration with the finalized colors and typography

**No duplicate color or typography source.** This spec MUST NOT reassign `--erx-color-*` or `--erx-type-*`. The stylesheets share the `erx.tokens` layer; component CSS consumes all three token families:

| Source | Approved public family | Used for |
|---|---|---|
| Color spec ERX-DS-COLOR-001 | `--erx-color-*` | Text, surfaces, borders, focus, status |
| Typography spec ERX-DS-TYPE-001 | `--erx-font-*`, `--erx-type-*` | Font stacks (system by default), UI/body roles, leading |
| Spacing spec ERX-DS-SPACE-001 | `--erx-space-*`, `--erx-control-*`, density roles | Min sizes, padding, icon gaps, layout |

The visible icon box size varies by component size (`16/18/20px`), but whether an icon is a filled or stroked glyph, its optical alignment and the actual icon set remain the Iconography foundation's responsibility. Do not substitute nonsemantic glyphs in place of text labels.

**Theme independence:** changing `[data-erx-theme="dark"]` must not alter geometry; changing `[data-erx-density="compact"]` must not alter Iris colors or global font sizes. Scopes may nest in either order and may be combined on the same element. The token generator redeclares density aliases only on density scopes and color aliases only on theme scopes, so a theme scope nested inside a compact scope keeps the compact values.

## 9. Browser, zoom, touch and accessibility requirements

### 9.1 Target sizing and accessibility

- Aim for **WCAG 2.2 AA**, especially **2.5.8 Target Size (Minimum)** (24×24 CSS px or an applicable exception). A 32×32 default `sm` IconButton exceeds the bare 24px minimum, but adjacent targets, non-square targets and overlapping hit regions still require testing. For larger touch-first interfaces prefer explicit 48px / `comfortable`.
- **2.5.5 Target Size (Enhanced)** is a stricter AAA criterion (44×44 CSS px) with exceptions. `lg` meets the nominal square-target size; do not claim every complex component meets AAA merely because its Button size is 48px.
- At **200% text resizing** and **400% browser zoom / 320 CSS-px reflow equivalent**, controls must remain usable and readable. `min-block-size` must not be paired with clipping `overflow:hidden` on essential text.
- With the **WCAG text-spacing override**, control labels, placeholders, validation and help text must not collide with borders or other targets. Long translated labels may wrap or use a documented accessible disclosure; avoid fixed-height content blocks.
- Pointer targets are not equivalent to decorative glyph sizes. Checkbox circles, switch tracks and slider thumbs may be smaller visually if the actual interactive region meets the requirement.
- Keep focus indicators visible using the color specification's focus tokens and appropriate focus-outset space; ensure neighboring overflow containers do not crop the ring.
- For dialogs/overlays, preserve viewport margins and support scrollable content without trapping controls offscreen; keyboard focus, dismissals and scroll lock remain behavior-layer tasks.

### 9.2 LTR, RTL and international stress cases

- `dir="rtl"` and Hebrew/Arabic: inline padding and gap remain symmetric; start/end icon placement follows DOM semantics or a deliberate icon-order rule, not left/right margins.
- Chinese/Japanese/Korean: font fallback may change line boxes; test long no-space sequences and punctuation without clipping. Keep typography role heights independent from density.
- Mixed RTL/LTR identifiers and numerical values: use `dir="auto"`, `<bdi>` or equivalent where appropriate; do not rely on padding tricks to fix bidi order.
- Vertical writing modes: logical sizing and padding should behave consistently where the component is documented to support them; note any deliberate limitation in the conformance report.
- User root font change to 20/24px equivalent must scale rem-based tokens without JS remeasurement or SSR mismatch. Controls may grow more than their nominal 32/40/48px minima to contain actual text.

## 10. SolidJS, SSR, theming and overlays

**Public component API requirement:** styleable controls accept `size?: 'sm' | 'md' | 'lg'`. If omitted, no `data-erx-size` is emitted; if explicit, render that exact value. Do not default `size = 'md'` in component code: doing so would defeat compact/comfortable density. For non-interactive or semantically distinct components (e.g. Badge/Separator), document whether `size` applies and how it maps.

**Density provider:** a scope sets `data-erx-density` on the rendered element. The theme provider MAY expose `density` with default `standard`; a nested scope can override it. Provider must be SSR-safe, avoid DOM reads at module import, avoid layout measurements in render, and avoid remounting stateful children on density changes. Client persistence is the consumer's responsibility unless specified separately by UL-18.

**Overlays:** a Dialog/Popover/Tooltip renders in the browser's top layer in place, so it stays inside the density scope in the DOM and inherits its active density, theme and local CSS overrides. Tests MUST cover nested density and theme while overlays are open. A portal fallback, if the UL-05 native-first ADR ever names an overlay that can't use the top layer, would render outside the density scope: it MUST then apply density explicitly by propagating the nearest resolved theme/density/custom CSS values to the portal root. Merely copying `data-erx-density` can be insufficient when consumers customized individual spacing variables on ancestors.

**Library distribution:** token CSS exports are proposed as `eroxo-ui/colors.css`, `eroxo-ui/typography.css` and `eroxo-ui/spacing.css` after a build/consumer-fixture decision. These are **future paths, not currently published starter exports**. Ensure the package `sideEffects` field retains imported CSS; the starter currently has `"sideEffects": false`, which needs deliberate review when CSS is shipped.

## 11. Verification strategy and test matrix

### 11.1 Deterministic source / unit checks

1. `tokens/spacing.json` defines the 4px grid and approved 2px micro steps; generated CSS contains all declared tokens with correct `rem` conversion.
1. `scripts/generate-spacing.mjs --check` fails if CSS differs from the JSON single source of truth.
1. `scripts/validate-spacing.mjs` checks exact `[32,40,48]` size minima, density mapping, core invariants, and absence of page/global typography changes.
1. Vitest tests assert public size vocabulary, token presence and no unintended density media queries.
1. Existing typography tests still pass: 14/20 UI and 16/24 body roles do not change across densities. Existing color token and contrast suites still pass in both schemes.

### 11.2 Browser and component integration tests (Chromium, Firefox, WebKit)

| Scenario | Required evidence |
|---|---|
| Density basics | Default Button minimum 32 / 40 / 48px within compact / standard / comfortable; padding + gap match tokens |
| Explicit size precedence | A `size="lg"` Button inside compact remains 48px; explicit `size="sm"` inside comfortable remains 32px |
| Nested scope | Compact inside comfortable overrides default; siblings and ancestor state remain unaffected |
| Scope same element | Setting `data-erx-density` on a component itself changes its default mapping; no remount |
| User primitive override | Re-declaring semantic alias on nested scope works; changing just the ancestor primitive does not silently mislead docs |
| Text enlargement | 200% text and 20/24px root font; no essential clipping, overlap or hidden focus |
| Narrow viewport | 320/375px width; content may wrap, no unexplained horizontal page scroll |
| RTL / CJK | Hebrew, Arabic, Chinese, Japanese; correct logical spacing and hit targets |
| Touch targets | All controls and nested icon-only actions satisfy WCAG 2.5.8 or document an applicable exception |
| Overlay | Dialog/Tooltip in the top layer inherits density, custom overrides, and theme while nested and open |
| SSR | Server markup/hydration preserve density semantics and geometry; no render-time DOM reads |
| Responsive policy | Viewport switch does not auto-change `sm/md/lg` default; container reflow may change widths |

Use `getComputedStyle`, element rectangles, keyboard and pointer interaction tests; **do not** infer accessibility solely from one screenshot. The browser matrix should include actual application-owned Geist and system fallback scenarios, because different metrics can affect minimum height and wrapping.

### 11.3 Manual conformance checks

- Inspect zoom and text spacing at 100/200/400%, forced colors, OS text settings where supported, pointer and keyboard focus.
- Verify long localization samples and input composition (especially Chinese IME) in real form controls.
- Verify overlays on mobile viewports with on-screen keyboards, nested scroll containers and safe-area insets.
- Capture light/dark × density × size visual baselines and keep records of deliberate exceptions.

## 12. Implementation sequencing and file contract

| Step | Repository path / deliverable | Acceptance gate |
|---|---|---|
| 1 | `docs/design-system/eroxo-iris-spacing-sizing-spec.md` | Approved geometry contract and owner sign-off |
| 2 | `tokens/spacing.json` (provisional path: UL-13 picks one tokens folder and one generator) | Reviewed token source; CSS generator uses this file |
| 3 | `src/styles/spacing.css` | CSS under `erx.tokens`; works with colors and typography |
| 4 | `scripts/generate-spacing.mjs` + source tests | Deterministic output; stale file fails CI |
| 5 | One Button and one TextField fixture | CSS size props and density default verified |
| 6 | `DensityScope` or future ThemeProvider integration | Nested scopes; CSR/SSR behavior verified |
| 7 | Overlay and table fixtures | Top-layer density inheritance and dense content verified |
| 8 | Browser test matrix + docs | 3 browsers, zoom, bidi, touch, localization documented |
| 9 | Package build + consumer smoke test | `eroxo-ui/spacing.css` exports and bundler CSS retention verified |

**Compatibility with roadmap:** This design contract contributes to **UL-12** token taxonomy and **UL-13** theme styles; its API and CSS-selector conventions require the UL-04 decisions (done; see the [UL-04 report](../ul-04-spike.md)) and the UL-05/06 architecture decisions. The theme provider/overrides belong to **UL-18**, component customization to **UL-19**, and Button integration to **UL-20**. The approved 1.0 catalog does not change.

## 13. API and change-control rules

- Public CSS variables, named sizes, `data-erx-density` and `data-erx-size` are versioned API once published. Document additions and deprecations; do not silently change geometry by patch release.
- `sm/md/lg` is the standard size contract; introduce any additional named size only with consumer evidence and a versioned API review.
- Do not introduce a new density preset without updating the token data, generated CSS, type unions, docs and full test matrix.
- Applications can override individual `--erx-*` variables or create a nested theme/density scope; maintainers must not expose internal private class names as stable customization hooks.
- Shape, animation and icons remain separate systems and do not retroactively redefine spacing primitives; later component refinements must conform to this baseline or record an explicit revision.
- Tokens in `rem` respond to browser root font-size; no JavaScript density observer, viewport-based resizing or runtime CSS-in-JS is necessary.

## 14. Definition of Done

- [ ] This normative specification, JSON token source and generated CSS are approved and merged.
- [ ] CSS generation is deterministic and verified on CI with `--check`.
- [ ] All `sm/md/lg` explicit component rules and compact/standard/comfortable defaults behave as specified.
- [ ] A nested scope and a same-element density override work without remounting children.
- [ ] No coupling to light/dark color mappings, typography font sizes, or a hardcoded application page layout.
- [ ] Button, Field, IconButton, menu, card, dialog and table samples show readable geometry at all densities.
- [ ] RTL and CJK examples work; browser tests pass in Chromium, Firefox and WebKit.
- [ ] 320px reflow, 200% text resize, text-spacing overrides, focus visibility and target-size checks are complete.
- [ ] Top-layer overlays preserve theme/density/custom variable inheritance in their actual rendered DOM.
- [ ] CSS published exports and tree-shaking/side-effect behavior pass the consumer fixture.
- [ ] Documentation contains APIs, token roles, override examples, accessibility assumptions and limitations.

## 15. References and related specifications

- [WCAG 2.2 (W3C Recommendation)](https://www.w3.org/TR/WCAG22/), especially 1.4.4, 1.4.10, 1.4.12, 2.4.11 and 2.5.8.
- [Understanding Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [CSS Logical Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
- `ERX-DS-COLOR-001` — Eroxo Iris colors, status palette and light/dark mappings.
- `ERX-DS-TYPE-001` — Eroxo Iris typography, system font defaults and semantic text roles.
- Eroxo implementation roadmap: `docs/ui-library-roadmap.md` (UL-04, UL-05, UL-06, UL-12, UL-13, UL-18, UL-19, UL-20).

*End of normative specification. All nominal px numbers are reference equivalents; the implementation is rem-based.*

## Open items after 0.2.0

- **Density-role token names (D5):** the Section 5 table names its 17 density roles in prose. Only `--erx-card-padding`, `--erx-form-gap`, `--erx-field-label-gap`, `--erx-table-cell-padding-inline`, `--erx-page-gutter` and the `--erx-control-default-*` family are spelled out, and "Form vertical gap" becomes `--erx-form-gap`, so the remaining names can't be derived. The naming grammar that shows each tier (including whether `--erx-<component>-<property>` names such as `--erx-card-padding` are density tokens or override hooks) and a cap on the component tier are settled in UL-06 and UL-12.
- **Portal fallback (C7):** whether any overlay can't use the top layer and needs a portal, which would then have to apply density explicitly. Settled by the UL-05 native-first ADR.
- **Tokens folder and generator (record gaps):** `tokens/spacing.json` and `scripts/generate-spacing.mjs` are provisional. UL-13 picks one tokens folder and one generator.
- **Missing companion files (record gaps):** the token JSON, the reference `sm/md/lg` button stylesheet and SolidJS usage sketch, and the `DensityScope` reference example are not in the repository. The owner adds them, or UL-13 generates the token JSON from the tables in this specification.
- **CSS export names** (found during the 0.2.0 revision; the record doesn't cover it): this spec proposes per-family token stylesheets such as `eroxo-ui/spacing.css`, while UL-04 recommended `tokens.css`, a full stylesheet and per-component CSS. Settled by UL-05's CSS-delivery ADR.
