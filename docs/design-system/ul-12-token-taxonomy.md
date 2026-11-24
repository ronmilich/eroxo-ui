# UL-12 · Iris design language and token taxonomy

**Approved on 24 November 2026.** The owner approved this token specification and both default theme designs for UL-13. The reviewed [design revision](https://github.com/ronmilich/eroxo-ui/commit/6e45279bb29f97629867a2c01cfbc7a3c18feb7f) incorporates the seven foundation specifications and the approved [reconciliation](reconciliation.md).

**Design source** Open the [editable HTML study](../../dev/public/design/iris.html) in a browser or use the [hosted comparison](https://ronmilich.github.io/eroxo-ui/design/iris.html). Change density, tab through the fields, and save an edit on each surface. The same composition in each theme makes differences in the field boundary, action, floating surface and focus ring visible.

## Context and visual direction

Iris is the neutral default for a general-purpose library. Give ordinary content the largest share of the surface. Use cool neutrals for structure, a single iris accent for action, selection and focus, and labeled feedback for status. Keep cards flat with a subtle edge. Use a tinted elevated surface and a shadow when content floats. Typography and spacing carry hierarchy even when the operating system replaces the palette.

## Token contract

Every public name starts with `--erx-`. Record each token's family, tier and owning spec in the UL-13 source. Use lowercase kebab-case and logical axes such as `inline` and `block`. Suffixes have meaning within their family.

| Tier | How to identify it | Example chain |
|---|---|---|
| Primitive | A family plus a shade, scale step, size or named constant. Carries a literal measurement, stack, curve or color. | `--erx-iris-700` = `#5145CD`, `--erx-iris-400` = `#A49CFF` |
| Semantic | A foundation-owned role. Its value can be an alias, a composite or a documented literal. A role can name its intended component. | `--erx-color-primary` uses Iris 700 in light and Iris 400 in dark. `--erx-radius-control` uses `--erx-radius-md`. |
| Component hook | A documented, optional `--erx-<component>-<property>` read where the CSS property is applied. | `background: var(--erx-button-bg, var(--erx-color-primary))` |

Prefer an existing primitive when its value and meaning match. Preserve the exact COLOR tables for curated colors between stops. Record these as semantic literals with their role, mode and contrast partner. Preserve the optical size and line-height literals specified by TYPE. Adding a shade or a scale step requires a reusable design purpose. Keep radius scale names (`md`) and role names (`control`) in their established namespace. Reserve the scale suffixes for primitives. Geometry such as `--erx-table-row-min-block-size-md` is a size primitive. `--erx-elevation-dialog` and `--erx-motion-dialog-exit` are foundation roles. Their component names describe usage.

Use up to four documented override hooks per component family. Additional hooks require a use case and owner approval under [UL-06 §8](eroxo-iris-component-anatomy-api-spec.md). Let ancestor overrides inherit. Use `--_erx-*` for private implementation variables.

## Foundation inventory

The linked tables own the complete scale values and mappings. UL-13 should consume them together with the decisions here.

| Foundation | Primitives and roles | Application |
|---|---|---|
| [Color §§3–9](eroxo-iris-color-spec.md) | Iris, neutral, success, error, warning and info scales feed `--erx-color-*` roles. | Canvas and surface, text, icons, borders, focus, action states, selection, feedback, field, tooltip, overlay and chart pairs. Map dark roles independently. |
| [Typography §§2–4](eroxo-iris-typography-spec.md) | System sans and mono stacks, weight and tracking primitives feed `--erx-type-<role>-<property>`. | 14 px equivalent for UI, 16 px for body. Read the optional role-family override at use time, with the system stack as fallback. |
| [Spacing and sizing §§3–5](eroxo-iris-spacing-sizing-spec.md) | Space steps, control geometry and glyph sizes feed density roles. | Apply rem-based minimum sizes, logical padding and gaps. Controls grow for zoom and wrapped labels. |
| [Shape and borders §§3–7](eroxo-iris-shape-borders-spec.md) | Radii 0, 6, 10, 14, 20 px and full. Border width roles cover ordinary and emphasized edges. | Controls and tooltips use 10 px corners, cards and popovers 14 px, dialogs 20 px. Inputs use the dedicated interactive field boundary. |
| [Elevation and depth §§3–8](eroxo-iris-elevation-depth-spec.md) | Shadow recipes 0–4 combine geometry with theme-owned pigments. Elevation roles choose recipes. | Flat card 0, raised card 1, tooltip/menu 2, toast 3, dialog 4. Modal scrim uses `--erx-color-overlay-scrim`. In-page z-index is base 0 and sticky 100. Native overlays use the browser top layer. |
| [Motion §§3–5](eroxo-iris-motion-interactions-spec.md) | 0, 120, 180, 250 and 350 ms interaction durations and the named easing curves feed semantic timing roles. | Use immediate focus and theme changes. Reduced motion completes presence transitions immediately. Preserve the separately specified spin and pulse periods. |
| [Iconography §§3–4](eroxo-iris-iconography-spec.md) | Standalone icon boxes are 16, 20, 24 and 32 px. Default is 20 px, stroke width 2. | Control glyphs use the spacing spec's 16/18/20 px control-icon sizes. Inherit foreground color. Give an icon-only control an accessible name. |

### Density aliases

The prefix for every suffix below is `--erx-density-`. Dimensions are nominal CSS pixels at a 16 px root. Convert to rem for the emitted spacing. Standard is the default. An explicit control size overrides only that control.

| Role suffix | Compact | Standard | Comfortable |
|---|---:|---:|---:|
| `control-default-{min-block-size,padding-inline,padding-block,gap,icon-size}` | sm | md | lg |
| `card-padding` | 16 | 20 | 24 |
| `dialog-padding` | 20 | 24 | 32 |
| `form-gap` | 12 | 16 | 20 |
| `field-label-gap` | 4 | 6 | 8 |
| `field-helper-gap` | 4 | 6 | 8 |
| `action-group-gap` | 8 | 12 | 16 |
| `section-gap` | 24 | 32 | 40 |
| `page-gutter` | 16 | 24 | 32 |
| `popover-padding` | 12 | 16 | 20 |
| `tooltip-padding` | 8 | 10 | 12 |
| `alert-padding` | 12 | 16 | 20 |
| `toast-padding` | 12 | 16 | 20 |
| `menu-padding` | 4 | 6 | 8 |
| `table-cell-padding-block` | 8 | 10 | 12 |
| `table-cell-padding-inline` | 12 | 16 | 20 |
| `list-row-gap` | 6 | 8 | 10 |

The control-default row selects five primitives from SPACE §4. In column order those five measurements are 32/12/4/6/16 for sm, 40/16/6/8/18 for md, and 48/20/8/10/20 for lg. The 48 px control provides the touch-first option. Preserve a 24 × 24 CSS px minimum interactive target or a documented applicable exception.

## Approved decisions

- **Tooltip edge (D8).** Use a 1 px solid `--erx-color-tooltip-border` on the inverse surface, radius 10 px, elevation 2. The borderless shape option loses the explicit edge when shadows disappear. Use a visible system-color border in forced colors.
- **Tooltip exit (D12).** Map `--erx-motion-tooltip-exit` to `--erx-motion-duration-fast` (120 ms). Keeping the 90 ms draft would add a scale step for a single exit. UL-27 owns the hover-delay token and interaction profile.
- **Scope resolution (D6).** Emit root defaults for both schemes and let explicit light/dark scopes choose their mapping and `color-scheme`. Recompute color-dependent composites on theme scopes and density-dependent geometry on density scopes. Keep scope-independent type and radius roles inherited. This lets density and theme nest in either order. Preserve the two CSS layers and first-paint delivery in [ADR 04](../adr/04-css.md).

## Contrast and accessibility

| Pair in the study | Light | Dark | Minimum |
|---|---:|---:|---:|
| Text on surface | 17.50 | 16.39 | 4.5 |
| On-primary on primary | 6.81 | 7.23 | 4.5 |
| Success text on success-soft | 6.54 | 8.59 | 4.5 |
| Input border against field fill | 3.15 | 3.79 | 3 |
| Focus ring against surface | 8.50 | 9.08 | 3 |

Ratios use sRGB relative luminance for the two opaque colors. Body and control text require 4.5:1. Large text and essential non-text boundaries require 3:1. Use a visible 2 px outline with a 2 px offset, including on invalid or selected controls. Preserve a text or shape cue for feedback. In forced colors use Canvas/CanvasText, ButtonFace/ButtonText, Highlight/HighlightText and GrayText as appropriate. Draw edges and focus even when backgrounds and shadows are replaced.

## Handoff

The study was checked in Chromium at 32, 40 and 48 px control minimums. Keyboard navigation reached the editable field with visible focus, both forms reported the saved name, the layout fit a 320 px viewport, and forced-colors emulation removed the tooltip shadow. The repository's axe scan passed on the study.

UL-12 is complete. UL-13 owns the production token source, generated CSS, complete contrast matrix and public token reference. The existing Eroxo package, selectors and CSS delivery contract continue to govern TaoTale integration at TAO-09/10.
