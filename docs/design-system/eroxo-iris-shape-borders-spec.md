# Eroxo Iris — Shape & Borders System Specification

**Specification ID:** ERX-DS-SHAPE-001  
**Version:** 0.2.0  
**Date:** 23 November 2026  
**Status:** Design contract finalized; implementation, browser testing, and external package verification pending  
**Maintainer:** Eroxo UI  
**Applies to:** SolidJS 2 and TypeScript, ordinary CSS, light/dark/custom themes, nested scopes, SSR, international layouts.  
**Dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001.

> **0.2.0 (23 November 2026):** revised to match the approved [Iris reconciliation record](reconciliation.md): C2, C7, C9, D1, D3, D6 and D8, and the record's gaps on paths and missing companion files. Choices it leaves open are listed under "Open items after 0.2.0".

> **Normative convention.** MUST means a release-blocking requirement; SHOULD means a strong design preference; MAY means an optional extension. The planned token JSON (not yet in the repository; UL-13 may generate it from this specification's tables) is the machine-readable source of truth for shape tokens. This specification approves the design contract, **not** the completion of browser/accessibility validation.

## 1. Executive decisions and design principles

1. **Balanced geometry.** The radius scale is 0, 6, 10, 14, 20 CSS pixels at the nominal 16px root, plus a full/pill value. Soft but controlled shapes align with the Eroxo Iris visual identity.
2. **Subtle border-first architecture.** Structural elements normally use a 1px decorative border. Essential interactive boundaries use the **existing high-contrast Iris border roles**, not a new neutral palette.
3. **Pill convention.** Badges and chips default to a pill; buttons default to a 10px control radius and optionally expose `shape="pill"`. Do not add a universal public `radius` prop.
4. **Density independence.** `data-erx-density="compact|standard|comfortable"` selects sizing defaults per ERX-DS-SPACE-001, but **never changes radii or border widths**. Explicit `size="sm|md|lg"` changes geometry, not corner treatment.
5. **Theme independence.** The same radius/width tokens work in light and dark modes. Semantic border colors come from ERX-DS-COLOR-001 (`--erx-color-*`).
6. **Separate focus indicator.** Keyboard focus is a visible outline, not a 2px border toggle. Focus must not resize or reposition an element.
7. **Limited variants and open customization.** Component-specific CSS-variable overrides are supported. Only meaningful public shape variants are exposed; a pill button is the initial exception.
8. **No ornamental corner APIs in v1.** No superellipse, squircle, asymmetric decorative notches, global shape-preset provider, runtime measurements, or automatic viewport-driven rounding.
9. **Compatible infrastructure.** Tokens use `--erx-`, the existing `erx.tokens` cascade layer, static CSS, and no mandatory runtime dependencies beyond the SolidJS peer dependencies already established.

## 2. Scope, ownership, and boundaries

**This specification owns:** primitive corner radii, semantic component corner roles, border-width tokens, border-color usage rules, geometry-sensitive state behavior, accessible focus outline geometry, forced-colors requirements, shape customization and tests.

**This specification does not own:** color hex values (ERX-DS-COLOR-001), typography (ERX-DS-TYPE-001), spacing, control min sizes or density mappings (ERX-DS-SPACE-001), shadows/elevation/backdrop opacity (future elevation spec), motion timings, icon visual language or interaction behavior. It does not make claims about automated accessibility or cross-browser compliance until those test suites pass.

Components MUST use `box-sizing: border-box` for predictable dimensions. Library CSS MUST NOT install an application-wide `* { box-sizing: border-box }` reset without explicit consumer agreement; apply it to component roots and their necessary parts. Use logical properties where edges convey inline/block directionality.

## 3. Primitive corner radius system

| Token | Nominal px | CSS | Examples |
| --- | ---: | --- | --- |
| `--erx-radius-none` | 0 | `0` | Grouped middle items, square data surfaces |
| `--erx-radius-sm` | 6 | `0.375rem` | Checkbox, small affordance |
| `--erx-radius-md` | 10 | `0.625rem` | Button, field, tooltip |
| `--erx-radius-lg` | 14 | `0.875rem` | Card, popover, toast |
| `--erx-radius-xl` | 20 | `1.25rem` | Dialog / alert dialog |
| `--erx-radius-full` | Pill | `9999px` | Badge, chip, round thumb, avatar |

**Unit rule:** scale steps use `rem`, so root-font scaling adapts component corners. `9999px` is intentionally a geometry-saturating pill value; the browser clamps radii to the element box. A circle also needs equal visual inline and block dimensions. No global responsive radius breakpoints are defined.

**Governance:** never introduce an unapproved intermediate radius (8, 12, 16, 18px) just to fix a local visual issue. Use component semantic overrides for legitimate exceptions; propose a new primitive only with a cross-component design rationale and design review.

## 4. Border widths and state geometry

| Token | CSS | Primary use |
| --- | --- | --- |
| `--erx-border-width-none` | `0` | Fill-only buttons, flat elements |
| `--erx-border-width-default` | `1px` | Cards, inputs, menus, separators |
| `--erx-border-width-emphasis` | `2px` | Static emphasis variants or geometry-reserved selections |
| `--erx-focus-outline-width` | `2px` | Focus outline independent of borders |
| `--erx-focus-outline-offset` | `2px` | Separation between focus indicator and control |

Do not animate or change `border-width` on hover, pressed, focused, invalid, or selected states: it can alter content geometry and cause visual jitter. Change `border-color`, background, or a size-reserved ornament. An emphasized 2px border MAY be used if the component reserves its border geometry across states or accepts the static variant at render time. Focus MUST use `outline` (or an independently validated equivalent), never border-width as the only indicator.

CSS pixel borders remain `px` rather than `rem` to preserve crisp edge rendering at ordinary zoom levels. Do not claim a subpixel/hairline border is accessibility-safe. Native OS pixel snapping and zoom may vary; validate actual browser rendering.

## 5. Semantic shape roles — public contract

The following tokens are stable theme-level public roles. Their default mapping is part of the API, and consumer scopes may override them. Component-local variables are optional override hooks; they SHOULD remain undefined by default and be consumed via `var(--erx-component-radius, var(--erx-radius-role))` at the component declaration site.

| Token | Default primitive | Components |
| --- | --- | --- |
| `--erx-radius-control` | `md` (10px) | Button, IconButton, Toggle, standard control |
| `--erx-radius-field` | `md` (10px) | TextField, Textarea, Select, Combobox |
| `--erx-radius-checkbox` | `sm` (6px) | Checkbox indicator |
| `--erx-radius-switch` | `full` | Switch track/thumb |
| `--erx-radius-radio` | `full` | Radio indicator |
| `--erx-radius-badge` | `full` | Badge/Tag |
| `--erx-radius-chip` | `full` | Interactive Chip |
| `--erx-radius-card` | `lg` (14px) | Card, EmptyState container |
| `--erx-radius-alert` | `lg` (14px) | Alert, feedback panel |
| `--erx-radius-toast` | `lg` (14px) | Toast |
| `--erx-radius-popover` | `lg` (14px) | Popover, dropdown panel |
| `--erx-radius-menu` | `lg` (14px) | Menu surface |
| `--erx-radius-dialog` | `xl` (20px) | Dialog and AlertDialog |
| `--erx-radius-tooltip` | `md` (10px) | Tooltip |
| `--erx-radius-dropzone` | `lg` (14px) | FileDropzone |
| `--erx-radius-tabs` | `md` (10px) | Contained tab trigger and segmented controls |
| `--erx-radius-table` | `lg` (14px) | Optional table outer shell |
| `--erx-radius-avatar` | `full` | Round avatar |
| `--erx-radius-slider-thumb` | `full` | Slider thumb |
| `--erx-radius-skeleton` | `sm` (6px) | Neutral placeholder when no represented shape is known |

A skeleton representing a circular avatar MUST be circular; one representing a pill button SHOULD use that pill radius. The generic `--erx-radius-skeleton` is only a fallback. Tabs can be underline-style without a rounded background; the radius token applies only to contained-style tabs. Semantic Table inner cells do not receive individual corner radii unless the outer shell requires them.

## 6. Component border rules

| Component/variant | Visible border | Color role | Shape |
| --- | --- | --- | --- |
| Button, solid | 1px transparent: keeps solid and outline buttons the same size and shows the edge in forced-colors mode | `transparent` | Control (10px) |
| Button, outline | 1px | `border-interactive` | Control (10px) |
| Button, ghost | None | n/a | Control (10px) |
| Button, `shape="pill"` | Variant-dependent | As above | `radius-full` |
| TextField / Textarea / Select / Combobox | 1px | `input-border`; `input-border-hover`, `input-border-focus` and `input-border-error` by state | Field (10px) |
| Checkbox / Radio (unselected) | 1px | `border-interactive` | Small / full |
| Switch | 1px or none | `border-interactive` where visible | Full |
| Card / standard Alert / Toast | 1px | `border-subtle` | 14px |
| Popover / Dropdown / Menu | 1px | `border-default` or `border-subtle` where adequately distinguished | 14px |
| Dialog / AlertDialog | Optional 1px | `border-subtle` | 20px |
| Tooltip | 1px solid | `--erx-color-tooltip-border` | 10px |
| Badge / Chip | 0 or 1px by variant | Status / interactive role | Full |
| Table outer shell / Separator | 1px | `border-subtle` | 14px shell / no radius for separator |
| FileDropzone | 1px default, strong boundary when interactive | `border-interactive` | 14px |

A 1px **decorative** border may deliberately have low contrast if the surface is otherwise distinguishable. The essential visual boundary of a field/control or important selected state MUST be visually distinguishable and meet applicable WCAG 1.4.11 non-text contrast requirements, typically 3:1 against adjacent colors. Do not use `border-subtle` for the only essential field boundary.

## 7. Reuse the existing Iris border colors, exactly

No new color hex values are introduced by this specification. Refer to semantic colors from ERX-DS-COLOR-001.

| Existing semantic token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--erx-color-border-subtle` | `#E1E4EC` | `#30384B` | Decorative structural outlines |
| `--erx-color-border-default` | `#C1C7D4` | `#434B5C` | Regular dividers, structural outlines |
| `--erx-color-border-strong` | `#8792A3` | `#69758E` | Emphasized outline |
| `--erx-color-border-interactive` | `#8792A3` | `#69758E` | Control boundary; fields use the `input-border` roles |
| `--erx-color-input-border` | `#8792A3` | `#69758E` | Field boundary |
| `--erx-color-input-border-hover` | `#5B6374` | `#A9B2C3` | Field boundary on hover |
| `--erx-color-input-border-focus` | `#4338B5` | `#B8B2FF` | Field boundary while focused, alongside the focus outline |
| `--erx-color-input-border-error` | `#C12F49` | `#FF8193` | Invalid field boundary when appropriate |
| `--erx-color-focus-ring` | `#4338B5` | `#B8B2FF` | Keyboard focus outline |
| `--erx-color-focus-offset` | `#FFFFFF` | `#141925` | Optional two-color focus treatment |
| `--erx-color-error-border` | `#F2B9C4` | `#914052` | Soft error panel border, not sole control boundary |

Reference contrast computations (unrounded WCAG calculation, 16px nominal root) for important opaque pairs: light interactive border on white = about **3.15:1**, light interactive border on light page `#FAFAFC` = about **3.02:1**; dark interactive border on `#141925` = about **3.79:1**. Light subtle border on white = about **1.27:1** and is *not* an essential control outline. These are representative checks, not an exhaustive theme audit. All custom theme pairings MUST be retested.

## 8. States and interaction treatments

| State | Border behavior | Additional requirements |
| --- | --- | --- |
| Default | Use component's declared width/color | Shape unchanged |
| Hover | Optionally change border color, never width | Hover not sole state cue |
| Pressed | Optional border-color/surface change | Keep minimum targets and no layout jump |
| Focus-visible | 2px outline, 2px offset | Use `--erx-color-focus-ring`; don't remove without replacement |
| Selected | Color/shape marker and, where needed, stronger border | Not solely color; preserve geometry |
| Invalid | Essential control border may use `--erx-color-input-border-error` | Also display explanatory text/indicator, `aria-invalid` as appropriate |
| Disabled | Existing boundary may become muted | Disabled semantics required; `aria-disabled` focusable cases keep focus indication |
| Loading | Geometry and border preserved | Progress indicator doesn't displace button label unexpectedly |
| Forced colors | System colors, visible borders/outline | Never rely solely on shadows, background fill or decorative hues |

**Focus behavior:** `outline: var(--erx-focus-outline-width) solid var(--erx-color-focus-ring); outline-offset: var(--erx-focus-outline-offset);`. This is the baseline, not a blanket guarantee of conformance for every surface. Validate placement over the light/dark background, on filled and outlined buttons, inside dialogs and nested popovers. If offset outlines are clipped by an ancestor, change the component structure or provide a separately verified inward/fallback treatment. Do not globally set `outline: none` or depend on `box-shadow` alone.

**Invalid state:** an invalid text field should expose an error message and `aria-describedby`/`aria-errormessage` where applicable. A red border by itself is insufficient. Error + focus must show both statuses without masking the focus outline.

## 9. Forced-colors and high-contrast contract

- In `@media (forced-colors: active)`, use system colors such as `ButtonText`, `CanvasText`, `Highlight`, and `GrayText` as appropriate. Test behavior instead of assuming an exact operating-system palette.
- Visible input borders and outlined buttons MUST remain distinguishable; `ButtonText` is a reasonable baseline for their forced-colors border.
- Use `outline: 2px solid Highlight` with a visible fallback where appropriate; do not suppress UA focus treatment by default.
- Do not depend on shadows as the only outline: forced-colors mode can suppress `box-shadow`.
- Disabled styling can use `GrayText`, but a focusable `aria-disabled` control still needs a keyboard-visible focus treatment.
- Do not apply `forced-color-adjust: none` broadly; reserve it for a tested necessity.

WCAG 2.2 AA specifically includes Focus Visible (2.4.7), Focus Not Obscured (Minimum) (2.4.11), and Non-text Contrast (1.4.11). The 2px ring and 2px offset are our design baseline; visual/browser tests are required to establish actual compliance. The stronger Focus Appearance numerical criterion (2.4.13) is **AAA**, not an AA release claim.

## 10. Nested scopes, CSS resolution, and customization

The shape layer SHOULD declare global semantic radius roles under `:root` only. It MUST NOT reset them automatically under every light/dark or density scope; otherwise nested consumer overrides could be lost. Consumers may override semantic roles on any ancestor:

```css
/* Application-owned theme scope */
.brand-panel {
  --erx-radius-control: 0.5rem;
  --erx-radius-card: 1rem;
}

/* Local component override without changing the entire theme */
.feature-button { --erx-button-radius: 0.375rem; }
```

`.brand-panel` is an app-owned selector, so it may override tokens directly, as these lines do. A full custom theme is an Eroxo scope such as `[data-erx-theme="acme"]` (UL-18 defines `data-erx-theme` values beyond `light` and `dark`). The token generator redeclares, on each Eroxo scope, only the composite aliases whose inputs that scope changes, such as color-based shadows on theme scopes. Radius roles stay on `:root`, as this section requires, so an override set on an ancestor survives nested theme and density scopes.

At the component declaration site use `border-radius: var(--erx-button-radius, var(--erx-radius-control));` (similar component-specific hooks for other parts). **Do not predeclare `--erx-button-radius` as a root alias**: custom property substitution at a parent may be computed before the child scope sets an override. The fallback expression on the component is intentional.

Likewise, `--erx-radius-control: var(--erx-radius-md)` declared at `:root` does **not** automatically recompute if a nested scope changes *only* `--erx-radius-md`; the semantic alias is inherited as a computed value. To change all controls in a scope, override `--erx-radius-control` in that scope (or rebind it to the desired primitive there). This is a CSS inheritance rule, not a runtime bug. The specification guarantees **semantic** overrides, not automatic nested re-evaluation of every primitive alias.

**Cascade contract:** Eroxo distributes tokens in `@layer erx.tokens`; component rules belong in `@layer erx.components`. These are the only two layers; a third needs a UL-05 ADR. Every library stylesheet starts with the order statement `@layer erx.tokens, erx.components;`. Ordinary unlayered application CSS has higher normal-priority cascade than layered library declarations. Document this precedence, avoid unnecessary `!important`, and test consumers' overrides.

**Portal caveat:** overlays render in the browser's top layer, where UL-04 found portals unnecessary, so they keep their DOM ancestors and inherit scoped border/radius values in place; a portal exists only if the UL-05 native-first ADR names an overlay that can't use the top layer. Portal content inherits from its **actual DOM ancestors**. A portal placed outside a nested theme cannot inherit scoped border/radius values automatically. Overlay infrastructure for such an overlay MUST preserve a scope DOM ancestor or deliberately reproduce the theme scope on the portal root; verify in the overlay integration suite. Native top-layer elements such as `<dialog>` can remain DOM descendants, but DOM placement still controls inheritance.

## 11. Shape props and SolidJS component API

The initial public API exposes only targeted shape variants. `Button` MAY accept `shape?: 'default' | 'pill'` with default `'default'`; the `data-erx-shape="pill"` state/variant attribute is publicly documented. Other components SHOULD not receive a generic `radius` prop. Component geometry is controlled via documented CSS variables and styling hooks.

```tsx
import { omit } from 'solid-js'
import type { JSX } from '@solidjs/web'

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
  shape?: 'default' | 'pill'
}

export function Button(props: ButtonProps) {
  const others = omit(
    props, 'size', 'variant', 'shape', 'class', 'children', 'type'
  )
  return (
    <button
      {...others}
      type={props.type ?? 'button'}
      class={['erx-button', props.class].filter(Boolean).join(' ')}
      data-erx-size={props.size}
      data-erx-variant={props.variant ?? 'solid'}
      data-erx-shape={props.shape === 'pill' ? 'pill' : undefined}
    >
      {props.children}
    </button>
  )
}
```

An omitted `size` attribute is required to preserve ERX-DS-SPACE-001's density default behavior. `shape` is independent of both density and size. Native attributes, focus behavior, SSR, and accessibility semantics remain the responsibility of the relevant component contracts.

## 12. Representative component CSS

This example consumes the three existing foundation systems. Production components SHOULD follow the same token lookup pattern and add their real behavior and variant styling.

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-button {
    box-sizing: border-box;
    min-block-size: var(--erx-density-control-default-min-block-size);
    padding-inline: var(--erx-density-control-default-padding-inline);
    border: 0;
    border-radius: var(--erx-button-radius, var(--erx-radius-control));
    font-family: var(--erx-type-ui-strong-family, var(--erx-font-sans));
    font-size: var(--erx-type-ui-strong-size);
  }

  .erx-button[data-erx-size="lg"] {
    min-block-size: var(--erx-control-height-lg);
    padding-inline: var(--erx-control-padding-inline-lg);
  }

  .erx-button[data-erx-shape="pill"] {
    border-radius: var(--erx-radius-full);
  }

  .erx-button[data-erx-variant="solid"] {
    border: var(--erx-border-width-default) solid transparent;
  }

  .erx-button[data-erx-variant="outline"] {
    border: var(--erx-border-width-default) solid
      var(--erx-color-border-interactive);
  }

  .erx-button:focus-visible {
    outline: var(--erx-focus-outline-width) solid
      var(--erx-color-focus-ring);
    outline-offset: var(--erx-focus-outline-offset);
  }
}
```

Use `border-radius` directly for simple rectangular components. Use logical per-corner properties (`border-start-start-radius`, `border-end-end-radius`, etc.) when composing input groups or directional components. `border-inline-start` / `border-inline-end` apply to directional separators. Avoid physical `left/right` assumptions in RTL compositions.

## 13. Composition rules and geometry edge cases

- **Grouped controls:** keep rounded *outer* corners while interior joints are square (`radius-none`). Logical start/end corners are determined by writing direction and flex orientation. Do not shrink hit areas by overlapping borders.
- **Table and menu shell:** apply the shell radius on the container. Rows or items may need local background clipping to avoid a colored rectangular hover highlight protruding past the shell. Test clipping without clipping focus rings.
- **Nested radii:** a child surface inside a padded parent should generally use a smaller or equal radius to avoid visually inconsistent corners; do not compute radii dynamically from padding.
- **Popover with arrow:** arrow shape is a separate positioning detail; no new radius primitive is required. The surface keeps the 14px role.
- **Rounded avatars:** maintain square visual content boxes for circles; `radius-full` alone does not turn a rectangular element into a circle.
- **Skeletons:** match the intended content role, including pill/circle, rather than blindly applying 6px.
- **Dropzones and drag states:** keep border width stable during drag-over; border style or color may change while remaining perceivable in forced colors.
- **Overflow:** `overflow: hidden` on a card can clip descendant control outlines. Prefer an inner clipping wrapper for decorative media, or an independently verified inner-focus design.
- **RTL:** geometry is symmetrical by default, but multi-item joined groups MUST use logical corner properties and test both directions.
- **Touch/zoom:** existing minimum target dimensions of 32/40/48px from the spacing spec are unchanged. Border and corner treatments MUST NOT reduce their effective interactive target.

## 14. Tests: machine, browser and accessibility

### 14.1 Deterministic token and lint checks

1. Running `node scripts/generate-shape.mjs` twice MUST produce identical CSS.
2. Running the generator in `--check` mode MUST confirm checked-in CSS matches token JSON.
3. Schema validation MUST reject negative radii, malformed values, unknown semantic primitive refs, non-0/1/2px width tokens, and public token naming errors.
4. A token-name collision check MUST compare this module against approved color, typography and spacing token sources.
5. Representative component CSS MUST avoid raw color hex values and undeclared radius literals (except vetted internal special cases).
6. The library MUST expose no new font or runtime dependency as a result of the shape layer.

### 14.2 Real-browser matrix

| Test scenario | Required observation |
| --- | --- |
| Light, dark, custom theme | Same geometry; correct themed border/focus colors |
| Compact, standard, comfortable | Radius unchanged; control default min height 32/40/48px |
| Explicit `size="lg"` inside compact | 48px minimum; radius unchanged |
| Nested semantic radius override | Only descendant components in scope change |
| Button `shape="pill"` | Rounded ends in all densities and themes |
| Focus on solid/outline/invalid controls | Distinct visible ring; no layout shift or clipping |
| Hover, pressed, selected, invalid | Border width stable; states remain perceivable |
| RTL grouped controls | Logical outer corners preserved |
| Forced colors on Windows | Borders and focus outline remain visible without shadows |
| 200% text scaling and 320px reflow | Content/controls remain usable and don't clip |
| Dialog / popover / portal | Focus ring and nested scope geometry survive layering |
| Chromium, Firefox, WebKit | Visual and computed-style snapshots consistent within browser tolerances |

### 14.3 Accessibility acceptance

- Test WCAG 2.2 SC 1.4.11 (Non-text Contrast), 2.4.7 (Focus Visible), 2.4.11 (Focus Not Obscured — Minimum), and relevant 2.5.8 target-size requirements for live components.
- Focus visibility MUST be tested on light/dark surfaces and colored primary buttons, including overlays and disabled-but-focusable controls.
- Color alone MUST NOT convey invalid/selected state. Validate symbols/text/semantics where needed.
- Verify keyboard use, reduced motion where borders transition, zoom, international labels, and high-contrast OS settings.
- Automated checks alone are insufficient; run manual visual tests and document browser-specific behavior.

### 14.4 Release gate

A shape-bearing component is ready when token tests pass, reference fixture has been checked in all three browser engines, light/dark/custom and nested scope behavior works, focus visibility is validated, and the consumer package is exercised under the repository's standard SSR and install-from-registry gates. Document exceptions instead of silently claiming full conformance.

## 15. Repository layout and implementation sequence

```text
docs/design-system/eroxo-iris-shape-borders-spec.md
tokens/shape.json                          # provisional: UL-13 picks the folder
src/styles/shape.css                       # generated tokens
src/styles/shape-components.reference.css  # illustrative component layer
scripts/generate-shape.mjs
scripts/validate-shape.mjs
test/shape.tokens.test.ts
test/fixtures/shape-borders.html
examples/ReferenceButton.tsx
examples/shape-customization.css
integration/guide.md
```

**Integration order:** (1) merge specification and token JSON; (2) regenerate CSS and validate source parity; (3) merge component-layer conventions into UL-06 ADR; (4) use shape tokens in production components (the UL-04 prototype is done; see its [report](../ul-04-spike.md)); (5) add browser/accessibility and consumer fixture checks; (6) publish package CSS only after design and technical approval. Shape tokens MUST NOT be restyled separately for light/dark unless the consumer supplies an intentional theme variation.

**Package export note:** make stylesheet delivery intentional and side-effect safe. Existing package metadata currently marks `sideEffects: false`; review and test how bundlers include CSS before shipping component styles. Importing `shape.css` from a JS module can be tree-shaken if the package's side-effect contract is incorrect. Prefer the documented CSS import strategy selected in UL-04 ([report](../ul-04-spike.md)) and UL-05 rather than silently changing package behavior here.

## 16. Change management and unresolved non-shape dependencies

This document freezes the approved v0.2.0 geometry, not future elevation, motion or complete component API decisions. Proposed changes require a written migration note when altering a public semantic token, CSS attribute or documented shape variant. Breaking changes in released CSS names follow SemVer. Record a component example and visual-regression evidence for every new radius/shape variant.

**Remaining work in other specifications:** elevation/shadows; motion timing for border-color transitions; icon treatment; full component anatomy and behavior; visual QA on real consumer applications. None of these is a blocker for adopting the current shape token taxonomy.

## 17. Reference standards and related specifications

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Understanding Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- Understanding Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible
- Understanding Focus Not Obscured: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- CSS `forced-colors`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
- CSS `border-radius`: https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
- Related Eroxo specs: ERX-DS-COLOR-001; ERX-DS-TYPE-001; ERX-DS-SPACE-001.

## Open items after 0.2.0

- **Token naming grammar and tiers** (D5): UL-12 reviews whether primitives (`sm`, `md`) and roles (`field`, `tooltip`) share the `--erx-radius-*` namespace (§3, §5). The [UL-06 component rulebook](eroxo-iris-component-anatomy-api-spec.md) sets the component hook budget.
- [UL-12](ul-12-token-taxonomy.md) resolves D8 with a 1 px tooltip border.
- **Portal fallback** (C7): whether any overlay can't use the top layer and so needs a portal, to which §10's portal caveat then applies. Settled by the UL-05 native-first ADR.
- **Tokens folder and generator** (record gap on paths): `tokens/shape.json` and `scripts/generate-shape.mjs` (§14.1, §15) are provisional until one tokens folder and one generator are picked. Settled in UL-13.
- **Fallback when a custom theme omits a token** (record gap): what a custom theme scope falls back to when it leaves out a shape token. Settled in UL-13.
- **Missing companion files** (record gap): the shape token JSON isn't in the repository. Settled by the owner, who adds it, or in UL-13, which may generate it from §3–§5.

*End of normative specification — ERX-DS-SHAPE-001, v0.2.0.*
