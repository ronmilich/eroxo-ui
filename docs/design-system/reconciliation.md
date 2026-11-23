# Eroxo Iris specs · reconciliation record

Prepared on 23 November 2026. **Owner approval, 23 November 2026:** every resolution below (C1–C10, D1–D14) is approved, and the roadmap changes are applied. Under D1, this record is the written superseding decision that BEHAVIOR:28 asks for. The specs' v0.2.0 revision, on the same day, folds its resolutions in (see the last section). The `NAME:line` citations below refer to the v0.1.0 files, as of commit 9b48c99.

This record checks the nine Eroxo Iris specifications (all v0.1.0, dated 23 November 2026) against the decisions already recorded for UL-01 to UL-04 and TT-032, and against each other. The specs broadly agree with the approved direction. They also deliver most of UL-12 and UL-06 early and supply the content for several UL-05 decisions. It found 10 conflicts to fix in the specs and 14 decisions for the owner, and several files the specs describe are missing.

**References.** Spec names below stand for these files: BEHAVIOR `eroxo-iris-behavior-accessibility-spec.md`, COMPONENT `eroxo-iris-component-anatomy-api-spec.md`, DEPTH `eroxo-iris-elevation-depth-spec.md`, ICON `eroxo-iris-iconography-spec.md`, MOTION `eroxo-iris-motion-interactions-spec.md`, SHAPE `eroxo-iris-shape-borders-spec.md` and TYPE `eroxo-iris-typography-spec.md`, cited as `NAME:line`. COLOR (`eroxo-iris-color-spec.docx`) and SPACE (`eroxo-iris-spacing-sizing-spec.docx`) exist only as Word files, so they are cited by a quoted phrase you can search for.

## Where each spec fits

| Spec | ID | Status as written | Serves |
|---|---|---|---|
| Color | none stated (others cite ERX-DS-COLOR-001) | no Status line; its closing note says "the palette and rules are locked here as implementation inputs" | UL-12, UL-13 |
| Typography | ERX-DS-TYPE-001 | design decisions finalized | UL-12, UL-13 |
| Spacing and sizing | ERX-DS-SPACE-001 | design decisions finalized | UL-12, UL-13, UL-18 (density) |
| Shape and borders | ERX-DS-SHAPE-001 | design contract finalized | UL-12, UL-13 |
| Elevation and depth | ERX-DS-DEPTH-001 | design contract approved | UL-12, UL-13, UL-24 |
| Motion and interactions | ERX-DS-MOTION-001 | visual design contract approved | UL-12, UL-15, UL-25 |
| Iconography | ERX-DS-ICON-001 | design and API baseline approved | UL-05 (icons), UL-20 |
| Behavior and accessibility | ERX-DS-BEHAVIOR-001 | architecture design contract locked | UL-05 (behavior layer, native-first), UL-14–17, UL-24–26 |
| Component anatomy and API | ERX-DS-COMPONENT-001 | public API design contract approved | UL-06, UL-19 |

## What the specs confirm

- **Platform:** Solid 2 only. No Tailwind, no runtime CSS-in-JS, no motion library. No Kobalte, Ark or other behavior toolkit (BEHAVIOR:22, MOTION:27, SPACE "Style architecture").
- **Prefixes:** `--erx-` for custom properties and `data-erx-` for attributes. COMPONENT:139 forbids unprefixed `data-state` and `data-slot`.
- **CSS:** layers `erx.tokens` then `erx.components` (COMPONENT:141, DEPTH:192, MOTION:197, ICON:134). Components read public hooks with fallbacks, as in `var(--erx-button-radius, var(--erx-radius-control))` (SHAPE:173).
- **Dialog:** native `<dialog>` with `showModal()` and no redundant focus trap (BEHAVIOR:49). Outside-pointer dismissal runs in JavaScript; `closedby="closerequest"` only restates the native default for modal dialogs (BEHAVIOR:50).
- **Overlays:** the top layer replaces z-index (BEHAVIOR:52, DEPTH:154), `::backdrop` is themed in place (DEPTH:128), and tooltips can use `popover="manual"` (BEHAVIOR:51).
- **Presence:** reopening during an exit cancels the close (MOTION:151). Reduced motion completes at once (MOTION:166).
- **Fonts and accessibility:** no bundled fonts (TYPE:15). Dark mode is its own mapping. Contrast targets are 4.5:1 and 3:1. Forced colors are defined. The 32/40/48 px control sizes include a ≥44 px option. The focus outline is 2 px with a 2 px offset.
- **Density:** changes sizing only, never colours, type or radii (SHAPE:18, SPACE "Theme independence").
- **Icon licensing:** Lucide is vendored with per-asset provenance and is not a runtime dependency (ICON:31, :193).
- **Tokens:** every token referenced between specs resolves to its defining spec, spelled exactly, and shared hex values agree.

## Conflicts with recorded decisions

Each resolution is approved and folded into the v0.2.0 specs.

| # | Where | Conflict | Resolution |
|---|---|---|---|
| C1 | MOTION:30, :103, :110, :160, :243, :256; COLOR "`.erx-alert[data-tone="success"]`" | Unprefixed `data-state`, `data-side`, `data-tone` | Use `data-erx-state`, `data-erx-side` and `data-erx-tone`, and add `data-erx-side` and `data-erx-density` to COMPONENT's attribute table |
| C2 | COLOR "publish @layer erx.tokens, erx.base, erx.components, erx.utilities"; SHAPE:177; SPACE "Minimum viable generated CSS" | Extra layers, and the layer order declared once instead of in every sheet | The two approved layers, unless a UL-05 ADR adds one (COMPONENT:141), and every library stylesheet starts with `@layer erx.tokens, erx.components;` |
| C3 | COLOR "Component-local aliases: optional --erx-button-bg" | Public component variables declared on the component's own element, which stops values set on an ancestor | Read public hooks with fallbacks at the declaration site, as SHAPE:173 does, and keep internals in private `--_erx-*` variables, which no spec mentions yet |
| C4 | COLOR "@layer erx.base" with `::selection` | A global style on the consumer's whole app, against TYPE:219 and SHAPE:31 | Scope it to components or make it opt-in |
| C5 | BEHAVIOR:148, :262 | Scroll lock "MUST be reference counted"; a scroll-lock manager still to build | The approved CSS rule `html:has(.erx-dialog:modal) { overflow: hidden }`, which needs no counting. Keep BEHAVIOR:148's outcomes as tests: no unlock while another modal is open, scroll position kept, and no layout shift with classic scrollbars (still open from UL-04) |
| C6 | BEHAVIOR:99, :235, :262 | A Tab loop and "a complete modal trap" | Native containment, as approved in UL-04: past the last element, focus may reach the browser's own interface but never the page behind. Test that instead of a loop |
| C7 | DEPTH:134, :146–149, :156; BEHAVIOR:133, :140, :146, :221, :252; COMPONENT:47 | Portal parts, a fallback inert manager and z-index tokens for overlays outside the top layer | Top layer for overlays: UL-04 found portals and a z-index stack unnecessary there. Keep `--erx-z-base` and `--erx-z-sticky` for in-page layers. Drop the fallback tokens, portal parts and fallback inert rules unless the UL-05 native-first decision names an overlay that can't use the top layer |
| C8 | MOTION:154–155 | "A fallback deadline or WAAPI tracking" makes the deadline optional, though :155 prefers one; infinite animations aren't excluded | Presence ignores infinite animations and always caps the wait at the animation's length, as approved in UL-04 |
| C9 | COMPONENT:172, SHAPE:186, TYPE:249 | `splitProps` and `mergeProps` are Solid 1 names; Solid 2.0.3 exports `omit` and `merge`. SHAPE:186 also imports `JSX` from `solid-js`; the spike imports it from `@solidjs/web` | Use the Solid 2 APIs and import paths |
| C10 | ICON:63–65 | `--erx-icon-control-*` repeats SPACE's `--erx-control-icon-size-*` at the same 16/18/20 px | Use the SPACE tokens, in line with ICON:34, which forbids redefining other specs' primitives |

## Owner decisions

Each was approved as recommended.

| # | Decision | What the specs say | Resolution |
|---|---|---|---|
| D1 | How spec rules are superseded | BEHAVIOR:28 asks for a written superseding decision for user-visible changes; COMPONENT:28 says the API must match accepted ADRs | Approving this record supersedes the spec rules in C1–C10. The specs then get "superseded by" notes and refreshed traceability: UL-04 done (COMPONENT:280), UL-17 split (BEHAVIOR:251), utilities in UL-14 rather than UL-15 (COMPONENT:284), and positioning by the in-house engine, with CSS anchor positioning only as a later fast path (BEHAVIOR:254) |
| D2 | Default font | TYPE:55 puts Geist first; UL-12 says system stacks | System-only default, with Geist documented as an app-level override. As written, any machine with Geist installed renders it |
| D3 | Variant names and mechanism | COMPONENT:53 `solid/soft/outline/ghost/text`; SHAPE:204 `solid/outline/ghost` via `data-erx-variant`; COLOR `primary/secondary/ghost` via `.erx-button--primary` | COMPONENT's vocabulary, applied as `data-erx-variant`, with colour intent through `tone`; settle in UL-06 |
| D4 | Public part selectors | UL-04 approved stable class names; COMPONENT:125 requires `data-erx-slot` on every part; TYPE:249 calls its class names illustrative pending a public-selector ADR | Classes as approved: `erx-<component>` on the root and `erx-<component>__<part>` on parts. Keep `data-erx-slot` only if UL-06 finds a use classes don't cover, since both would be versioned API |
| D5 | Token tiers and naming | `--erx-<component>-<property>` is a density token in SPACE (`--erx-card-padding`) but an override hook in COLOR and SHAPE (`--erx-button-bg`, `--erx-button-radius`). SHAPE puts primitives (`sm`, `md`) and roles (`field`, `tooltip`) under one `--erx-radius-*` namespace. 92 of 258 semantic colour values aren't in the primitive palette. 84 of the 332 token names the specs spell out are named after a component, against UL-12's "limited set of component tokens" | A naming grammar that shows the tier, settled in UL-06 and UL-12. Decide whether semantic tokens may hold literal values, and cap the component tier |
| D6 | Theme scopes | `data-erx-theme` accepts only `light` and `dark` (COLOR "Theming selector"). Custom-theme examples use three selectors: COLOR `[data-brand]`, TYPE:282 `.my-brand-scope`, SHAPE:164 `.brand-panel`. Aliases resolve differently per scope (TYPE:45, ICON:134, DEPTH:187) | UL-18 defines the allowed values, including custom names and `system`, and the token generator redeclares aliases on every Eroxo scope selector |
| D7 | Icon source and sizes | ICON:17 picks a vendored Lucide subset; UL-05 planned internal glyphs. Standalone `md` is 20 px (ICON:60), against 18 px inside an `md` control (ICON:64) | Accept Lucide (ISC) in the UL-05 icons decision, with NOTICE entries. Inside a control, `Icon` defaults to the control's icon size |
| D8 | Borders | Fields: SHAPE:99 and :138 use `border-interactive` and `--erx-color-error`; COLOR defines `--erx-color-input-border*`. Solid button: COLOR `1px solid transparent`, SHAPE:95 none. Tooltip: COLOR has `--erx-color-tooltip-border`, SHAPE:105 none | SHAPE adopts COLOR's `input-*` roles and the transparent border, which keeps solid and outline buttons the same size and shows the edge in forced-colors mode. The designer settles the tooltip border |
| D9 | Which Dialog part renders `<dialog>` | COMPONENT:103's example gives `Dialog.Content` an `HTMLDivElement` ref | The part rendering `<dialog>` forwards `HTMLDialogElement` and carries the `erx-dialog` class that the scroll-lock rule targets |
| D10 | Lifecycle API | BEHAVIOR:198 prefers `onSettled`; COMPONENT:175 and UL-06's scope require `onCleanup` | `onSettled` for DOM-dependent setup and teardown, `onCleanup` for owner disposal |
| D11 | Presence phases and entry | COMPONENT:131 has three phases, BEHAVIOR:192 four; MOTION:302 defers `@starting-style` | CSS keyframes for entry in v1, as the spike did, with `@starting-style` revisited later. Decide whether `entering` is tracked at all |
| D12 | Missing tokens | DEPTH:68 hard-codes Iris 600 (`#6B5CE7`) at 14% alpha for the glow. MOTION:73's 90 ms tooltip exit isn't on the duration scale (0/120/180/250/350 ms). No token owns the tooltip hover delay | A glow colour token in COLOR, a 90 ms step on the scale or a 120 ms exit, and a delay token for UL-27 Tooltip |
| D13 | Screen readers | BEHAVIOR:238 asks for NVDA, VoiceOver and TalkBack checks on each public component | Keep UL-04's choice, VoiceOver with Safari and NVDA from UL-09, and settle TalkBack in UL-05's support matrix |
| D14 | Close vetoes | BEHAVIOR:215 keeps the dialog open and modal when the consumer vetoes a close | Define the veto event in COMPONENT and treat it as best effort, because browsers may not let a repeated Escape be prevented; verify in UL-25 |

## Gaps

- **Missing companion files.** The specs describe files that aren't in the repository and weren't found on this Mac:
  - token JSON: COLOR's `iris.tokens.json` / `eroxo-iris.tokens.json`, `tokens/typography.json`, `tokens/spacing.json`, `tokens/shape.json`, `tokens/depth.json`, `tokens/motion.json`, `tokens/iconography.json`;
  - reference CSS;
  - the behavior spec's companion ZIP (BEHAVIOR:260);
  - the vendored Lucide assets and provenance (ICON:193, :209–213);
  - kit scripts and fixtures.

  Add them, or remove the "provided" claims and generate the JSON from the spec tables in UL-13. Any reference code from a ZIP needs recorded provenance under the clean-room rules.
- **Word-only specs.** Color and spacing exist only as `.docx`. COLOR has no ID or Status line, and TYPE:10 links to a missing `eroxo-iris-color-spec.md`. Add Markdown versions and give COLOR a header.
- **Paths.** The specs expect `docs/design/` (for example DEPTH:276); the folder is `docs/design-system/`. COLOR puts tokens in `src/styles/tokens/`, the others in `tokens/`. Fix the paths, and pick one tokens folder and one generator in UL-13, whose scope already asks for a single source of truth.
- **Missing rules:**
  - a Tooltip profile in BEHAVIOR, which has Dialog and AlertDialog profiles (§7) but none for tooltips. It should cover the hover delay, keyboard focus, touch, and Escape inside a dialog;
  - whether `::backdrop` fades, and whether the dialog scales on exit. MOTION:112 gives only the entry scale (0.985 → 1);
  - what happens when a custom theme omits a token (on UL-13's scope, not in the specs);
  - token names for SPACE's density roles: only 5 of 17 are spelled out, and "Form vertical gap" becomes `--erx-form-gap`, so the rest can't be derived;
  - hydratable compiled builds and the `node` export-condition caveat (COMPONENT:256);
  - the CSS scroll-lock rule, which appears in no spec;
  - a design source such as Figma for the light and dark themes, required by UL-12.

## Roadmap consequences

Approved with the decisions above and applied to the [roadmap](../ui-library-roadmap.md) on 23 November 2026; its status line links here.

- **UL-05 (ADRs):** its inputs are the UL-04 report and this record, and BEHAVIOR-001 supplies the behavior-layer and native-first content. The icons item now names the Lucide subset (D7); the motion decision covers C8 and D11. The owner subsequently authorized [UL-05](../adr/README.md) to proceed while UL-03 legal work is deferred.
- **UL-06 (conventions):** COMPONENT-001 is the draft rulebook. Once C1, C9 and D3, D4, D9, D10 and D14 are folded in, what remains is lint rules. Its scope now uses `data-erx-*` state attributes and the D10 lifecycle rule.
- **UL-12 (design language):** the seven foundation specs are its draft token specification. To close it, fold in D2, D6 and D12 (choosing a 90 or 120 ms tooltip exit), write the naming grammar (D5), settle the tooltip border (D8) and add the design source. Its dependency on UL-06 stays.
- **UL-13 (theme CSS):** one tokens folder and one generator. Generate the CSS from the token JSON once the companion files are added or regenerated. Its scope already covers this.
- **UL-24 (layering):** renamed "Layering and dismissal". Overlays render in the top layer, with a Portal only for an overlay that the native-first ADR keeps out of it.
- **UL-25 (modality):** its scope now follows C5, C6 and C8: native focus containment and inertness, the CSS scroll lock, and a capped presence wait.

## After the v0.2.0 revision

All nine specs were revised to v0.2.0 on 23 November 2026 to fold in the resolutions above. Color and Spacing now exist as Markdown, COLOR has an ID and a Status line, and the paths point to `docs/design-system/`. Each spec ends with "Open items after 0.2.0", which lists the choices this record leaves open and the milestone that settles each one.

Three points were clarified while folding the resolutions in:

- **D6, which aliases the generator redeclares** (confirmed by the owner, 23 November 2026). On each Eroxo scope it redeclares only the composite aliases whose inputs that scope changes: colour-based aliases, such as shadows, on theme scopes, and density aliases on density scopes. Scope-independent roles, such as radius and type roles, stay on `:root`. Read literally, "every Eroxo scope" would reset an ancestor's overrides inside nested scopes, which SHAPE §10 and TYPE §2.3 forbid, and would reset compact values inside a nested theme scope, against SPACE's rule that scopes nest in either order.
- **D2 covers monospace too.** `--erx-font-mono` also defaults to system fonts, as UL-12's "font families default to system stacks" requires; Geist Mono is an app-level choice, like Geist.
- **C2 covers every library rule.** COLOR's forced-colors rules moved into `@layer erx.components`, because no library CSS ships unlayered.

The revision also found three questions this record didn't cover. Each is an open item in the specs concerned:

- **CSS export names.** [UL-05 CSS delivery](../adr/04-css.md) specifies automatic component styles with shared tokens, an explicit `eroxo-ui/tokens.css` export and the full `eroxo-ui/styles.css` export.
- **AlertDialog and the scroll lock:** the rule matches `.erx-dialog:modal`, so an AlertDialog's `<dialog>` must also carry `erx-dialog`, or the rule needs a second selector. Settled in UL-06 and UL-25.
- **Explicit `size` on an `Icon` inside a control:** whether it overrides the control's icon size. Settled in UL-20.

Still with the owner: the missing companion files, and a design source for UL-12.

## UL-06 follow-up

On 23 November 2026 the owner approved [the component rulebook v0.3.0](eroxo-iris-component-anatomy-api-spec.md). Section 3 settles variant subsets and tone mapping (D3). Section 8 settles stable part classes (D4), density names and the component hook budget (D5). Section 6 identifies the native element and separate root classes for Dialog and AlertDialog (D9). UL-12 inventories foundation tokens and UL-25 verifies modal behavior. The decisions above retain the original review context.
