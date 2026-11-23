# Eroxo Iris — Elevation & Depth System Specification

**Document ID:** ERX-DS-DEPTH-001  
**Version:** 0.2.0  
**Decision date:** 23 November 2026  
**Status:** Design contract approved; engineering verification pending  
**Owner:** Eroxo UI  
**Scope:** SolidJS 2 styled component library, Eroxo Iris default themes

> **0.2.0 (23 November 2026):** revised to match the approved [Iris reconciliation record](reconciliation.md): C2, C7, D1, D6 and D12, and the record's gaps on paths and missing companion files. Choices it leaves open are listed under "Open items after 0.2.0".

> **Normative language:** MUST / MUST NOT are requirements; SHOULD is the recommended default; MAY is an optional capability. Values in this document are frozen as the v0.1 baseline unless superseded by a recorded design decision. They are **not** a claim that browser conformance is already complete.

## 1. Executive decision record

Eroxo Iris uses **subtle hybrid depth**: restrained shadows, border-first static surfaces, and tonal separation in dark mode. Most UI remains on the page plane. Floating surfaces are deliberately prominent enough to be recognized, yet stay opaque and readable. Elevation does not introduce hover movement or automatic shadow transitions.

| Decision | Contract |
|---|---|
| Elevation philosophy | Subtle hybrid: shadows plus surface tone and borders |
| Number of levels | 5 (0 flat, 1 raised, 2 floating, 3 prominent, 4 modal) |
| Light mode | Neutral surface and increasingly soft/deep shadows |
| Dark mode | Tonal surface changes plus neutral black shadows |
| Floating panels | Fully opaque by default, including menus and popovers |
| Backdrop blur / glass | Excluded from the Eroxo v0.1 default system |
| Iris glow | Opt-in decorative effect only; never a functional state indicator |
| Hover | No automatic lift, translate, or shadow escalation |
| Default cards | Flat (level 0) with a subtle structural border |
| Motion | No elevation animation; transitions deferred to Motion specification |
| Theme architecture | Static CSS tokens, light/dark/custom scopes, no JS shadow calculations |
| Public API | Semantic CSS custom properties; no general `elevation` or `glow` prop required on every component |

**Dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001 and ERX-DS-SHAPE-001. This document adds depth and stacking tokens only, and does **not** redefine the other foundations.

## 2. Scope and separation of concerns

**This specification owns:** shadow geometry; level aliases; component-to-level mapping; surface composition; decorative glow policy; CSS-managed layer indices; native top-layer boundaries; scrim application; and visual verification criteria.

**This specification does not own:** focus-trap algorithms, dismissal, scroll locking, portal lifecycle, nested overlay orchestration, anchoring/positioning geometry, entry/exit presence, or animation easing. Those belong to the behavior and Motion milestones. A shadow level is not a focus, modality, keyboard, or stacking guarantee.

## 3. Existing Iris color references — reuse, never duplicate

Consume the following **existing** color tokens, with their already-finalized values:

| Existing color token | Light | Dark | Depth usage |
|---|---|---|---|
| `--erx-color-surface` | `#FFFFFF` | `#141925` | Flat opaque surface |
| `--erx-color-surface-muted` | `#F4F5F9` | `#1B2130` | Tonal separation / raised panel |
| `--erx-color-surface-elevated` | `#FFFFFF` | `#242B3B` | Floating/modal opaque panels |
| `--erx-color-border-subtle` | `#E1E4EC` | `#30384B` | Structural edges |
| `--erx-color-border-interactive` | `#8792A3` | `#69758E` | Required interactive control edges |
| `--erx-color-shadow` | `rgb(25 30 50 / 12%)` | `rgb(0 0 0 / 35%)` | Ambient shadow pigment |
| `--erx-color-shadow-strong` | `rgb(25 30 50 / 20%)` | `rgb(0 0 0 / 52%)` | Major/modal shadow pigment |
| `--erx-color-glow` | `rgb(107 92 231 / 14%)` | `rgb(107 92 231 / 14%)` | Opt-in decorative glow pigment |
| `--erx-color-overlay-scrim` | `rgb(10 12 25 / 48%)` | `rgb(0 0 0 / 65%)` | **Modal** backdrop only |
| `--erx-color-focus-ring` | `#4338B5` | `#B8B2FF` | Keyboard focus, separate from shadows |

These color mappings are normative inputs from ERX-DS-COLOR-001, not a second palette. **Do not** copy their values into production depth CSS: reference the tokens. The optional decorative Iris glow uses `--erx-color-glow`: Iris-600 (`#6B5CE7`) at 14% alpha, the same in light and dark.

## 4. Primitive shadow levels — exact CSS geometry

All offsets and blur radii are CSS pixels. The level values compose with the current theme's shadow color tokens; **none of these values changes layout size**.

| Token | Exact CSS value | Semantic use |
|---|---|---|
| `--erx-shadow-0` | `none` | Flat: ordinary cards, inputs, page sections |
| `--erx-shadow-1` | `0 1px 2px var(--erx-color-shadow)` | Raised: opt-in card, panel |
| `--erx-shadow-2` | `0 4px 12px var(--erx-color-shadow), 0 2px 4px var(--erx-color-shadow)` | Floating: popover, dropdown, tooltip |
| `--erx-shadow-3` | `0 12px 28px var(--erx-color-shadow), 0 4px 10px var(--erx-color-shadow)` | Prominent: toast, command surface |
| `--erx-shadow-4` | `0 24px 56px var(--erx-color-shadow-strong), 0 8px 20px var(--erx-color-shadow)` | Modal: dialog and alert dialog |
| `--erx-shadow-glow` | `0 0 24px var(--erx-color-glow)` | Opt-in decoration; never functional |

The two-layer composites provide close/contact and broader/ambient shadows. The higher dark-mode opacity is intentional and must not be reduced by an extra global opacity multiplier. Do not combine the strong shadow with `filter: drop-shadow()` by default, as that produces inconsistent clipping/geometry.

### 4.1 Level progression rules

- Level 0 MUST be fully flat; show separation with existing border/surface tokens.
- Level 1 is reserved for an explicit raised treatment; Cards default to 0.
- Levels 2–4 are for surfaces that occlude or visually float above other content.
- Level 4 MUST NOT imply modal behavior; only the overlay engine / native dialog makes a surface modal.
- Distinguish shadow *appearance* from placement: a level-2 tooltip may be above or below a level-4 overlay in a real nested interaction, depending on top-layer management.
- When a consumer overrides a shadow level, keep the names and category meaning stable.

## 5. Semantic elevation aliases and component mapping

Semantic depth aliases are **public** so themes can alter a class of surfaces without editing component internals.

| Alias | Default mapping | Component guidance |
|---|---|---|
| `--erx-elevation-surface` | `var(--erx-shadow-0)` | Flat page-integrated surfaces |
| `--erx-elevation-card` | `var(--erx-shadow-0)` | Default Card with border |
| `--erx-elevation-card-raised` | `var(--erx-shadow-1)` | Explicitly elevated Card |
| `--erx-elevation-popover` | `var(--erx-shadow-2)` | Popover panel |
| `--erx-elevation-menu` | `var(--erx-shadow-2)` | Dropdown menu |
| `--erx-elevation-tooltip` | `var(--erx-shadow-2)` | Tooltip |
| `--erx-elevation-toast` | `var(--erx-shadow-3)` | Toast notification |
| `--erx-elevation-command` | `var(--erx-shadow-3)` | Command palette panel, if implemented |
| `--erx-elevation-dialog` | `var(--erx-shadow-4)` | Dialog and AlertDialog |

| Component | Default level | Default surface | Border / radius integration |
|---|---:|---|---|
| Card | 0 | `surface` | 1px `border-subtle`, `radius-card` |
| Card with explicit raised variant | 1 | `surface-muted` in dark; `surface` in light | Existing Card geometry |
| DropdownMenu | 2 | `surface-elevated` | Subtle border, `radius-menu` |
| Popover | 2 | `surface-elevated` | Subtle border, `radius-popover` |
| Tooltip | 2 | Existing inverse-tooltip treatment | Use existing `radius-tooltip` and tooltip colors |
| Toast | 3 | `surface-elevated` | Subtle border, `radius-toast` |
| Command palette (future) | 3 | `surface-elevated` | Dialog-like structure, behavior decided later |
| Modal Dialog / AlertDialog | 4 | `surface-elevated` | `radius-dialog`, modal scrim |

The optional raised card surface may use `--erx-color-surface-muted` in dark mode; use a *specific* component surface alias when implementing it rather than adding a new generic palette. Tooltip inverse colors remain owned by the color system.

## 6. Visual surface rules — light, dark, and nesting

1. Opaque floating surfaces MUST use an existing opaque background token. A 1px border remains when a shadow is applied, unless an explicit component-specific exception is documented.
2. In light mode, depth arises primarily from soft neutral shadows on the white surface. In dark mode, it arises from both lighter-toned surfaces and dark shadows.
3. A shadow MUST NOT replace an interactive boundary, focus ring, invalid-state treatment, or selection indicator.
4. A nested theme may change surface and shadow colors. The shadow aliases MUST be **redeclared on the active theme scope** to avoid inherited values resolving against the parent theme (see Section 10).
5. Theme changes MUST not cause component remounts or JavaScript-driven measurements. The browser re-evaluates CSS.
6. Preserve the existing shape contract: 6/10/14/20px radii; elevation does not alter radius or density-based size.
7. Neither viewport width nor compact/standard/comfortable density changes the elevation level by default.

## 7. Scrims and modal backdrops

The single approved backdrop pigment is `--erx-color-overlay-scrim`. Use it for a **modal** overlay/backdrop, not for ordinary tooltips or nonmodal popovers.

Native modal dialog:

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-dialog[open]::backdrop {
    background: var(--erx-color-overlay-scrim);
  }
}
```

A custom overlay fallback, which exists only if the UL-05 native-first ADR names an overlay that can't use the top layer, MAY render an explicitly managed scrim element with `background: var(--erx-color-overlay-scrim)`, but focus containment, `inert`, escape/outside dismissal, scroll management and stacking orchestration must be supplied by the overlay engine. Do not style a nonmodal `<div>` with a modal scrim and claim it is accessible.

**No `backdrop-filter: blur(...)` in v0.1**. The scrim may obscure background content visually, but it must not be the sole indication that a modal is open. In forced-colors mode, the existing color spec maps the scrim to transparent; modal geometry/borders and correct blocking behavior remain necessary.

## 8. Stacking tokens vs. browser top layer

Eroxo publishes **CSS-managed stacking** tokens for normal document layers only:

| Token | Value | Intended usage |
|---|---:|---|
| `--erx-z-base` | 0 | Local application baseline |
| `--erx-z-sticky` | 100 | Sticky header within a managed context |

Overlays use no z-index token. They render in the browser's top layer: `<dialog>` with `showModal()` for modals, the Popover API with `popover="manual"` for tooltips. The [UL-04 spike](../ul-04-spike.md) found portals and a z-index stack unnecessary there, and overlays inherit theme, density and direction in place, including `::backdrop`. Other z-index tokens, a portal and a manual `inert` fallback exist only if the UL-05 native-first ADR names an overlay that can't use the top layer.

**Constraints:**

- These numeric values do not overcome a parent's stacking context, transforms, isolation, filters or clipping. They are not global absolute ordering guarantees.
- A modal `<dialog>` opened with `showModal()` and an open Popover API element occupy the browser's **top layer**, outside ordinary document z-index competition. `z-index: 999999` cannot escape a lower stacking context or beat a top-layer surface.
- Native top-layer ordering follows the platform's insertion/interaction rules; it is **not** derived from Eroxo shadow levels or these z-index tokens.
- Nested modal/popover orchestration, focus restoration and top-layer ordering MUST be implemented and verified under the in-house overlay engine milestones. Portal placement applies only to an overlay that the UL-05 native-first ADR keeps out of the top layer.
- `z-index` is not applied globally to every Card or button. The tokens are consumed only when a component genuinely establishes a positioned layer.

## 9. Optional Iris glow — constrained use

`--erx-shadow-glow` MAY be applied to nonessential decorative demos, marketing previews or explicit showcase surfaces. It MUST NOT be applied automatically to Button, Card, TextField, Popover, Dialog, Menu, or Tooltip.

- Avoid a public `glow` prop on every component. A documented class or CSS customization hook is sufficient.
- Glow MUST NOT convey keyboard focus, selection, hover, active, error or successful operation as its sole indicator.
- Do not use Glow as a substitute for the 2px focus outline and 2px offset from ERX-DS-SHAPE-001.
- In `forced-colors: active`, shadow glow MUST be removed and boundaries must remain visible.
- Glow should be tested against neighboring typography for readability; it must not create a distracting halo across dense interfaces.
- Custom brands may redefine the decorative token (or disable it with `none`) without modifying standard shadows.

Example:

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-showcase-glow {
    /* Dedicated opt-in effect; does not concatenate with a possible `none`. */
    box-shadow: var(--erx-shadow-glow);
  }
}
```

A `none` value in a comma-separated shadow list can invalidate the whole `box-shadow`; therefore production code SHOULD use a dedicated optional-effect declaration/override (see the implementation reference, planned and not yet in the repository), rather than blindly concatenating `none` with glow.

## 10. Token resolution, CSS cascade and SSR

**Canonical source:** `tokens/depth.json` generates `src/styles/depth.css` with no runtime dependency. All tokens live in `@layer erx.tokens`; example component rules live in `@layer erx.components`.

**Important CSS custom-property inheritance rule:** `--erx-shadow-2` references `--erx-color-shadow`. If the shadow variable is computed on the root and then inherited, a descendant that only overrides `--erx-color-shadow` can inherit the already resolved shadow. The token generator therefore redeclares all shadow primitives and semantic aliases on **`:root` and on every Eroxo theme scope**, where their color inputs change, so these composite aliases re-resolve inside custom themes. It redeclares only aliases whose inputs a scope changes: scope-independent roles, such as radius and typography roles, stay on `:root`, so an override set on an ancestor survives nested scopes. `data-erx-theme` takes `light` and `dark`; further values, such as custom theme names and `system`, are defined by UL-18, and a full custom theme is an Eroxo scope such as `[data-erx-theme="acme"]`. An app-owned selector such as `.brand-panel` may still override direct tokens, but composite aliases don't re-resolve there. A custom scope that is not an Eroxo theme scope MUST override semantic shadow tokens directly or opt into a documented depth scope. Test nested scopes explicitly.

Recommended stylesheet entrypoint, with imports resolved by the build tool:

```css
@layer erx.tokens, erx.components;
@import "./colors.css";
@import "./typography.css";
@import "./spacing.css";
@import "./shape.css";
@import "./depth.css";
```

**Integration warning:** the generated token files **already** contain `@layer erx.tokens`; therefore these imports MUST NOT be additionally wrapped with `layer(erx.tokens)` (which would create nested layers). A bundler may prefer JS-side CSS imports instead; in either case, inspect the final CSS and verify the actual cascade-layer names and order.

For a standalone application, import the published CSS exactly once and verify that package `sideEffects` metadata preserves extracted CSS. Eroxo's current `package.json` contains `"sideEffects": false`; before publishing CSS entrypoints, change it to a CSS-preserving glob such as `"sideEffects": ["**/*.css"]` and verify in an installed consumer build. No `document` or `window` access at module import time. SSR outputs the same class/state markup and static CSS custom properties as hydration.

## 11. Component CSS reference contract

```css
@layer erx.tokens, erx.components;

@layer erx.components {
  .erx-card {
    background: var(--erx-color-surface);
    border: var(--erx-border-width-default) solid var(--erx-color-border-subtle);
    border-radius: var(--erx-radius-card);
    box-shadow: var(--erx-elevation-card);
  }
  .erx-card[data-erx-elevation="raised"] {
    box-shadow: var(--erx-elevation-card-raised);
  }
  .erx-popover-content, .erx-menu-content {
    background: var(--erx-color-surface-elevated);
    border: var(--erx-border-width-default) solid var(--erx-color-border-subtle);
    box-shadow: var(--erx-elevation-popover);
  }
  .erx-dialog {
    background: var(--erx-color-surface-elevated);
    border: var(--erx-border-width-default) solid var(--erx-color-border-subtle);
    border-radius: var(--erx-radius-dialog);
    box-shadow: var(--erx-elevation-dialog);
  }
  .erx-dialog::backdrop { background: var(--erx-color-overlay-scrim); }
  @media (forced-colors: active) {
    .erx-card, .erx-popover-content, .erx-menu-content, .erx-dialog {
      box-shadow: none;
      border-color: CanvasText;
    }
    .erx-dialog::backdrop { background: transparent; }
  }
}
```

No component should use a blanket `transition: all`, hover `transform: translateY(...)`, or filter-based shadow. Buttons and input states inherit their own separate interaction rules.

## 12. Forced colors, accessibility and reduced motion

1. In `forced-colors: active`, the platform forces `box-shadow` to `none`; Eroxo MUST ensure floating surfaces retain a visible **system-colored border** such as `CanvasText` (or a more appropriate system color per element).
2. Focus indicators MUST use the Shape & Borders contract (`--erx-focus-outline-width`, `--erx-focus-outline-offset`, `--erx-color-focus-ring`), and in forced colors should resolve to `Highlight` / other appropriate system colors. Shadow alone is never focus.
3. Dismissible overlay content MUST remain operable via keyboard. This is an overlay-engine requirement, not something a CSS shadow supplies.
4. At 200% text zoom and narrow viewports, floating surfaces and dialogs MUST reflow without hiding essential controls or focus indicators. Overlays must avoid clipping within scroll containers; native top-layer placement, and any fallback placement that the UL-05 native-first ADR keeps, require separate tests.
5. Hover effects MUST NOT unexpectedly move or raise components. Reduced-motion mode must not produce movement or forced blur animations. Since elevation has no default animation, no separate reduced-motion fallback is required for these shadows.
6. Modal dimming MUST not replace accessible modality. Use the actual native dialog; tested custom focus/inert behavior applies only to an overlay that the UL-05 native-first ADR keeps out of the top layer.
7. Test light, dark, custom nested theme, high contrast, and low-end rendering. Avoid unnecessary large composited shadows on frequently repeated list items.

## 13. Testing and acceptance matrix

| Test ID | Requirement | Automated / manual acceptance |
|---|---|---|
| DEP-01 | Shadow level names/geometry | JSON and generated CSS values match exactly |
| DEP-02 | No duplicate token ownership | No collisions with color/type/space/shape namespaces |
| DEP-03 | Theme dependency | Light/dark colors resolve from Iris; no duplicate shadow color literals in primitives |
| DEP-04 | Theme nesting | Nested dark inside light resolves black shadow pigment and opaque elevated surface |
| DEP-05 | Card default | Level 0 has `box-shadow: none`; border visible |
| DEP-06 | Floating mapping | Menus/popovers level 2, toasts level 3, dialogs level 4 |
| DEP-07 | No auto lift | Hover does not apply translate, scale, or additional depth |
| DEP-08 | Iris glow | Opt-in only; never sole focus/error/selection signal |
| DEP-09 | Forced colors | Shadows suppressed; system-color borders and focus visible |
| DEP-10 | Modal backdrop | Only modal scrim; matching finalized light/dark values |
| DEP-11 | Browser engines | Chromium, Firefox, WebKit screenshots and computed style assertions |
| DEP-12 | Native top layer | Dialog/popover over transformed and isolated ancestors; nested overlay ordering tested |
| DEP-13 | RTL and text zoom | No clipped overlay, focus outline or unreadable surface at 200% and 320 CSS-pixel width |
| DEP-14 | SSR and hydration | Static CSS and stable markup; no prehydration shadow or theme flash attributable to JS |
| DEP-15 | Packaging | CSS preserved by bundler; only imported component CSS required; consumer re-theme works |

**Executable kit checks** (planned; the scripts, test and fixture are not yet in the repository): `node scripts/generate-depth.mjs --check`, `node scripts/validate-depth.mjs`, and `vitest run test/depth.tokens.test.ts` in the Eroxo project. The Node checks validate token determinism and invariants, but **do not claim browser accessibility conformance**. The planned HTML fixture documents manual visual checks and can be expanded into Playwright tests under UL-09.

## 14. Repository implementation layout

```text
docs/design-system/eroxo-iris-elevation-depth-spec.md
tokens/depth.json
src/styles/depth.css
src/styles/depth-components.reference.css
scripts/generate-depth.mjs
scripts/validate-depth.mjs
test/depth.tokens.test.ts
test/fixtures/depth.html
examples/DepthShowcase.tsx
integration/guide.md
README.md
MANIFEST.sha256.json
```

The token, CSS, script, test, fixture, example and guide files above are planned and not yet in the repository. Token file locations are provisional: UL-13 picks one tokens folder and one generator, and may generate `tokens/depth.json` from this specification's tables.

Recommended sequence: (1) merge this specification; (2) integrate JSON and CSS generation; (3) add color/shape/spacing integration imports; (4) build Card, Popover, Toast and Dialog visual fixtures; (5) run Chromium/Firefox/WebKit, forced-colors, nested-theme, SSR and consumer-package checks; (6) record evidence in UL-12/UL-13 and the relevant overlay milestones; (7) approve before public component release.

## 15. Public API and change control

The following are **public styling contracts**: `--erx-shadow-0..4`, `--erx-shadow-glow`, `--erx-elevation-*`, `--erx-z-base`, and `--erx-z-sticky`. Component-selectors and attributes must be documented before becoming publicly stable. Proposed `data-erx-elevation="raised"` on Card is a reference convention, **not** an approved universal `elevation` prop API.

A future change to any value or component default MUST record visual rationale, impacted themes, accessibility evidence, migration costs, and the semver impact. Keep glow optional and do not introduce glassmorphism without a separate design decision.

## 16. References and related specifications

- Eroxo `docs/ul-01-charter.md` and `docs/ui-library-roadmap.md` (UL-04, UL-05, UL-06, UL-12, UL-13, UL-18, UL-19, UL-24–UL-31).
- Eroxo Iris — Color System Specification, ERX-DS-COLOR-001 v0.2.0.
- Eroxo Iris — Typography Specification, ERX-DS-TYPE-001 v0.2.0.
- Eroxo Iris — Spacing & Sizing Specification, ERX-DS-SPACE-001 v0.2.0.
- Eroxo Iris — Shape & Borders Specification, ERX-DS-SHAPE-001 v0.2.0.
- MDN: [Top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer), [Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context), [Forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors), [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties), [Cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer).
- W3C: [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/).

**Release gate:** design defaults are final; shipping readiness depends on successful browser, keyboard, accessibility, SSR, and consumer integration verification.

## Open items after 0.2.0

- **Portal or manual-inert fallback** (C7): whether any overlay can't use the top layer and so needs a z-index token other than `--erx-z-base` and `--erx-z-sticky`, a portal, a fallback scrim element or a manual `inert` fallback (Sections 7, 8 and 12). Settled by the UL-05 native-first ADR.
- **Token naming and tiers** (D5): a naming grammar that shows each token's tier, and a cap on the component tier, which covers this spec's component-named aliases such as `--erx-elevation-card` and `--erx-elevation-dialog`. Settled in UL-06 and UL-12.
- **Tooltip border** (D8): COLOR defines `--erx-color-tooltip-border` and SHAPE gives the tooltip none. Section 6 keeps a 1px border with a shadow unless a component-specific exception is documented, so the level-2 tooltip follows that decision. Settled by the designer in UL-12.
- **Custom theme that omits a token** (record gap): what the redeclared shadow and elevation aliases resolve to when a custom theme leaves out a color token they use, such as `--erx-color-shadow`. Settled in UL-13.
- **Tokens folder and generator** (record gap on paths): where `tokens/depth.json` and the generated `src/styles/depth.css` live, and the single generator that produces them. Settled in UL-13.
- **Companion files** (record gap, missing companion files): the owner adds `tokens/depth.json`, the reference CSS, the scripts, the token test and the HTML fixture, or UL-13 generates the token JSON from this spec's tables. Settled by the owner or in UL-13.
- **Design source** (record gap): a design source, such as Figma, for the light and dark themes, including their surfaces and shadows. Settled by the owner in UL-12.
