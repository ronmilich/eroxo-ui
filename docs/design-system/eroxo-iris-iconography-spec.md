# Eroxo Iris — Iconography System Specification

**Specification ID:** ERX-DS-ICON-001  
**Version:** 0.1.0  
**Decision date:** 23 November 2026  
**Status:** Design and API baseline approved; implementation / browser conformance pending  
**Maintainer:** Eroxo UI  
**Platforms:** SolidJS 2, TypeScript, ESM, SSR, static CSS, light/dark/custom themes

> **Normative language.** MUST / MUST NOT are release-blocking requirements; SHOULD / SHOULD NOT are strong defaults; MAY describes optional capability. This document establishes a proposed public contract; the included reference code is not a claim of production readiness. The associated `tokens/iconography.json` is the normative source of token values.

## 1. Executive decision record

| Area | Final decision |
| --- | --- |
| Visual identity | **Precision Outline**: minimal, geometric, quiet and technically precise |
| Primary family | **Lucide**, with a curated, version-pinned subset of icons |
| Base canvas | 24 × 24 SVG viewBox |
| Stroke geometry | 2 SVG coordinate units; round caps and joins |
| Default paint | `fill="none"`, `stroke="currentColor"` |
| Standalone sizes | 16 / 20 / 24 / 32 CSS px; 20px default |
| Control glyph sizes | 16 / 18 / 20px for sm / md / lg controls |
| Density relationship | Resolved control size determines glyph size; density does not independently scale icons |
| Built-in distribution | Small first-party, statically exported icon subset + generic `Icon` SVG wrapper |
| External icons | Consumers can render any compatible standalone SVG / Lucide Solid component |
| Fill support | Curated filled glyphs only; **no universal `filled` prop** |
| API | CSS semantic tokens + optional `size`, `strokeWidth`, `class`, `style`, accessibility props |
| Color | Inherit `currentColor`; no dedicated icon-specific palette |
| Directionality | Semantic RTL mirroring only on explicitly directional glyphs |
| Motion | Static by default; any animation uses ERX-DS-MOTION-001 |
| Dependencies | No required icon runtime; do not bundle `@lucide/solid` as a dependency |
| Accessibility | Decorative icons hidden; meaningful icons named; IconButton named on the control |

**Dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001, ERX-DS-SHAPE-001, ERX-DS-DEPTH-001, ERX-DS-MOTION-001. The icon system MUST NOT redefine their primitives. Eroxo's UL-20 `Icon` and `IconButton` component contract takes precedence for control behavior, labeling and accessible hit areas.

## 2. Scope and ownership

**This specification owns:** outline glyph geometry, stroke and fill policy, icon sizes, semantic icon CSS variables, curated glyph catalog and export names, SVG wrapper contract, alignment, RTL mirroring, assets and provenance, accessibility semantics, icon tests and documentation.

**This specification does not own:** button hit-target sizes, motion durations, color hex values, focus ring, tooltip behavior, loading status announcements, dialog interactions, application-specific icon meaning, or brand logos. It does not create icon-only interactive controls; interactive wrappers are governed by the component system.

## 3. Visual construction rules

1. **Canvas:** curated glyphs MUST use `viewBox="0 0 24 24"`. Consumers may supply another SVG viewBox to the generic wrapper. Geometric paths may extend to an optically balanced inner area; do not assume all art has a 20×20 bounding box.
2. **Stroke:** `stroke-width="2"` in SVG user units at a 24×24 viewBox; round joins and round caps. Stroke scales with the SVG by default. Do not force `vector-effect="non-scaling-stroke"` globally.
3. **Baseline:** icon root MUST be `inline-block` or inline-flex-compatible, `vertical-align: middle`, `flex-shrink: 0`, and use a predictable square content box. Optical correction is allowed at component-slot level, but should not alter global paths.
4. **Paint:** outline icons default to `fill: none` and `stroke: currentColor`. Individual paths MAY explicitly use `fill="currentColor"` when that icon is designed as a filled variation. Do not apply `fill: currentColor` to every outline icon.
5. **Consistency:** no mixing line-weight conventions within the built-in catalog, no gradients, bitmap fallbacks, colored brand-specific glyphs, emoji stand-ins, or stylistically inconsistent third-party glyphs in the Eroxo default components.
6. **Asset modification:** avoid altering upstream Lucide geometry without a recorded design reason and modified-asset provenance. Editing a viewBox or shape to manufacture a fill variant is not a supported generic operation.

**Optical QA:** inspect icons at 16, 18, 20, 24 and 32px at 100%, 125% and 200% zoom in light and dark themes. At 16px, test recognizable shape and no anti-aliased clipping. Do not hardcode fractional CSS translations globally to repair one glyph.

## 4. Primitive and semantic size tokens

Use `rem` for glyph dimensions (nominal px at a 16px root). Sizes are visual glyph bounds, never hit-target dimensions.

| Public token | Value | Role |
| --- | --- | --- |
| `--erx-icon-size-sm` | `1rem` (16px) | Dense standalone glyph |
| `--erx-icon-size-md` | `1.25rem` (20px) | Default standalone glyph |
| `--erx-icon-size-lg` | `1.5rem` (24px) | Prominent standalone glyph |
| `--erx-icon-size-xl` | `2rem` (32px) | Empty-state / display icon |
| `--erx-icon-control-sm` | `1rem` (16px) | `sm` control glyph |
| `--erx-icon-control-md` | `1.125rem` (18px) | `md` control glyph |
| `--erx-icon-control-lg` | `1.25rem` (20px) | `lg` control glyph |
| `--erx-icon-size-default` | `var(--erx-icon-size-md)` | Generic wrapper default |
| `--erx-icon-stroke-width` | `2` | Universal default SVG stroke width |

A consuming application may override semantic variables within a theme scope or component slot. The renderer may apply `--erx-icon-current-size` as a **local implementation variable**, but this internal hook is not a new public design token. Public tokens MUST use the existing `--erx-` prefix and `erx.tokens` cascade layer.

## 5. Integration with spacing, density and typography

Eroxo's sizing contract is authoritative: controls are `sm` / `md` / `lg`, nominal minimum heights 32 / 40 / 48px; compact / standard / comfortable density determines the default control size. **An explicit size prop wins over inherited density.** Icons within a control MUST reflect the **effective control size**, not the app's standalone icon size.

| Effective control size | Control min height | Glyph | Icon-to-text gap |
| --- | ---: | ---: | ---: |
| sm | 32px | 16px | 6px |
| md | 40px | 18px | 8px |
| lg | 48px | 20px | 10px |

Do not conflate the SVG's CSS width/height with an interactive hit target. `IconButton` MUST use the full control min-size and accessibility requirements from ERX-DS-SPACE-001. Icon-only items MAY visually display a 16px glyph inside a 32px target. The icon slot MUST NOT shrink under flex pressure. Prefer CSS `gap` rather than baked margins in the SVG.

Typography: icons should align to the text line box, not the cap height via destructive offsets. Use `display: inline-flex; align-items: center` on button contents. Test mixed Geist, Hebrew, Chinese and fallback fonts; application or locale fallback can alter ascenders and baselines.

## 6. Public Icon component contract

The public `Icon` renders an outer `<svg>` and accepts **SVG shape children**, not an already completed nested `<svg>` element. SVG props SHOULD extend the native SolidJS SVG attribute type, with explicit design props. Proposed public shape:

```ts
import type { JSX } from 'solid-js';

type IconSize = 'sm' | 'md' | 'lg' | 'xl' | number;
interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size?: IconSize;
  strokeWidth?: number;
  label?: string;
  decorative?: boolean;
  directional?: boolean;
  children?: JSX.Element;
}
```

**Behavior contract:**

- Default: decorative. Set `aria-hidden="true"`, `focusable="false"`, no image role, no SVG title. Decorative icons within labeled buttons MUST NOT be separately announced.
- Meaningful standalone: `label` (or an explicit accessible naming mechanism) gives `role="img"`, an accessible name and no `aria-hidden`. `decorative={false}` with no name MUST warn in development and fail conformance tests.
- The component MUST merge a supplied `class` and `style` with internal styles without discarding consumer values. A numeric `size` sets square dimensions through a local variable or explicit width/height; `size="md"` resolves to a semantic token.
- `strokeWidth` is optional and overrides the default 2. The public SVG root's `stroke` and `fill` may be customized, but icon-specific filled shapes must remain intentionally controlled.
- `viewBox="0 0 24 24"` is the default and MAY be overridden for custom geometry.
- An icon MUST NOT manage keyboard events, focus, links, tooltip semantics or application state by itself.
- For an entire external SVG component (e.g. `@lucide/solid`), render the external component in the slot **directly**. Do not wrap an `<svg>` inside `<Icon>`.

**Do not expose** a string-based `name` registry, URL-based runtime icon loading, dynamic CommonJS imports, a universal `filled` prop, or a global radius/color variation property in v1. Named components are static imports.

## 7. Named exports and initial curated catalog

The v1 implementation SHOULD include about 30 essential glyphs, individually importable. For clarity, these names are **candidate public exports**, finalized at the UL-20 API review. Each maps to one upstream asset where an exact name is available; source names must be verified before the icon is considered vendored.

| Category | Proposed named exports |
| --- | --- |
| Actions | `CheckIcon`, `XIcon`, `PlusIcon`, `MinusIcon`, `CopyIcon`, `SearchIcon` |
| Disclosure and movement | `ChevronDownIcon`, `ChevronUpIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronsUpDownIcon`, `ArrowLeftIcon`, `ArrowRightIcon` |
| Menus and navigation | `MenuIcon`, `EllipsisIcon`, `EllipsisVerticalIcon`, `ExternalLinkIcon` |
| Feedback | `InfoIcon`, `CircleAlertIcon`, `TriangleAlertIcon`, `CircleCheckIcon`, `CircleXIcon` |
| Visibility / transfer | `EyeIcon`, `EyeOffIcon`, `UploadIcon`, `DownloadIcon` |
| Forms and utility | `CalendarIcon`, `LoaderCircleIcon`, `Trash2Icon`, `FileIcon` |

Each public named icon SHOULD be emitted as an independent ESM module, plus a side-effect-free named-export barrel. A `Button`-only import MUST NOT import the full catalog. No runtime name map is permitted in the default entrypoint. Consumers needing hundreds of glyphs can install official [`@lucide/solid`](https://lucide.dev/packages) for Solid 2 independently, or use their own SVG assets.

**Fill variants:** only explicitly reviewed icons MAY have a `*FilledIcon` export. The first release need not ship any. Maintain a separate approved list and visual tests per filled icon; do not automatically fill the outline paths. Filled status symbols must retain sufficient visual contrast and non-color meaning.

## 8. CSS architecture and customization

Token CSS loads in `@layer erx.tokens`; component defaults load in `@layer erx.components`. Components MAY expose optional local variables, but aliases MUST resolve at the consuming element so nested scopes are respected. Example:

```css
@layer erx.components {
  .erx-icon {
    inline-size: var(--erx-icon-current-size, var(--erx-icon-size-default));
    block-size: var(--erx-icon-current-size, var(--erx-icon-size-default));
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    fill: var(--erx-icon-current-fill, none);
    stroke: var(--erx-icon-current-color, currentColor);
    stroke-width: var(--erx-icon-current-stroke, var(--erx-icon-stroke-width));
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
```

A nested scope that changes a primitive icon size SHOULD also remap `--erx-icon-size-default` there if it wants that semantic default to follow the new primitive; inherited CSS aliases may otherwise resolve at their originating scope. The wrapper permits local `fill`/`stroke` overrides through current-value variables. The stylesheet MUST NOT apply a global `svg` rule, modify the document root's font, or create a global CSS reset. It MUST NOT hardcode Iris hex values: inherited color comes from ERX-DS-COLOR-001. Component selectors that customize `--erx-icon-current-size` MUST be local to the component and release those overrides when the component unmounts.

## 9. RTL and international behavior

Icons that indicate a **logical flow** (back/forward, next/previous, directional navigation) MAY mirror under RTL. Meaning-independent glyphs (search, check, calendar, warning, status, brand mark) MUST NOT mirror by default. A physical directional command ('pan right', map compass direction) also MUST NOT mirror just because the document direction is RTL.

- Mirroring is opt-in via `directional={true}` or a curated export-specific rule. Prefer `:dir(rtl)` on the actual SVG or its semantic context.
- Never mirror glyphs containing numbers, Latin or CJK text; never mirror an application logo.
- RTL transforms MUST NOT override motion transforms. Prefer a dedicated, nonanimated wrapper or careful transform composition if an icon participates in animation.
- `aria-label` comes from the application locale, not the English glyph name.
- International font fallback does not alter SVG paths; verify layout around mixed Hebrew, Latin and Chinese strings and at 200% zoom.

## 10. Accessibility and semantics

| Context | Normative outcome |
| --- | --- |
| Decorative icon next to visible button text | `aria-hidden="true"`; no extra accessible name |
| Meaningful standalone status symbol | `role="img"` + localized accessible name, or equivalent explicit accessible labeling |
| Icon-only button | Accessible name lives on the **button**, e.g. `<IconButton aria-label="Close">`; SVG decorative |
| Link with icon and text | Link name comes from visible text; SVG decorative |
| Error/success/warning | Icon supplements semantic message; color and icon alone are insufficient |
| Loading icon | Provide an accessible status or progress announcement; avoid repeating icon label |
| Hidden/disabled state | Inherit semantic state from parent; never make SVG an additional tab stop |
| Forced colors | Inherit system-visible foreground via `currentColor` and verify at OS high contrast |

Implementation SHOULD include development warnings for a meaningful icon without a name and for unlabeled `IconButton`. Automated axe checks and manual screen-reader checks are still necessary: an `aria-label` does not guarantee an accessible product composition. The 32/40/48px **button** target is distinct from the smaller graphic size. Focus behavior belongs to the control and is not drawn on the SVG itself.

## 11. Performance, SSR and packaging

1. **No runtime fetches.** Built-ins are compiled from static local SVG geometry; do not create `<use href="https://...">` network dependencies or icon font downloads.
2. **Tree shaking.** Each glyph is a named ESM export in its own module. No all-icons dictionary, runtime registry, glob import or side-effectful initializer in the consumer bundle.
3. **Solid SSR.** Icon components render identical SVG markup server-side and client-side. No generated IDs at render time, no browser globals during module evaluation and no hydration-time path mutation.
4. **Bundle checks.** Compare Button-only, Button+CheckIcon, and a 20-icon consumer. Compress JS and CSS separately, record baselines, and budget entries in UL-43.
5. **No external Lucide runtime in `eroxo-ui`.** The official Solid 2 package is a consumer option; it must not become a hidden transitive dependency.
6. **Assets.** If upstream SVGs are vendored into the source tree, ensure the published package has the required license/notice file. Do not publish temporary generated manifests containing unverified file provenance.

## 12. Asset provenance and licensing

**Official upstream:** https://github.com/lucide-icons/lucide. Lucide's project license is **ISC**, and its repository LICENSE also contains an MIT notice for listed icons derived from Feather. Do not describe the entire icon corpus as MIT or omit that additional attribution. The version-pinned source must be recorded per vendored asset.

Implementation kit's pinned upstream baseline: `c26ce5515667640ca2753e095ba319d225fc0d8d` (observed 23 Nov 2026). A maintainer MUST verify access to each corresponding SVG asset before releasing that glyph; if a renamed or removed icon cannot be fetched at this revision, record its actual upstream path and make an explicit reviewed change rather than silently substituting a different icon. `assets/lucide/LICENSE.txt` reproduces the upstream combined notices for vendor distribution.

For each asset, store: Eroxo export name, exact upstream SVG path, source commit, source SHA-256, whether modified, reviewer and review date. Modified SVGs must retain provenance and document the edits. No brand logos should be substituted from third-party icon packs without separate rights clearance.

## 13. Implementation layout and ownership

Recommended repository layout (adapt to the final UL-05 package architecture):

```text
src/
  components/Icon.tsx           # public generic outer SVG wrapper
  icons/generated/*.tsx         # independently imported curated glyphs
  icons/index.ts                # named ESM exports, no runtime registry
  styles/iconography.css       # token and base component layers

tokens/iconography.json        # semantic source of truth
scripts/generate-iconography.mjs
scripts/vendor-lucide.mjs      # maintainer-only fetch/generate step
scripts/validate-iconography.mjs
assets/lucide/LICENSE.txt
assets/lucide/provenance.json  # emitted after verified vendoring

test/iconography.tokens.test.ts
test/iconography.ssr.test.tsx
test/fixtures/iconography.html
```

In the reference ZIP, the provenance file may be a **manifest of intended sources** rather than verified downloads; verify SHA-256 only after assets are actually fetched. The vendor step MUST run at maintenance time, not in a consuming application's installation or at runtime. The project should publish static compiled SVG-based components.

## 14. Reference code — generic Icon and usage

```tsx
import { Icon, CheckIcon, IconButton } from 'eroxo-ui';

// Generic geometry supplied by the consumer:
<Icon size="lg" label="Verified account">
  <circle cx="12" cy="12" r="9" />
  <path d="m8 12 3 3 5-6" />
</Icon>

// Decorative built-in icon alongside visible label:
<button type="button"><CheckIcon /> Save</button>

// The button owns its accessible name:
<IconButton aria-label="Close dialog"><XIcon /></IconButton>

// An external complete SVG component should not be nested inside <Icon>:
// import { Search } from '@lucide/solid';
// <Search size={20} aria-hidden="true" />
```

The shown `IconButton` and icon exports are proposed public APIs to be implemented and verified. The code bundled in the ZIP is a reference starting point; it is not a verified production implementation of UL-20.

## 15. Verification and acceptance criteria

| Test ID | Requirement | Gate |
| --- | --- | --- |
| ICON-01 | JSON token schema, uniqueness, expected `rem` values and deterministic CSS output | Unit, CI |
| ICON-02 | No collision with Color/Type/Space/Shape/Depth/Motion public CSS tokens | Unit, CI |
| ICON-03 | SVGs have valid 24×24 viewBox, 2-unit strokes, rounded caps/joins, allowed node types | Asset validator |
| ICON-04 | Every vendored icon maps to a pinned upstream path and recorded SHA-256, notices shipped | Asset / license gate |
| ICON-05 | Decorative icons omitted from accessibility tree; standalone labeled icon exposed once | Browser/AT |
| ICON-06 | Unlabeled IconButton raises dev warning and fails accessibility test | Component integration |
| ICON-07 | Sizes 16/18/20/24/32; effective size overrides density; no clipping at zoom | Browser / screenshot |
| ICON-08 | Light/dark/custom theme and forced-colors inherit correct visible foreground | Browser |
| ICON-09 | RTL mirror only explicitly marked logical-direction glyphs | Browser |
| ICON-10 | SSR renders same SVG as hydration; no runtime fetch or globals on import | SSR/client fixture |
| ICON-11 | Individual ESM import tree-shakes; no catalog forced into Button-only bundle | Build / bundle |
| ICON-12 | Optional filled icon variants are reviewed and individually tested | Visual QA |
| ICON-13 | `class` / `style` / `strokeWidth` / size override and consumer custom viewBox work | Unit + browser |
| ICON-14 | Decorative + international/localized label cases manually tested | Manual AT |

**Browser matrix:** Chromium, Firefox and WebKit, light/dark/custom, forced colors where available, 200% zoom, Hebrew RTL, Chinese mixed-script compositions. Record real results and failures; no claims of WCAG conformance or browser completion until suites pass.

## 16. Release integration checklist

- [ ] Commit `tokens/iconography.json`; regenerate `src/styles/iconography.css` deterministically.
- [ ] Confirm package naming/export conventions with UL-05/UL-06 and `Icon`/`IconButton` in UL-20.
- [ ] Verify and vendor the selected Lucide assets from the pinned revision; review file changes.
- [ ] Ship combined Lucide ISC + Feather-derived MIT notices and include attribution in package `NOTICE`.
- [ ] Complete tests ICON-01 through ICON-14 and record evidence.
- [ ] Publish per-icon entrypoints only after consumer package export and bundle verification.
- [ ] Document custom SVG and external `@lucide/solid` integration; no mandatory runtime dependency.
- [ ] Record size budget, localization/accessibility examples and migration rules before `0.1.0` release.

## 17. References and governance

- Lucide project: https://github.com/lucide-icons/lucide
- Lucide LICENSE: https://github.com/lucide-icons/lucide/blob/main/LICENSE
- Official Lucide packages: https://lucide.dev/packages
- SVG accessibility conventions: https://design-system.w3.org/styles/svg-icons.html
- Eroxo product charter: `docs/ul-01-charter.md`
- Eroxo roadmap: `docs/ui-library-roadmap.md` (UL-05, UL-06, UL-09, UL-20, UL-43)

Changes to icon visual rules, public export names, token names, accessibility defaults, or the source asset list require a recorded design review, compatibility assessment and semver-aware release note. Changes to the upstream Lucide revision must not silently change the rendering of existing public icon exports.
