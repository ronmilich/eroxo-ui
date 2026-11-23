# Eroxo Iris — Typography System Specification

**Specification ID:** ERX-DS-TYPE-001  
**Version:** 0.1.0  
**Date:** 23 November 2026  
**Status:** Design decisions finalized; implementation and browser conformance pending  
**Maintainer:** Eroxo UI  
**Applies to:** SolidJS 2 / TypeScript, default light/dark/custom themes, application SSR, ordinary CSS with `--erx-` variables.

> **Normative scope.** This is the typography source-of-truth for the initial Eroxo design system. It complements [ERX-DS-COLOR-001](eroxo-iris-color-spec.md). It specifies typography only; it does not approve final control sizes, spacing, elevation, motion, or icon design. All MUST/SHOULD statements are implementation requirements unless explicitly called *optional*.

## 1. Executive decisions

1. **Visual identity:** Geist Sans is Eroxo's preferred UI face; Geist Mono is used for code, technical IDs, and optional numerical tables. Typography feels modern, precise, slightly futuristic, but remains neutral enough for business software.
2. **Opt-in font distribution:** Eroxo MUST NOT bundle Geist, inject a remote stylesheet, trigger a font download, require a font package, or modify an application's document/body font. Consumers may self-host or otherwise load Geist. If absent, components render using platform fallback fonts.
3. **Font ownership:** Eroxo components MUST consume `--erx-font-sans` and `--erx-font-mono` through semantic aliases. Consumer overrides and nested theme scopes MUST work without recompiling components.
4. **Semantic density:** UI text defaults to 14px equivalent (`0.875rem`); reading text defaults to 16px (`1rem`). Density changes spacing/control geometry by default, **not global font sizes**.
5. **Hierarchy:** Balanced headings: 20, 24, 30, and 32/36px; display 40/48px. Weights 400/500/600/700. No ultra-light text and no blanket uppercase treatments.
6. **Tracking:** The baseline is `normal`. Slightly negative tracking is **opt-in only for known Latin headings/display**; positive overline tracking is likewise opt-in. No universal negative letter spacing on international text.
7. **International:** No additional script fonts are bundled. Browser/system fallback is the default; applications can override fonts on language scopes. Respect HTML `lang`, `dir`, bidirectional isolation and different glyph metrics.
8. **Accessibility:** WCAG 2.2 AA target; text must survive zoom, text spacing overrides, translation expansion and missing fonts with no loss of functionality.
9. **Theme independence:** The same typography tokens work in light, dark and custom color themes. Colors come from `--erx-color-*`; typography MUST NOT hardcode colors.
10. **Packaging:** Public CSS variables use `--erx-`; source token JSON generates CSS. No runtime font measurement or CSS-in-JS is required.

## 2. Public token architecture

### 2.1 Three layers

| Layer | Purpose | Example | Public stability |
| --- | --- | --- | --- |
| Font primitives | Font stacks, weights, tracking constants | `--erx-font-sans`, `--erx-font-weight-semibold` | Public |
| Semantic typography | Named presentation roles with separate CSS properties | `--erx-type-ui-size`, `--erx-type-heading-lg-line-height` | Public |
| Component styles | Native CSS properties use semantic tokens; exceptional documented local alias allowed | `font-size: var(--erx-type-ui-size)` | Components obey public role contracts |

Token source of truth: `tokens/typography.json` (provided as `eroxo-iris.typography.tokens.json`). Generated output: `src/styles/typography.css` (reference file provided). Keep the `erx.tokens` cascade layer aligned with the existing color CSS. Do not manually diverge generated files.

### 2.2 Naming grammar

`--erx-font-{sans|mono}`; `--erx-font-weight-{regular|medium|semibold|bold}`; `--erx-tracking-{default|heading-latin|display-latin|overline-latin}`; `--erx-type-{semantic-role}-{size|line-height|weight|tracking}` and optional `--erx-type-{semantic-role}-family` (used as a fallback at the component site, not predeclared at root).

Each role exposes **four generated style properties** (size, line height, weight, tracking) and **one optional, intentionally undefined family override variable** (`--erx-type-{role}-family`). This prevents eager resolution of `var(--erx-font-sans)` at `:root` from defeating font overrides in nested scopes. Components MUST use `font-family: var(--erx-type-ui-family, var(--erx-font-sans))` (or Mono for code). No opaque composite `font` shorthand token is required. Components MUST use longhand `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, preserving application adjustments.

### 2.3 Root and nested scope inheritance

Typography defaults live on `:root` inside `@layer erx.tokens`. **Family aliases are not predeclared on `:root`:** their optional override is evaluated at the component's own font-family declaration, ensuring the nearest scoped Sans/Mono stack is used. A theme scope (`[data-erx-theme]` or a developer-owned wrapper) may redefine any `--erx-font-*` or `--erx-type-*` property. Descendants inherit the properties by normal CSS rules. Avoid resetting typography tokens on every nested theme scope: it would otherwise wipe out consumer overrides. The colors' light/dark overrides remain independent.

**Important responsive implementation:** the generated reference CSS places responsive defaults on `:root`. A nested override of the same semantic size takes precedence through inheritance at every width. If a consumer needs a nested responsive override, it MUST add its own media rule on that scope.

## 3. Typeface strategy and actual font loading

### 3.1 Default stacks (approved)

```css
:root {
  --erx-font-sans: "Geist", "Geist Sans", system-ui,
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --erx-font-mono: "Geist Mono", ui-monospace,
    "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
}
```

Both names are listed in the sans stack to tolerate the naming of different app-owned Geist distributions. A stack entry does **not** download or install the font. If a consumer loads Geist with another CSS family name, they MUST override the token accordingly.

### 3.2 Consumer-managed optional installation

A consumer may obtain font assets from the [official Geist source](https://github.com/vercel/geist-font) and host them at application-owned URLs, with the appropriate OFL notices. Example **application CSS only** (replace the placeholder URL with the actual consumer-managed filename):

```css
/* Consumer app stylesheet; NOT shipped in eroxo-ui */
@font-face {
  font-family: "Geist";
  src: url("/fonts/Geist-variable.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
@font-face {
  font-family: "Geist Mono";
  src: url("/fonts/GeistMono-variable.woff2") format("woff2");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
```

**Note:** These filenames are illustrative, not guaranteed release filenames. Use the actual assets/declared font family from the chosen Geist distribution; test the file and `@font-face` range in the app. A simpler external import is also an app decision, but Eroxo docs SHOULD recommend self-hosting when practical. Geist is published under the SIL Open Font License 1.1; consumers remain responsible for font distribution notices.

**No built-in font network dependency:** package CSS MUST contain no `@font-face`, `@import` to a font service, `url()` referencing font binaries, or JavaScript injection. No CLS promises are made when consumers choose `font-display: swap`: fallback/loaded metrics can differ. Avoid compensating with unmeasured `size-adjust` values.

### 3.3 Feature and weight rules

- 400 regular, 500 medium, 600 semibold, 700 bold. Do not require any weight outside this set for baseline components.
- Labels/buttons normally use 500. Headings normally use 600. Body/inputs normally use 400. Use 700 only for genuinely strong emphasis, not for every heading.
- Default font kerning remains browser-normal; do not globally force discretionary ligatures. For code, test ambiguous glyphs and spacing, and allow consumer `font-variant-ligatures: none` if their coding workflows require it.
- Numeric tables use `font-variant-numeric: tabular-nums` **on numeric cells/columns**, not on all prose. Optional monospace for columns or identifiers; the default data role stays Sans.
- Fonts with insufficient glyph coverage MUST fall back without broken characters; Eroxo does not promise a fixed glyph metric across platforms.

## 4. Frozen semantic typography roles

Base assumption for the px equivalents: browser root font size = 16px. **The CSS MUST use rem, not fixed px, for semantic font size and line-height.** These are design equivalents, not root-size overrides.

| Role | Size / line (16px root) | Weight | Font | Typical usage |
| --- | --- | --- | --- | --- |
| `caption` | 12 / 16 | 400 | Sans | Secondary metadata, timestamps |
| `overline` | 12 / 16 | 600 | Sans | Optional Latin section-eyebrow |
| `ui` | 14 / 20 | 400 | Sans | Menu/list/control content |
| `ui-strong` | 14 / 20 | 500 | Sans | Buttons, prominent action labels |
| `label` | 14 / 20 | 500 | Sans | Form labels, navigation |
| `body-sm` | 14 / 22 | 400 | Sans | Supporting descriptions |
| `body` | 16 / 24 | 400 | Sans | Normal paragraphs and reading text |
| `body-lg` | 18 / 28 | 400 | Sans | Introductory prose |
| `badge` | 12 / 16 | 500 | Sans | Badge and status chip text |
| `table` | 14 / 20 | 400 | Sans | Data-table cells |
| `table-header` | 14 / 20 | 600 | Sans | Column headings |
| `data` | 14 / 20 | 500 | Sans* | Quantities, prices, metrics |
| `code-inline` | 13 / 20 | 500 | Mono | Inline code, technical IDs |
| `code-block` | 14 / 22 | 400 | Mono | Code samples |
| `heading-sm` | 20 / 28 | 600 | Sans | Component/card heading |
| `heading-md` | 24 / 32 | 600 | Sans | Section title |
| `heading-lg` | 30 / 38 | 600 | Sans | Page title |
| `heading-xl` | 32 / 40 mobile; 36 / 44 desktop | 600 | Sans | Prominent landing title |
| `display` | 40 / 48 mobile; 48 / 56 desktop | 600 | Sans | Hero / showcase headline |

*Data font can switch to Mono via `--erx-type-data-family: var(--erx-font-mono)`. `--erx-type-data-numeric: tabular-nums` is an opt-in style hook for numeric containers.

Avoid using 12px captions as the sole place for instructions or form errors. Form errors, validation help, and essential messages SHOULD use at least the 14px UI/body-small role. Very long-form reading may opt into app-level editorial styling; the library does not dictate content typography outside components.

## 5. Responsive typography and density

### 5.1 Breakpoint

**Only two semantic roles scale at 48rem (768px at a 16px root):**

| Role | Below 48rem | 48rem and above | Rule |
| --- | --- | --- | --- |
| `heading-xl` | 32px / 40px | 36px / 44px | Large title only |
| `display` | 40px / 48px | 48px / 56px | Hero only |

Other roles remain the same across viewport widths. No viewport-based `vw` typography in 1.0; no forced global text shrinking on phones. Screen width is not a proxy for accessibility needs. Use `@media (min-width: 48rem)` with `rem` tokens.

### 5.2 Density semantics

- `compact` / `standard` / `comfortable` are **geometry and spacing** options; do not automatically scale every font when a density preset changes.
- UI control text remains 14/20 across densities unless a specific component documents another semantic role.
- Comfortable reading content remains body 16/24 independent of surrounding input/control density.
- Avoid tiny labels in dense tables; prefer truncation with accessible disclosure, column wrapping, or horizontal table scroll where appropriate.
- Control min-height, padding, and reflow rules are owned by the later spacing/size spec, and MUST account for multilingual glyph height and text-spacing overrides.

## 6. Tracking, case and numeric settings

| Token | Value | Policy |
| --- | --- | --- |
| `--erx-tracking-default` | `normal` | All scripts, default for every role |
| `--erx-tracking-heading-latin` | `-0.0125em` | Explicitly chosen for known Latin heading text |
| `--erx-tracking-display-latin` | `-0.025em` | Explicitly chosen for known Latin display text |
| `--erx-tracking-overline-latin` | `0.04em` | Explicitly chosen for suitable Latin uppercase overline |

The roles themselves emit `tracking: normal`. Components MUST NOT automatically apply negative tracking based solely on font size, because mixed-script headlines may contain Hebrew, Arabic or CJK. Eroxo should provide the tokens and document an app-side opt-in (`letter-spacing: var(--erx-tracking-heading-latin)` on English headings). The same applies to CSS `text-transform: uppercase`: it is NOT a universal overline behavior. Use script-appropriate original casing and punctuation. Do not override writer-intended letter spacing on localized content.

For data, the library defaults to proportional Sans with tabular numerals available: `font-variant-numeric: tabular-nums`. Align numerical columns using logical text alignment (`text-align: end`) and `dir` semantics. Do not rely on monospace alone for layout, or force Western digit shaping for Arabic/Persian content.

## 7. Internationalization and script-aware composition

### 7.1 Minimum supported behavior

- **Language metadata:** host applications SHOULD set the document's `lang` and `dir` attributes; Eroxo MUST preserve forwarded `lang`, `dir` and native HTML attributes on text-bearing parts.
- **Fallback policy:** `system-ui` handles available scripts by platform; missing glyphs fall through. Eroxo MUST NOT download CJK/Hebrew/Arabic fonts or assume Geist alone supports them.
- **Consumer overrides:** developer may set `--erx-font-sans` on any scope or `[lang]` subtree, including inside nested `data-erx-theme` containers.
- **BiDi:** prefer logical CSS properties, `dir="auto"` for unknown-direction user-generated text, and `<bdi>` (or equivalent isolation) for mixed-direction names/IDs where appropriate. Never manually reverse strings or encode direction through typography tokens.
- **Line metrics:** scripts vary in accent, descender and glyph heights. Components MUST allow line boxes, labels, chips, dialogs and input text to grow/reflow without clipping.
- **Chinese/Japanese/Korean:** test CJK full/half-width punctuation, input-method composition, numeric/mixed Latin text, and line wrapping; do not add letter spacing or Latin uppercase transformations.
- **Arabic/Hebrew:** test diacritics, RTL punctuation, digits, bidi markers and logical alignment; do not create synthetic italic/bold restrictions globally.

### 7.2 Recommended app-provided font stacks (examples, not shipped presets)

| Script / locale | Consumer example |
| --- | --- |
| Hebrew `he` | `"Noto Sans Hebrew", "Arial", system-ui, sans-serif` |
| Simplified Chinese `zh-Hans` / `zh-CN` | `"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif` |
| Traditional Chinese `zh-Hant` / `zh-TW` | `"PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", system-ui, sans-serif` |
| Japanese `ja` | `"Hiragino Sans", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif` |
| Korean `ko` | `"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif` |
| Arabic `ar` | `"Noto Sans Arabic", "Geeza Pro", "Tahoma", system-ui, sans-serif` |

These families may or may not be installed on a particular OS. They are *suggested fallback orders*, not a guaranteed rendering solution; applications serving a particular language at scale should test native and chosen deployed fonts. Avoid trying to ship all of these families in a default Eroxo bundle.

**Scoped consumer example:**

```css
/* App CSS: choose font families for a particular localized region. */
[data-language-region="he"] {
  --erx-font-sans: "Noto Sans Hebrew", Arial, system-ui, sans-serif;
}
[data-language-region="zh-Hans"] {
  --erx-font-sans: "PingFang SC", "Microsoft YaHei",
    "Noto Sans CJK SC", system-ui, sans-serif;
}
```

**Inline mixed-script recommendation:** keep natural fallback per glyph and preserve `lang` on spans. If a localized region overrides the entire Sans token, the app is choosing its local text treatment; it may need a separate Latin identifier subspan to restore Geist.

## 8. Component application contract

| Component class | Default role | Exceptions/notes |
| --- | --- | --- |
| Button / IconButton text | `ui-strong` | IconButton itself requires accessible name; text not visually required |
| TextField / Textarea input | `ui` | Longer textarea content MAY use `body`; ensure zoom-safe input height |
| Label / Help / Error | `label` / `body-sm` | Error and help text cannot rely on color alone |
| Checkbox / Radio / Switch label | `ui` | Label can wrap; click/touch target owned by sizing spec |
| Tabs / Dropdown / Select / Combobox | `ui` | Selected item remains readable with focus and zoom |
| Tooltip | `ui` or `body-sm` | Avoid essential multi-paragraph instructions in a tooltip |
| Dialog title / description | `heading-sm` / `body` | Uses semantic heading element; wrap on narrow screens |
| Alert title / body | `ui-strong` / `body-sm` | Status color independent of font |
| Badge / Chip / Tag | `badge` | Essential statuses must include readable text/icon |
| Table header / cell | `table-header` / `table` | Numeric column may use `data` and tabular numerals |
| Toast | `ui-strong` / `body-sm` | Content must accommodate translation expansion |
| Code example | `code-block` | Preserve whitespace; scroll code block, not entire page |

Use semantic markup (h1-h6, label, button, etc.) independently from visual type roles. A heading's appearance MUST NOT determine its document heading level. The library MUST NOT set a universal `font-family` on `body`, `html` or generic content nodes outside component boundaries.

### 8.1 SolidJS component example

```tsx
// Sketch of internal styles for a styled Button. Not a complete Button implementation.
import type { JSX } from 'solid-js';
import './button.css';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;
export function Button(props: ButtonProps) {
  return <button {...props} class={`erx-button ${props.class ?? ''}`} />;
}
```

```css
@layer erx.components {
  .erx-button {
    font-family: var(--erx-type-ui-strong-family, var(--erx-font-sans));
    font-size: var(--erx-type-ui-strong-size);
    line-height: var(--erx-type-ui-strong-line-height);
    font-weight: var(--erx-type-ui-strong-weight);
    letter-spacing: var(--erx-type-ui-strong-tracking);
    color: var(--erx-color-on-primary);
    background: var(--erx-color-primary);
    /* Geometry, focus ring, state styling are separate contracts. */
  }
}
```

**Engineering note:** the example illustrates typography application, not a final production-ready Button. In actual components use `splitProps` and merge forwarded class/style/events according to UL-06, rather than blindly overwriting them. Class names above are illustrative pending the CSS public-selector ADR.

## 9. Accessibility and readability contract

### 9.1 WCAG 2.2 AA targets

- **1.4.3 Contrast:** ordinary text 4.5:1 against its actual background; qualifying large text 3:1. Do not assume 14px or 16px UI text qualifies as large text; use the color spec for audited foreground/background pairs.
- **1.4.4 Resize Text:** at 200% text zoom, no lost label, clipped descender, overlapping field, inaccessible error message, or hidden critical action.
- **1.4.10 Reflow:** at 320 CSS px equivalent (commonly 400% zoom on a 1280px desktop), allow reflow without unnecessary two-dimensional scrolling except where content itself requires it (e.g., tabular data/code).
- **1.4.12 Text Spacing:** when user CSS increases line-height to 1.5× font size, paragraph spacing to 2×, letter spacing to 0.12em, and word spacing to 0.16em, component text is still readable and usable. These are **override tests**, not minimum values that Eroxo must always apply.
- **1.3.1 / 3.1.1 / 3.1.2:** semantic structure and language metadata are supplied or preserved as appropriate; visual size alone cannot establish semantics.

### 9.2 Implementation rules

- Use rem font sizes and line-heights; do not set `html { font-size: 16px }` or disable browser zoom. Do not use CSS transforms to simulate a smaller font.
- Label/control text MUST reflow; avoid fixed pixel heights for content-bearing interactive elements unless enough space and tested overflow behaviors exist.
- Use `min-height` rather than inflexible `height` for controls when practical; allow multi-line labels or a documented accessible disclosure strategy.
- Avoid truncating meaningful errors or instructions. If truncation is necessary in tables/navigation, expose the full value by an accessible means.
- Do not use opacity to weaken essential text below contrast; status color semantics do not replace text/icon indicators.
- Test alternate language length growth (+50% and +100%), user override fonts with wider metrics, and dynamic-content updates.
- Honor forced-colors and high-contrast OS modes; typography should remain legible when authored colors change.
- Avoid non-text UI elements that contain text rasterized into images; actual text is preferable.

## 10. Reference CSS integration

`eroxo-iris.typography.css` is a self-contained generated token stylesheet. Use it **alongside** color CSS, not as a replacement. It never sets a global font on `html`/`body` and never defines `@font-face`.

```css
/* App entry: after Eroxo package publishes the stylesheet exports */
@import "eroxo-ui/colors.css";
@import "eroxo-ui/typography.css";

/* An explicit app-level override; plain, unlayered CSS wins. */
.my-brand-scope {
  --erx-font-sans: "MyBrandSans", system-ui, sans-serif;
  --erx-type-body-size: 1.0625rem;
}
```

The export paths above are **target release exports**, not present in the current `eroxo-ui` starter package. When adding CSS to the package, revisit `package.json` `sideEffects: false`: ensure CSS imports are not removed by bundlers (for example, use `"sideEffects": ["**/*.css"]` after a consumer-fixture test). Include CSS exports and verify bundler and SSR usage before documentation presents these imports as available.

**Recommended repository paths:**

```text
/docs/design/eroxo-iris-typography-spec.md
/tokens/typography.json
/src/styles/typography.css
/test/typography.tokens.test.ts
/test/browser/typography.spec.ts
```

The paths and imports MUST be reviewed with UL-04/05/06 (CSS technique, exports, API naming) before being treated as public. Public semantic token names in this document are the proposed v0.1 baseline.

## 11. Automated tests and visual quality assurance

### 11.1 Unit/static tests (CI)

| Test ID | Required assertion |
| --- | --- |
| TYPE-001 | Every JSON role has family metadata; CSS generates size, line-height, weight and tracking; component applies an optional family override with fallback |
| TYPE-002 | Sizes/line-heights have `rem` units; no semantic `px`, `vw`, `vh` |
| TYPE-003 | Base UI=14/20; body=16/24; weights are 400, 500, 600, 700 |
| TYPE-004 | `@media (min-width: 48rem)` changes only heading-xl and display sizes/leading |
| TYPE-005 | CSS includes no `@font-face`, Google Fonts import, remote URL or font-file reference |
| TYPE-006 | CSS defines no `html/body` font override or root font-size |
| TYPE-007 | All generated CSS declarations match JSON; generator deterministic; scoped font-family fallback is not eagerly resolved at root |
| TYPE-008 | No accidental negative spacing on default international roles |
| TYPE-009 | CSS package import survives bundler build, CSS tree shaking and SSR; no network request for fonts |

### 11.2 Browser/interaction matrix

Run visual and functional scenarios in Chromium, Firefox and WebKit with fonts both **installed** and **not installed**, testing at least these cases. The kit includes a static language specimen at `test/fixtures/typography-languages.html` for the first smoke test:

| Scenario | Fixtures / checks |
| --- | --- |
| English/Latin | Button, Input, Card, Dialog, Heading, table cell |
| Hebrew/RTL | `lang="he" dir="rtl"`; mixed numeric ID, diacritics, long label |
| Chinese | Simplified and traditional headings, field labels, CJK wrapping and input composition |
| Japanese / Korean | Mixed full-width punctuation, composition, glyph clipping |
| Arabic | `lang="ar" dir="rtl"`, mixed Latin identifier, diacritics |
| Missing Geist | Verify system fallback and no broken layout / unexpected font requests |
| Custom font | Override Sans and Mono in nested theme; verify inherited components |
| Theme | Light/dark and nested custom scopes; typography metrics unchanged unless overridden |
| Responsive | Width 320, 375, 768, 1280px; compare heading tokens and reflow |
| Zoom | Browser text at 200%; page zoom at 400% / 320 CSS px equivalent |
| User text-spacing | Inject WCAG override CSS and assert no essential text clipped |
| Density | Compact, standard, comfortable; same font tokens by default |
| Localization expansion | +50%/+100% phrase expansion; accessible text reveal if ellipsized |
| SSR / hydration | Same initial font token semantics; no client-only style injection or mismatch |

**Visual screenshots:** capture a type specimen in light/dark and a representative component matrix (Button, Field, Card, Alert, Table, Dialog) in each browser. Do not promise identical glyph pixels across operating systems: compare stable layout constraints, wrapping, no clipping, and readable hierarchy. Store baseline snapshots per supported browser + OS or use scoped tolerance rules.

### 11.3 Conformance harness guidance

```ts
// Example test design; adapt to the browser runner chosen in UL-09.
// await page.emulateMedia({ colorScheme: 'dark' });
// await page.setViewportSize({ width: 320, height: 800 });
// expect(await label.evaluate(el => el.scrollHeight <= el.clientHeight))
//   .toBe(true); // only valid for elements expected not to overflow
// await expect(page.locator('[data-erx-test="sample"]')).toHaveScreenshot();
```

Do not apply `scrollHeight <= clientHeight` indiscriminately to editable textareas, code blocks or deliberate scroll containers; test the intended overflow contract instead. Browser screenshot testing does not replace real IME and screen-reader verification.

## 12. Versioning, ownership and change control

- **Spec baseline:** `ERX-DS-TYPE-001 @ 0.1.0`. Any token rename or removal is breaking; additions and changes to visual values may still be visually breaking and require release notes.
- **Frozen for this milestone:** type families, role naming, role sizes/leading/weights, responsive breakpoint, tracking policy and opt-in font distribution.
- **Open implementation constraints (not aesthetic indecision):** exact package CSS export/build, shared CSS layers, class/part naming and test harness are finalized by UL-04, UL-05, UL-06, UL-08/09. Do not claim implementation complete before consumer verification.
- **Role governance:** new semantic role only with at least two repeatable use cases; otherwise use an existing role and a scoped local override.
- **Color linkage:** text colors must resolve through `ERX-DS-COLOR-001`. `--erx-type-*` is never a color token.

## 13. Definition of Done

1. Spec + token JSON approved and checked into the repository; generated CSS matches source 1:1.
2. CSS has no font assets, imports, `@font-face`, font network side effects, root font-size reset or app-global font rules.
3. All listed semantic roles and both responsive overrides resolve correctly from a consumer app.
4. At least one component (Button) and one form element prove the role contract and consumer font overrides.
5. Real consumer fixtures verify available Geist, missing Geist, alternate app font, SSR and nested theme scopes.
6. Chromium/Firefox/WebKit pass critical RTL/CJK/Arabic/Latin, narrow viewport and zoom/spacing scenarios.
7. Accessibility evidence covers WCAG 2.2 AA typography-relevant requirements; remaining limitations recorded.
8. Package exports, CSS `sideEffects` behavior, and documentation are validated before published release.
9. A release note documents the v0.1.0 semantic tokens and customization contract.

## 14. References and licensing

- [Official Geist project and OFL 1.1 license](https://github.com/vercel/geist-font)
- [Vercel Geist installation and distribution guidance](https://vercel.com/font)
- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG: Understanding Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [WCAG: Understanding Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [MDN: CSS font synthesis and international scripts](https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis)
- Eroxo roadmap: `docs/ui-library-roadmap.md`, milestones UL-04, UL-05, UL-06, UL-12, UL-13, UL-18, UL-19, UL-20.

*End of normative specification.*
