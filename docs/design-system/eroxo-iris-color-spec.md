# Eroxo Iris — Color System Implementation Specification

**Specification ID:** ERX-DS-COLOR-001  
**Version:** 0.2.0  
**Date:** 23 November 2026  
**Status:** Palette and rules locked as implementation inputs; WCAG conformance of the final library pending rendered-state checks  
**Maintainer:** Eroxo UI  
**Platforms:** SolidJS 2 / TypeScript

> **0.2.0 (23 November 2026):** revised to match the approved [Iris reconciliation record](reconciliation.md): C1, C2, C3, C4, C7, D1, D3, D6, D12, and its gaps on this header, paths and missing companion files. Choices it leaves open are listed under "Open items after 0.2.0".

**Scope:** This document freezes the *color system only*: primitives, semantic roles, state treatments, feedback, specialized UI roles, data-visualization colors, accessibility contracts, CSS distribution, implementation stages, testing and release criteria. It does **not** freeze typography, spacing, radii, elevation geometry, or interaction behavior outside color. The values supersede the exploratory color suggestions from the design discussion.

## 1. Executive decision record

Eroxo Iris combines an iris blue-violet accent (`#5145CD` on light, `#A49CFF` on dark) with cool slate neutrals. The brand is restrained and premium: most UI area is neutral; Iris denotes action, selection, focus and brand identity. Feedback colors communicate status independently of the accent. Dark mode uses independently curated mappings, not algorithmic inversion.

**Normative requirements:**

1. Components consume semantic tokens (--erx-color-\*), not raw hexes or primitive shades. Raw palettes are inputs to theme definitions.
1. Three tiers: primitives → semantic roles → exceptional component-local aliases. Do not create a dedicated variable for every component/property without need.
1. Default light, default dark, OS preference and nested custom theme scopes work with CSS custom properties, SSR and no runtime CSS-in-JS.
1. Status messaging is never color-only: always add text, icons, borders, accessible names and/or other cues as appropriate.
1. Text-bearing foreground/background pairs in the contract meet 4.5:1, essential graphics and controls meet 3:1, with WCAG 2.2 AA as the target; exact rendered states still require browser checks.
1. Stable public contract: --erx-color-\*, --erx-iris-\* and other scales, plus data-erx-theme. Document all breaking changes.

**Repository alignment:** UL-04 validated CSS strategy and consumption (done; see the [UL-04 report](../ul-04-spike.md)); UL-06 freezes naming; UL-12 owns this design/token spec; UL-13 ships default light/dark CSS and contrast verification; UL-18/19 validate scoped themes and customization. This specification deliberately does not bypass those milestone dependencies.

## 2. Naming, ownership and token taxonomy

**Public primitive names:** `--erx-iris-50` through `--erx-iris-950`, and analogous `neutral`, `success`, `error`, `warning`, `info` families. `neutral` also has custom neutral steps 0, 25, 850, 925 and 1000.

**Public semantic names:** `--erx-color-{role}` — e.g. `--erx-color-surface`, `--erx-color-primary-hover`, `--erx-color-input-border`, `--erx-color-chart-category-1`.

**Component-local aliases:** optional `--erx-button-bg`, `--erx-button-fg`, etc., read with a fallback at the declaration site, e.g. `background: var(--erx-button-bg, var(--erx-color-primary));`. A component never declares a public `--erx-<component>-*` variable on its own element, which would block values set on an ancestor; its internal values use private `--_erx-*` names such as `--_erx-button-bg`. Expose only when needed for a documented customization use case.

**Theming selector:** `data-erx-theme="light"` or `data-erx-theme="dark"`; further values (custom theme names, `system`) are defined by UL-18, and a full custom theme is an Eroxo scope such as `[data-erx-theme="acme"]`. The root defaults to OS preference when it has no explicit selection; explicit theme scopes override inherited variables. `color-scheme` follows the selected theme. Scope-aware overlays MUST retain/inherit the nearest theme: they render in the browser's top layer in place, which keeps that inheritance, including on `::backdrop`. Only a portal fallback, if the UL-05 native-first ADR names an overlay that can't use the top layer, would need semantic variables copied into its portal root.

**Token naming invariant:** `primary` means brand action, `error` means semantic failure, `text` means readable foreground, `on-*` means foreground for a filled strong surface. Do not swap `error` and `danger` API labels within public CSS. Destructive buttons use the error family, but `aria-invalid` can also indicate invalid fields.

## 3. Frozen primitive palettes

All hex values below are sRGB. Each tone is a *design token*, not a formula for deriving another tone at runtime. Stops are intentionally curated; no gradient interpolation guarantees accessibility. Primitive colors alone have no semantic meaning.

### 3.1 Iris

| Shade | Hex | CSS variable |
|---|---|---|
| 50 | #EEEAFE | --erx-iris-50 |
| 100 | #DFD9FF | --erx-iris-100 |
| 200 | #C6BEFF | --erx-iris-200 |
| 300 | #B1A8FF | --erx-iris-300 |
| 400 | #A49CFF | --erx-iris-400 |
| 500 | #8275F1 | --erx-iris-500 |
| 600 | #6B5CE7 | --erx-iris-600 |
| 700 | #5145CD | --erx-iris-700 |
| 800 | #4338B5 | --erx-iris-800 |
| 900 | #352B9B | --erx-iris-900 |
| 950 | #231C67 | --erx-iris-950 |

### 3.2 Neutral

| Shade | Hex | CSS variable |
|---|---|---|
| 0 | #FFFFFF | --erx-neutral-0 |
| 25 | #FAFAFC | --erx-neutral-25 |
| 50 | #F4F5F9 | --erx-neutral-50 |
| 100 | #EBEDF3 | --erx-neutral-100 |
| 200 | #E1E4EC | --erx-neutral-200 |
| 300 | #C1C7D4 | --erx-neutral-300 |
| 400 | #949BAB | --erx-neutral-400 |
| 500 | #697386 | --erx-neutral-500 |
| 600 | #5B6374 | --erx-neutral-600 |
| 700 | #434B5C | --erx-neutral-700 |
| 800 | #30384B | --erx-neutral-800 |
| 850 | #242B3B | --erx-neutral-850 |
| 900 | #1B2130 | --erx-neutral-900 |
| 925 | #141925 | --erx-neutral-925 |
| 950 | #0B0E15 | --erx-neutral-950 |
| 1000 | #000000 | --erx-neutral-1000 |

### 3.3 Success

| Shade | Hex | CSS variable |
|---|---|---|
| 50 | #E7F7EF | --erx-success-50 |
| 100 | #D3F1E2 | --erx-success-100 |
| 200 | #A3DEC1 | --erx-success-200 |
| 300 | #7DE0B5 | --erx-success-300 |
| 400 | #60D9A6 | --erx-success-400 |
| 500 | #2EB985 | --erx-success-500 |
| 600 | #1F936A | --erx-success-600 |
| 700 | #167A54 | --erx-success-700 |
| 800 | #146344 | --erx-success-800 |
| 900 | #0E4733 | --erx-success-900 |
| 950 | #08291D | --erx-success-950 |

### 3.4 Error

| Shade | Hex | CSS variable |
|---|---|---|
| 50 | #FDECEF | --erx-error-50 |
| 100 | #FBDDE3 | --erx-error-100 |
| 200 | #F2B9C4 | --erx-error-200 |
| 300 | #FF95A3 | --erx-error-300 |
| 400 | #FF8193 | --erx-error-400 |
| 500 | #EC5570 | --erx-error-500 |
| 600 | #D83D5B | --erx-error-600 |
| 700 | #C12F49 | --erx-error-700 |
| 800 | #A3233C | --erx-error-800 |
| 900 | #75172C | --erx-error-900 |
| 950 | #420E1C | --erx-error-950 |

### 3.5 Warning

| Shade | Hex | CSS variable |
|---|---|---|
| 50 | #FFF4DC | --erx-warning-50 |
| 100 | #FFEBC4 | --erx-warning-100 |
| 200 | #EBCB85 | --erx-warning-200 |
| 300 | #F6CB80 | --erx-warning-300 |
| 400 | #F2BC63 | --erx-warning-400 |
| 500 | #D99A3B | --erx-warning-500 |
| 600 | #B7741C | --erx-warning-600 |
| 700 | #96580A | --erx-warning-700 |
| 800 | #814C05 | --erx-warning-800 |
| 900 | #633806 | --erx-warning-900 |
| 950 | #3C250B | --erx-warning-950 |

### 3.6 Info

| Shade | Hex | CSS variable |
|---|---|---|
| 50 | #EAF2FF | --erx-info-50 |
| 100 | #D7E8FF | --erx-info-100 |
| 200 | #B8D4FF | --erx-info-200 |
| 300 | #A2CAFF | --erx-info-300 |
| 400 | #83B6FF | --erx-info-400 |
| 500 | #5595EB | --erx-info-500 |
| 600 | #3478D3 | --erx-info-600 |
| 700 | #1C61BF | --erx-info-700 |
| 800 | #164E9D | --erx-info-800 |
| 900 | #133A72 | --erx-info-900 |
| 950 | #0C2447 | --erx-info-950 |

## 4. Semantic color tokens: core, actions and interaction

The following table is authoritative. Copy its values into the theme source; do not transcribe them from concept mockups. Component variables should *reference* these semantic roles.

| Semantic name (`--erx-color-…`) | Light | Dark |
|---|---|---|
| canvas | #FAFAFC | #0B0E15 |
| surface | #FFFFFF | #141925 |
| surface-muted | #F4F5F9 | #1B2130 |
| surface-sunken | #EBEDF3 | #0B0E15 |
| surface-elevated | #FFFFFF | #242B3B |
| surface-inverse | #1B2130 | #F5F7FC |
| text | #161925 | #F5F7FC |
| text-secondary | #5B6374 | #A9B2C3 |
| text-tertiary | #697386 | #8896AD |
| text-disabled | #81899A | #78849A |
| text-inverse | #F5F7FC | #1B2130 |
| icon | #434B5C | #C4CBD9 |
| icon-secondary | #697386 | #A9B2C3 |
| icon-disabled | #81899A | #78849A |
| border-subtle | #E1E4EC | #30384B |
| border-default | #C1C7D4 | #434B5C |
| border-strong | #8792A3 | #69758E |
| border-interactive | #8792A3 | #69758E |
| focus-ring | #4338B5 | #B8B2FF |
| focus-offset | #FFFFFF | #141925 |
| primary | #5145CD | #A49CFF |
| primary-hover | #4338B5 | #B8B2FF |
| primary-pressed | #352B9B | #CDC9FF |
| on-primary | #FFFFFF | #1A153B |
| secondary | #F4F5F9 | #242B3B |
| secondary-hover | #EBEDF3 | #30384B |
| secondary-pressed | #E1E4EC | #434B5C |
| on-secondary | #30384B | #F5F7FC |
| secondary-border | #C1C7D4 | #434B5C |
| ghost-hover | #F0F1F7 | #242D3D |
| ghost-pressed | #E1E4EC | #30384B |
| on-ghost | #30384B | #F5F7FC |
| link | #4338B5 | #C6BEFF |
| link-hover | #352B9B | #D8D4FF |
| link-visited | #713E95 | #DA9DFF |
| item-hover | #F0F1F7 | #242D3D |
| item-selected | #EEEBFF | #29254B |
| item-selected-text | #4338B5 | #D8D4FF |
| item-selected-border | #6B5CE7 | #A49CFF |
| disabled-bg | #F2F3F7 | #262B37 |
| disabled-fg | #81899A | #78849A |

### 4.1 Interaction state rules

- Default → hover → pressed: use explicit semantic values. Hover must not reduce text contrast. Pressed state persists only during activation or as designed by a selected/toggle control; do not equate pressed with selected.
- Keyboard focus: use outline: 2px solid var(--erx-color-focus-ring); outline-offset: 2px as the baseline. Preserve focus visibility on selected and error controls. If the control is close to a similarly colored background, add an offset gap/background; browser testing is authoritative.
- Selection: selected list items use item-selected + item-selected-text + a persistent indicator (checkmark, border, selected state/ARIA); OS text selection uses the dedicated text-selection-\* pair.
- Disabled: disabled colors are separate tokens; no opacity-only treatment. WCAG contrast exceptions for inactive controls do not authorize unreadable live content.
- Links in prose: underline by default, including visited links. link-visited is a presentational token only; avoid exposing navigation history through scripting.
- Fields: controls receive a 3:1 boundary on normal backgrounds. Error borders alone are insufficient; include explanatory text, error icon and aria-invalid when appropriate.

## 5. Status palettes: success, error, warning and info

`success`, `error`, `warning`, `info` share an identical 7-role contract, mapped below. Use `*-hover` and `*-pressed` for strong semantic actions. Use `*-soft` for passive containers, `*-text` for foregrounds on them, `*-border` for subtle outlines, and `on-*` for strong fills. Text inside strong pills/buttons uses `on-*`, never `*-text`.

| Token | Light | Dark |
|---|---|---|
| --erx-color-success | #167A54 | #60D9A6 |
| --erx-color-success-hover | #146344 | #7DE0B5 |
| --erx-color-success-pressed | #0E4733 | #A3DEC1 |
| --erx-color-success-soft | #E7F7EF | #113428 |
| --erx-color-success-text | #146344 | #70E3AD |
| --erx-color-success-border | #A3DEC1 | #2E7658 |
| --erx-color-on-success | #FFFFFF | #0B2B21 |
| --erx-color-error | #C12F49 | #FF8193 |
| --erx-color-error-hover | #A3233C | #FF95A3 |
| --erx-color-error-pressed | #75172C | #F2B9C4 |
| --erx-color-error-soft | #FDECEF | #3B1B26 |
| --erx-color-error-text | #A3233C | #FF95A3 |
| --erx-color-error-border | #F2B9C4 | #914052 |
| --erx-color-on-error | #FFFFFF | #38131F |
| --erx-color-warning | #96580A | #F2BC63 |
| --erx-color-warning-hover | #814C05 | #F6CB80 |
| --erx-color-warning-pressed | #633806 | #EBCB85 |
| --erx-color-warning-soft | #FFF4DC | #382A16 |
| --erx-color-warning-text | #814C05 | #F6CB80 |
| --erx-color-warning-border | #EBCB85 | #9A7334 |
| --erx-color-on-warning | #FFFFFF | #3C2A10 |
| --erx-color-info | #1C61BF | #83B6FF |
| --erx-color-info-hover | #164E9D | #A2CAFF |
| --erx-color-info-pressed | #133A72 | #B8D4FF |
| --erx-color-info-soft | #EAF2FF | #162C49 |
| --erx-color-info-text | #164E9D | #A2CAFF |
| --erx-color-info-border | #B8D4FF | #4274AF |
| --erx-color-on-info | #FFFFFF | #122A48 |

**Required usage rules:**

- Success: confirmations, completed operations; do not use success green for generic brand buttons.
- Error: field validation, failed operations and destructive actions; distinguish *validation error* from *destructive action* by copy and icon, not only the red hue.
- Warning: caution and reversible risk; warning buttons must still show comprehensible wording.
- Info: educational, neutral system guidance; avoid using info to imply success.
- Alerts: background = \*-soft, border = \*-border, title/body = \*-text, icon = \*; interactive buttons inside alerts use their own accessible action tokens.
- Toasts and inline notifications: announce meaningful status via appropriate live region semantics; choose severity from content, not color. Color system does not define assistive-technology behavior.

## 6. Component-focused semantic roles

| Token | Light | Dark |
|---|---|---|
| --erx-color-input-bg | #FFFFFF | #141925 |
| --erx-color-input-bg-hover | #FFFFFF | #1B2130 |
| --erx-color-input-bg-disabled | #F2F3F7 | #262B37 |
| --erx-color-input-border | #8792A3 | #69758E |
| --erx-color-input-border-hover | #5B6374 | #A9B2C3 |
| --erx-color-input-border-focus | #4338B5 | #B8B2FF |
| --erx-color-input-border-error | #C12F49 | #FF8193 |
| --erx-color-input-text | #161925 | #F5F7FC |
| --erx-color-input-placeholder | #697386 | #A9B2C3 |
| --erx-color-neutral-badge-bg | #F4F5F9 | #242B3B |
| --erx-color-neutral-badge-text | #434B5C | #C4CBD9 |
| --erx-color-neutral-badge-border | #E1E4EC | #434B5C |
| --erx-color-tooltip-bg | #1B2130 | #F5F7FC |
| --erx-color-tooltip-text | #F5F7FC | #1B2130 |
| --erx-color-tooltip-border | #30384B | #C1C7D4 |
| --erx-color-progress-track | #E9EBF3 | #30384B |
| --erx-color-progress-fill | #5145CD | #A49CFF |
| --erx-color-table-stripe | #FAFAFC | #1B2130 |
| --erx-color-table-row-hover | #F0F1F7 | #242D3D |
| --erx-color-table-row-selected | #EEEBFF | #29254B |
| --erx-color-code-bg | #F4F5F9 | #242B3B |
| --erx-color-code-text | #4338B5 | #D8D4FF |
| --erx-color-kbd-bg | #FFFFFF | #242B3B |
| --erx-color-kbd-text | #434B5C | #F5F7FC |
| --erx-color-kbd-border | #C1C7D4 | #69758E |

### 6.1 Recommended component token recipes

| Component | Default | Hover / focus / selected | Invalid / status |
|---|---|---|---|
| Button: `solid` variant, `primary` tone | primary + on-primary | primary-hover, primary-pressed, focus-ring | Destructive (`danger` tone) uses error + on-error |
| Button: secondary roles | secondary + on-secondary | secondary-hover, secondary-pressed | Keep border secondary-border |
| Button: `ghost` variant | Transparent + on-ghost | ghost-hover, ghost-pressed | Visible keyboard focus |
| TextField / Textarea | input-bg, input-text, input-border | input-border-hover, input-border-focus, focus-ring | input-border-error + message |
| Checkbox / Radio | border-interactive, primary | focus-ring; selected state includes check or dot | Semantic invalid text |
| Switch | switch-track-off, switch-track-on, switch-thumb | focus + visible thumb position | On/off always has accessible label |
| Badge / Chip | neutral-badge-\* or status \*-soft, \*-text | Selection indicated structurally | Avoid hue-only status |
| Tabs / navigation | text-secondary, item-hover | item-selected + indicator + item-selected-text | Do not encode selected solely in Iris |
| Dialog / Popover | surface-elevated, border-subtle, shadow | Focus and semantic overlay state | Backdrop uses overlay-scrim |
| Tooltip | tooltip-bg, tooltip-text, tooltip-border | Maintain text readability | Never provide sole access to essential info |
| Table | table-stripe, table-row-hover, table-row-selected | Selected needs checkbox/aria-selected | Invalid row may use error badge + label |
| Progress | progress-track, progress-fill | Text label and value | Indeterminate must describe status |
| Skeleton | skeleton-base, skeleton-shimmer | Reduced-motion: static base | Hidden from accessibility tree if decorative |
| Pagination | secondary, item-selected | Visible selected/active state | Accessible current-page indication |

Buttons express their treatment with `data-erx-variant` (`solid`, `soft`, `outline`, `ghost` or `text`) and their color intent with `data-erx-tone`. Which variant and tone use the secondary roles, and the rest of the variant-by-tone color mapping, are settled in UL-06.

## 7. Special-purpose colors — complete contract

| Semantic role | Light | Dark |
|---|---|---|
| --erx-color-overlay-scrim | rgb(10 12 25 / 48%) | rgb(0 0 0 / 65%) |
| --erx-color-shadow | rgb(25 30 50 / 12%) | rgb(0 0 0 / 35%) |
| --erx-color-shadow-strong | rgb(25 30 50 / 20%) | rgb(0 0 0 / 52%) |
| --erx-color-glow | rgb(107 92 231 / 14%) | rgb(107 92 231 / 14%) |
| --erx-color-text-selection-bg | #C6BEFF | #5145CD |
| --erx-color-text-selection-fg | #231C67 | #FFFFFF |
| --erx-color-search-mark-bg | #FFF0B8 | #6A4C1E |
| --erx-color-search-mark-text | #633806 | #FFF3CF |
| --erx-color-search-mark-active-bg | #EBCB85 | #8A6226 |
| --erx-color-skeleton-base | #E9EBF3 | #242B3B |
| --erx-color-skeleton-shimmer | #F7F8FB | #333D51 |
| --erx-color-scrollbar-track | transparent | transparent |
| --erx-color-scrollbar-thumb | #C1C7D4 | #434B5C |
| --erx-color-scrollbar-thumb-hover | #949BAB | #69758E |
| --erx-color-switch-track-off | #697386 | #69758E |
| --erx-color-switch-track-on | #5145CD | #A49CFF |
| --erx-color-switch-thumb | #FFFFFF | #FFFFFF |
| --erx-color-chart-grid | #E1E4EC | #30384B |
| --erx-color-chart-axis | #5B6374 | #A9B2C3 |
| --erx-color-chart-zero | #8792A3 | #69758E |
| --erx-color-chart-crosshair | #697386 | #A9B2C3 |
| --erx-color-chart-tooltip-bg | #FFFFFF | #242B3B |
| --erx-color-chart-tooltip-text | #161925 | #F5F7FC |
| --erx-color-chart-tooltip-border | #E1E4EC | #434B5C |
| --erx-color-chart-diverging-negative | #C12F49 | #FF8193 |
| --erx-color-chart-diverging-neutral | #8792A3 | #8896AD |
| --erx-color-chart-diverging-positive | #167A54 | #60D9A6 |
| --erx-color-chart-sequential-1 | #8275F1 | #6B5CE7 |
| --erx-color-chart-sequential-2 | #6B5CE7 | #8275F1 |
| --erx-color-chart-sequential-3 | #5145CD | #A49CFF |
| --erx-color-chart-sequential-4 | #4338B5 | #C6BEFF |
| --erx-color-chart-sequential-5 | #352B9B | #DFD9FF |
| --erx-color-chart-category-1 | #5145CD | #A49CFF |
| --erx-color-chart-category-2 | #1C61BF | #83B6FF |
| --erx-color-chart-category-3 | #167A54 | #60D9A6 |
| --erx-color-chart-category-4 | #96580A | #F2BC63 |
| --erx-color-chart-category-5 | #C12F49 | #FF8193 |
| --erx-color-chart-category-6 | #8B3AAE | #DA9DFF |
| --erx-color-chart-category-7 | #0F766E | #56D2CE |
| --erx-color-chart-category-8 | #46546C | #C4D0E5 |

### 7.1 Overlays and shadows

- Scrim: overlay-scrim is light rgb(10 12 25 / 48%) and dark rgb(0 0 0 / 65%). Alpha compositing depends on underlying content: validate the actual rendered dialog, not the raw alpha value.
- shadow, shadow-strong and glow represent shadow colors, not box-shadow geometry; glow is Iris 600 at 14% alpha in both themes and feeds the elevation system's `--erx-shadow-glow`. Elevation levels/blur/spread belong in the future elevation system.
- Tooltips deliberately invert a surface for contrast. Content-rich popovers and dialogs stay on surface-elevated and must use text.
- Native top-layer dialogs/popovers must retain semantic token inheritance and have a correctly themed scrim.

### 7.2 Text selection, search and code

- Native text selection: ::selection uses text-selection-bg/text-selection-fg when the app opts in (Eroxo ships no global ::selection rule; see 10.3); never confuse with a *selected row*.
- Search results: &lt;mark> uses search-mark-bg / search-mark-text. Active match switches to search-mark-active-bg with the same readable foreground using the contrast-validated active token. Provide current-match count/position; do not rely on shade alone.
- Inline code: code-bg and code-text; keys: kbd-bg, kbd-text, kbd-border. These styles belong to typography/docs components, not external arbitrary &lt;code> elements unless explicitly opted into.

### 7.3 Scrollbars, skeleton and accessibility

- Scrollbar colors are progressive enhancement. Prefer native scrollbars unless branded styling is necessary. Avoid hiding scrollbars; do not make tracks and thumbs indistinguishable.
- Skeleton animation moves luminance between skeleton-base and skeleton-shimmer, not opacity of the content. Disable shimmer under prefers-reduced-motion: reduce. Skeleton appearance is not a replacement for loading announcements.
- Disabled UI must not accidentally look actionable; tooltip and popover content remain keyboard-accessible where relevant.

## 8. Data visualization palettes

Eight categorical chart colors are frozen for both themes. They are selected for readable marks against their chart surfaces, but **not** guaranteed perceptually distinguishable from one another for all viewers. Always reinforce color with shapes, patterns, direct labels or clearly keyed legends; axis labels must meet text contrast. Avoid using the status palette as automatic series identities.

| Series | Light | Dark |
|---|---|---|
| 1 | #5145CD | #A49CFF |
| 2 | #1C61BF | #83B6FF |
| 3 | #167A54 | #60D9A6 |
| 4 | #96580A | #F2BC63 |
| 5 | #C12F49 | #FF8193 |
| 6 | #8B3AAE | #DA9DFF |
| 7 | #0F766E | #56D2CE |
| 8 | #46546C | #C4D0E5 |

**Categorical ordering:** keep semantic series indices consistent between light/dark. For persistent categories (e.g. product types), assign a stable explicit index rather than relying on data arrival order.

**Sequential data:** use `chart-sequential-1` through `-5` in increasing intensity/lightness as appropriate for the specific theme; do not use those stops as white-background body-text colors. Include numeric legend, tick marks and range descriptions. Note: in dark mode, increased value uses increased brightness.

**Diverging data:** `chart-diverging-negative`, `chart-diverging-neutral`, `chart-diverging-positive`. Center/neutral is explicitly labeled as zero, neutral or the relevant threshold. Provide direct values, not only colors.

**Chart chrome:** gridlines use `chart-grid`, axes `chart-axis`, zero line `chart-zero`, crosshair `chart-crosshair`; tooltip uses `chart-tooltip-*`. Highlight on hover can adjust line width/point size and tooltip, not only color. If a chart library lacks adequate semantics, add a tabular data alternative.

**Large-area fills:** default to low-opacity area fills derived at implementation time; alpha compositing must be verified over actual surfaces. Do not use solid categorical colors for large dashboard backgrounds.

## 9. Accessibility requirements and test matrix

- Text contrast: normal text 4.5:1 minimum, large text 3:1 (WCAG 1.4.3 AA). This spec voluntarily keeps primary text-bearing components at ≥4.5:1 where practical.
- Essential non-text visuals: 3:1 against adjacent backgrounds for inputs, focus indicators, selected controls, chart marks conveying meaning, etc. (WCAG 1.4.11 AA). Decorative separators are exempt when purely decorative.
- Focus: keyboard focus always visible (WCAG 2.4.7); choose a ≥2 CSS-pixel outline baseline and assess 3:1 against neighboring colors. WCAG 2.4.13 Focus Appearance is AAA, not an AA requirement; we use a strong internal design target without claiming automatic AAA conformance.
- Use of color: no status, chart category, field error or selection can be identified by hue alone (WCAG 1.4.1).
- Placeholder: treat meaningful placeholder text as text and maintain ≥4.5:1, but do not make placeholder a substitute for persistent labels.
- Alpha: composite overlay, selection, translucent chart fills and shadow against underlying content before evaluating contrast. Shadow is never the only edge for a required control boundary.
- Forced colors: use CSS system colors Canvas, CanvasText, ButtonText, ButtonFace, Highlight, HighlightText, GrayText in component overrides. Do not use forced-color-adjust: none globally. Borders and icon outlines must stay visible.
- Reduced motion: static skeleton; preserve color/label state changes without animation; avoid motion-based status-only cues.
- Testing contexts: both themes, nested themes, native top layer (and any portal fallback), high contrast mode, 200% zoom, disabled, hover, active, focus, invalid, and combinations.

### 9.1 Automated WCAG contrast checks — measured source-of-truth pairs

| Theme | Visual pairing | Ratio | Required | Result |
|---|---|---|---|---|
| Light | Body text / surface | 17.50:1 | 4.5:1 | PASS |
| Light | Secondary text / surface | 6.03:1 | 4.5:1 | PASS |
| Light | Tertiary text / surface | 4.78:1 | 4.5:1 | PASS |
| Light | Text / muted | 16.06:1 | 4.5:1 | PASS |
| Light | Placeholder / input | 4.78:1 | 4.5:1 | PASS |
| Light | Primary button | 6.81:1 | 4.5:1 | PASS |
| Light | Primary hovered | 8.50:1 | 4.5:1 | PASS |
| Light | Primary pressed | 10.66:1 | 4.5:1 | PASS |
| Light | Primary link / surface | 8.50:1 | 4.5:1 | PASS |
| Light | Selected text / selection | 7.27:1 | 4.5:1 | PASS |
| Light | Input border / input bg | 3.15:1 | 3.0:1 | PASS |
| Light | Input border hover / input bg | 6.03:1 | 3.0:1 | PASS |
| Light | Focus ring / surface | 8.50:1 | 3.0:1 | PASS |
| Light | Success badge text | 6.54:1 | 4.5:1 | PASS |
| Light | Error badge text | 6.43:1 | 4.5:1 | PASS |
| Light | Warning badge text | 6.47:1 | 4.5:1 | PASS |
| Light | Info badge text | 7.14:1 | 4.5:1 | PASS |
| Light | Success action | 5.32:1 | 4.5:1 | PASS |
| Light | Error action | 5.57:1 | 4.5:1 | PASS |
| Light | Warning action | 5.68:1 | 4.5:1 | PASS |
| Light | Info action | 5.98:1 | 4.5:1 | PASS |
| Light | Tooltip | 14.99:1 | 4.5:1 | PASS |
| Light | Error hovered action | 7.34:1 | 4.5:1 | PASS |
| Light | Success hovered action | 7.25:1 | 4.5:1 | PASS |
| Light | Warning hovered action | 7.07:1 | 4.5:1 | PASS |
| Light | Info hovered action | 8.04:1 | 4.5:1 | PASS |
| Light | Search highlight | 8.77:1 | 4.5:1 | PASS |
| Light | Active search highlight | 6.39:1 | 4.5:1 | PASS |
| Light | Selected text | 8.52:1 | 4.5:1 | PASS |
| Light | Axis text | 6.03:1 | 4.5:1 | PASS |
| Light | Visited link | 7.43:1 | 4.5:1 | PASS |
| Light | Chart series 1 / surface | 6.81:1 | 3.0:1 | PASS |
| Light | Chart series 2 / surface | 5.98:1 | 3.0:1 | PASS |
| Light | Chart series 3 / surface | 5.32:1 | 3.0:1 | PASS |
| Light | Chart series 4 / surface | 5.68:1 | 3.0:1 | PASS |
| Light | Chart series 5 / surface | 5.57:1 | 3.0:1 | PASS |
| Light | Chart series 6 / surface | 6.34:1 | 3.0:1 | PASS |
| Light | Chart series 7 / surface | 5.47:1 | 3.0:1 | PASS |
| Light | Chart series 8 / surface | 7.65:1 | 3.0:1 | PASS |
| Light | Chart sequential 1 / surface | 3.64:1 | 3.0:1 | PASS |
| Light | Chart sequential 2 / surface | 4.87:1 | 3.0:1 | PASS |
| Light | Chart sequential 3 / surface | 6.81:1 | 3.0:1 | PASS |
| Light | Chart sequential 4 / surface | 8.50:1 | 3.0:1 | PASS |
| Light | Chart sequential 5 / surface | 10.66:1 | 3.0:1 | PASS |
| Light | chart-diverging-negative / surface | 5.57:1 | 3.0:1 | PASS |
| Light | chart-diverging-neutral / surface | 3.15:1 | 3.0:1 | PASS |
| Light | chart-diverging-positive / surface | 5.32:1 | 3.0:1 | PASS |
| Light | Input error border / input bg | 5.57:1 | 3.0:1 | PASS |
| Light | Focus ring / muted surface | 7.80:1 | 3.0:1 | PASS |
| Dark | Body text / surface | 16.39:1 | 4.5:1 | PASS |
| Dark | Secondary text / surface | 8.23:1 | 4.5:1 | PASS |
| Dark | Tertiary text / surface | 5.87:1 | 4.5:1 | PASS |
| Dark | Text / muted | 14.99:1 | 4.5:1 | PASS |
| Dark | Placeholder / input | 8.23:1 | 4.5:1 | PASS |
| Dark | Primary button | 7.23:1 | 4.5:1 | PASS |
| Dark | Primary hovered | 8.94:1 | 4.5:1 | PASS |
| Dark | Primary pressed | 11.03:1 | 4.5:1 | PASS |
| Dark | Primary link / surface | 10.21:1 | 4.5:1 | PASS |
| Dark | Selected text / selection | 10.12:1 | 4.5:1 | PASS |
| Dark | Input border / input bg | 3.79:1 | 3.0:1 | PASS |
| Dark | Input border hover / input bg | 7.53:1 | 3.0:1 | PASS |
| Dark | Focus ring / surface | 9.08:1 | 3.0:1 | PASS |
| Dark | Success badge text | 8.59:1 | 4.5:1 | PASS |
| Dark | Error badge text | 7.35:1 | 4.5:1 | PASS |
| Dark | Warning badge text | 9.12:1 | 4.5:1 | PASS |
| Dark | Info badge text | 8.34:1 | 4.5:1 | PASS |
| Dark | Success action | 8.67:1 | 4.5:1 | PASS |
| Dark | Error action | 6.88:1 | 4.5:1 | PASS |
| Dark | Warning action | 7.94:1 | 4.5:1 | PASS |
| Dark | Info action | 6.96:1 | 4.5:1 | PASS |
| Dark | Tooltip | 14.99:1 | 4.5:1 | PASS |
| Dark | Error hovered action | 7.87:1 | 4.5:1 | PASS |
| Dark | Success hovered action | 9.55:1 | 4.5:1 | PASS |
| Dark | Warning hovered action | 9.00:1 | 4.5:1 | PASS |
| Dark | Info hovered action | 8.57:1 | 4.5:1 | PASS |
| Dark | Search highlight | 7.12:1 | 4.5:1 | PASS |
| Dark | Active search highlight | 4.92:1 | 4.5:1 | PASS |
| Dark | Selected text | 6.81:1 | 4.5:1 | PASS |
| Dark | Axis text | 8.23:1 | 4.5:1 | PASS |
| Dark | Visited link | 8.57:1 | 4.5:1 | PASS |
| Dark | Chart series 1 / surface | 7.34:1 | 3.0:1 | PASS |
| Dark | Chart series 2 / surface | 8.45:1 | 3.0:1 | PASS |
| Dark | Chart series 3 / surface | 10.02:1 | 3.0:1 | PASS |
| Dark | Chart series 4 / surface | 10.16:1 | 3.0:1 | PASS |
| Dark | Chart series 5 / surface | 7.37:1 | 3.0:1 | PASS |
| Dark | Chart series 6 / surface | 8.57:1 | 3.0:1 | PASS |
| Dark | Chart series 7 / surface | 9.62:1 | 3.0:1 | PASS |
| Dark | Chart series 8 / surface | 11.29:1 | 3.0:1 | PASS |
| Dark | Chart sequential 1 / surface | 3.61:1 | 3.0:1 | PASS |
| Dark | Chart sequential 2 / surface | 4.82:1 | 3.0:1 | PASS |
| Dark | Chart sequential 3 / surface | 7.34:1 | 3.0:1 | PASS |
| Dark | Chart sequential 4 / surface | 10.21:1 | 3.0:1 | PASS |
| Dark | Chart sequential 5 / surface | 12.97:1 | 3.0:1 | PASS |
| Dark | chart-diverging-negative / surface | 7.37:1 | 3.0:1 | PASS |
| Dark | chart-diverging-neutral / surface | 5.87:1 | 3.0:1 | PASS |
| Dark | chart-diverging-positive / surface | 10.02:1 | 3.0:1 | PASS |
| Dark | Input error border / input bg | 7.37:1 | 3.0:1 | PASS |
| Dark | Focus ring / muted surface | 8.30:1 | 3.0:1 | PASS |

These ratios are computed from explicit opaque hex token pairs with the WCAG relative-luminance formula. They are *not* a claim that all UI permutations, borders on arbitrary custom themes, blended colors, or third-party content have passed. Extend the CI matrix as components are added.

## 10. Implementation architecture

**Canonical files (recommended; locations provisional until UL-13 picks one tokens folder and one generator):**

```text
src/
  styles/
    tokens/
      iris.tokens.json            # canonical authored file
      colors.css                  # generated artifact
      colors.d.ts                 # optional generated typed key interface
    components/                   # component CSS references semantic roles
test/
  colors.contrast.test.ts         # WCAG computed pairs
  colors.browser.spec.ts          # browser rendered-state checks
```

**Build rule:** the JSON is the only hand-edited source of color values. Generate CSS and optional TypeScript declarations. A CI check regenerates and fails on a dirty diff. The companion artifacts `eroxo-iris.tokens.json` and `eroxo-iris.colors.css` are planned but not yet in the repository (UL-13 may generate the token JSON from the tables in this specification); rename them when integrating while preserving content.

**CSS cascade and theming:** start every library stylesheet with the order statement `@layer erx.tokens, erx.components;` (exactly two layers; a third needs a UL-05 ADR), with semantic token mapping under `erx.tokens` and component rules under `erx.components`. Avoid `!important`. Consumer unlayered styles override library layers by normal cascade precedence. Consumers may set scoped CSS custom properties directly. Avoid runtime calculations of accessibility-critical foregrounds.

**Packaging warning:** the current repository has `"sideEffects": false`, which may cause color CSS to be removed by a bundler. Change it to something equivalent to `"sideEffects": ["**/*.css"]` and add a supported explicit CSS export (`"./colors.css"`) to the package's export map. Verify with a packed library in an external Vite + SSR fixture; do not presume CSS import works from the repository itself.

**CSS imports:** offer an explicit, documented import such as `import 'eroxo-ui/colors.css'`. A component-only build should not pull overlay logic. UL-04 recommended that each component import its own stylesheet, with a tokens stylesheet and a full stylesheet also exported; UL-05 decides whether components import the tokens themselves (see the [UL-04 report](../ul-04-spike.md)). Do not hard-code that distribution strategy into this color spec.

**Theme state:** an explicit `data-erx-theme="light"` or `"dark"` on a scope wins over OS preference. In the absence of an explicit theme on the root, `prefers-color-scheme` selects dark if requested; light otherwise. Nested scopes use inherited custom properties. The token generator redeclares, on `:root` and on each Eroxo scope, only the composite aliases whose inputs that scope changes, such as shadows built from colors on theme scopes, so they re-resolve inside custom themes; scope-independent roles, such as radius and typography roles, stay on `:root`, so an override set on an ancestor survives nested scopes. An app-owned selector such as `.brand-panel` may still override direct tokens, but composite aliases don't re-resolve there. Overlays render in the top layer in place and keep their theme scope; if the UL-05 native-first ADR keeps a portal for an overlay that can't use the top layer, carry the resolved semantic variables to its container or use a correctly scoped portal root. SSR must avoid an unthemed first paint.

### 10.1 Minimal CSS usage

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-button[data-erx-variant="solid"][data-erx-tone="primary"] {
    background: var(--erx-color-primary);
    color: var(--erx-color-on-primary);
    border: 1px solid transparent;
  }
  .erx-button[data-erx-variant="solid"][data-erx-tone="primary"]:hover:not(:disabled) {
    background: var(--erx-color-primary-hover);
  }
  .erx-button[data-erx-variant="solid"][data-erx-tone="primary"]:active:not(:disabled) {
    background: var(--erx-color-primary-pressed);
  }
  .erx-button:focus-visible {
    outline: 2px solid var(--erx-color-focus-ring);
    outline-offset: 2px;
  }
  .erx-field {
    background: var(--erx-color-input-bg);
    color: var(--erx-color-input-text);
    border: 1px solid var(--erx-color-input-border);
  }
  .erx-field[aria-invalid="true"] {
    border-color: var(--erx-color-input-border-error);
  }
  .erx-alert[data-erx-tone="success"] {
    background: var(--erx-color-success-soft);
    color: var(--erx-color-success-text);
    border: 1px solid var(--erx-color-success-border);
  }
}
```

### 10.2 Example custom brand override

```css
[data-erx-theme="acme"] {
  --erx-color-primary: #1C61BF;
  --erx-color-primary-hover: #164E9D;
  --erx-color-primary-pressed: #133A72;
  --erx-color-on-primary: #FFFFFF;
  --erx-color-focus-ring: #164E9D;
}
/* A custom dark theme must supply a separate, validated mapping. */
```

### 10.3 CSS snippets for specialized content

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  mark.erx-search-match {
    background: var(--erx-color-search-mark-bg);
    color: var(--erx-color-search-mark-text);
  }
  .erx-skeleton {
    background: var(--erx-color-skeleton-base);
  }
  @media (prefers-reduced-motion: reduce) {
    .erx-skeleton { animation: none; }
  }
  @media (forced-colors: active) {
    .erx-button:focus-visible, .erx-field:focus-visible {
      outline-color: Highlight;
    }
    .erx-field { border-color: ButtonText; }
    .erx-field[aria-invalid="true"] { border-style: dashed; }
  }
}
```

Selection colors are opt-in: Eroxo ships no global `::selection` rule. An app that wants them adds this rule to its own stylesheet:

```css
::selection {
  background: var(--erx-color-text-selection-bg);
  color: var(--erx-color-text-selection-fg);
}
```

## 11. Acceptance criteria (UL-12 / UL-13 implementation)

**A. Data and generation**

- [ ] Every primitive shade and every semantic token is present in JSON, generated CSS and developer reference.
- [ ] Light and dark contain the exact same semantic keys; no accidental CSS key drift.
- [ ] Generator output is deterministic and CI rejects uncommitted generated diffs.
- [ ] All public names start with `--erx-`; no hard-coded component color hexes.

**B. Accessibility**

- [ ] All listed contrast pairs pass CI (4.5:1 text, 3:1 required control edges).
- [ ] Generated custom themes have a documented override validation pathway; users are warned when semantic overrides break contrast.
- [ ] Manual browser checks cover 200% zoom, forced colors, light/dark, keyboard focus, alert state and text selection.
- [ ] Status, chart, selection and invalid states have non-color cues and accessible labeling.

**C. Runtime / distribution**

- [ ] CSS imports from the **packed npm artifact** and is retained by bundlers.
- [ ] Explicit theme selectors, OS preference fallback, nested scopes and no-flash first paint work.
- [ ] Native top-layer overlays, and any portal fallback, preserve nearest theme context or documented equivalent.
- [ ] No runtime CSS-in-JS; CSS variables are the public customization contract.

**D. Design quality**

- [ ] A reference board demonstrates 5 button states, form validation, alerts, badges, tooltip, overlay, table, skeleton and 8-series chart in both themes.
- [ ] Color does not dominate large surfaces; chart colors are reserved for data marks.
- [ ] Every role has a description and at least one documented component usage.

## 12. Delivery sequence (for engineers)

1. UL-04 proof: done; see the [UL-04 report](../ul-04-spike.md). A packed library in a single-page app and an SSR app confirmed cascade layers, CSS imports and theming; forced colors stay with the manual browser checks in section 11.
1. UL-06 decision: approve the --erx- naming grammar, semantic roles and custom override behavior.
1. UL-12 source: commit canonical tokens and this specification; create light/dark reference board. This closes design choices for color v0.2.0.
1. UL-13 generator: generate CSS and typed keys, wire contrast CI, publish canary. Confirm theme inheritance and CSS distribution.
1. UL-18 / UL-19: implement scoped theme mechanism and customization contract tests; then build real Button/Field/Alert examples against these tokens.
1. Change policy: once published, changing a semantic token value is a visual-impact change requiring comparison screenshots, contrast reruns and a changeset. Renaming/removing public tokens is a breaking API change.

## 13. References and project alignment

- Eroxo repo: https://github.com/ronmilich/eroxo-ui
- Product charter: https://github.com/ronmilich/eroxo-ui/blob/main/docs/ul-01-charter.md
- Roadmap: https://github.com/ronmilich/eroxo-ui/blob/main/docs/ui-library-roadmap.md
- WCAG 2.2 normative standard: https://www.w3.org/TR/WCAG22/
- W3C Understanding Non-text Contrast (1.4.11): https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast
- W3C Understanding Use of Color (1.4.1): https://www.w3.org/WAI/WCAG22/Understanding/use-of-color
- W3C CSS Color Adjustment (forced colors): https://www.w3.org/TR/css-color-adjust-1/

**Status note:** the palette and rules are locked here as implementation inputs. Passing the listed opaque contrast pairs is verified by the generated test data. WCAG conformance of the final component library remains subject to actual rendered tests and manual verification.

## Open items after 0.2.0

- **Naming grammar and tiers (D5):** the token naming grammar that shows each tier; whether semantic tokens may hold literal values (92 of the 258 semantic hex values in this specification aren't in the primitive palette); and a cap on the component tier, which includes component-local aliases such as `--erx-button-bg`. Settled in UL-06 and UL-12.
- **Tooltip border (D8):** this specification defines `--erx-color-tooltip-border`; ERX-DS-SHAPE-001 gives tooltips no border. The designer settles it in UL-12.
- **Button variants (D3):** each component's variant subset and the variant-by-tone color mapping, including which variant and tone use the secondary roles. Settled in UL-06.
- **Portal fallback (C7):** whether any overlay can't use the top layer and needs a portal that carries the resolved semantic variables. Settled by the UL-05 native-first ADR.
- **Tokens folder and generator (record gaps):** `src/styles/tokens/` and the generator are provisional. UL-13 picks one tokens folder and one generator.
- **Custom theme fallback (record gaps):** what happens when a custom theme such as `[data-erx-theme="acme"]` omits a token. Settled in UL-13.
- **Missing companion files (record gaps):** `eroxo-iris.tokens.json` and `eroxo-iris.colors.css` are not in the repository. The owner adds them, or UL-13 generates the token JSON from the tables in this specification.
- **Design source (record gaps):** a design source, such as Figma, for the light and dark themes. Settled by the owner in UL-12.
- **CSS export names** (found during the 0.2.0 revision; the record doesn't cover it): this spec proposes per-family token stylesheets such as `eroxo-ui/colors.css`, while UL-04 recommended `tokens.css`, a full stylesheet and per-component CSS. Settled by UL-05's CSS-delivery ADR.
