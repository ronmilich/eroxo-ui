# Eroxo Iris — Motion & Interactions System Specification

**Document ID:** ERX-DS-MOTION-001  
**Version:** 0.1.0  
**Decision date:** 23 November 2026  
**Status:** Visual design contract approved; runtime/browser verification pending  
**Owner:** Eroxo UI  
**Platform:** SolidJS 2, TypeScript, ordinary CSS, client/SSR builds

> **Normative terminology:** MUST and MUST NOT are requirements; SHOULD is a default that may be changed with documented justification; MAY is optional. This is an approved *design specification*, not an assertion that implementation, accessibility conformance, or browser support has already been verified.

## 1. Executive decision record

Eroxo Iris uses **Quiet Precision**. Animation communicates state changes, direction and continuity without drawing attention to itself. Ordinary interaction is immediate; larger overlay transitions are restrained. The entire motion system is tokenized and independent of colors, shape, typography, spacing, and elevation.

| Decision | Final rule |
|---|---|
| Motion personality | Quiet Precision: purposeful, unobtrusive, short |
| Overlay appearance | Opacity + 4px placement-aware translation |
| Dialog | Opacity + scale from 0.985; no large slide |
| Button press | Background/border/color feedback only; no scale |
| Interactive elevation | Never hover-lift or raise shadows by default |
| Skeleton | Gentle 1600ms pulse between existing Iris skeleton colors; **not** shimmer |
| Spinner | 900ms linear rotation when motion is allowed; static alternative under reduced motion |
| Theme change | Instant; suppress component color transitions within the switching scope |
| Animating theme variables | Forbidden by default, including on `:root` |
| Default engine | CSS transitions and keyframes; no runtime CSS-in-JS, spring, or external motion library |
| Presence | In-house SolidJS lifecycle primitive; internal in v1 |
| Motion preferences | Follow `prefers-reduced-motion`; scoped `data-erx-motion="reduce"` may further reduce motion |
| Default CSS contract | `--erx-` variables; stable `data-state` + `data-erx-presence` selectors |

**Dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001, ERX-DS-SHAPE-001, ERX-DS-DEPTH-001. Does **not** redefine their tokens. The library's own behavior system remains responsible for keyboard/focus/collection/positioning semantics.

## 2. Scope and ownership

**In scope:** durations, easing, distance and scale primitives; component motion mapping; sequencing and interruption rules; SolidJS presence contract; reduced-motion and theme-switching behavior; animation performance; CSS override mechanisms; test matrix; acceptance criteria.

**Out of scope:** dialog focus-trap and modality algorithms, portal or top-layer stacking, roving focus, overlay collision detection, gesture recognition, content semantics, CSS shadow geometry, and product-specific page transition choreography. Those belong to behavior primitives or consumer applications. Never infer accessibility or modality from the presence phase alone.

## 3. Primitive tokens — exact baseline

All durations use milliseconds; distances are `rem` to follow user settings. CSS keyframe names have the `erx-` prefix. The token generator MUST output these exact values and must preserve the names as stable public tokens.

| Public token | Value | Intent |
|---|---|---|
| `--erx-motion-duration-instant` | `0ms` | Focus, critical feedback and theme switching |
| `--erx-motion-duration-fast` | `120ms` | Button hover, tooltip enter |
| `--erx-motion-duration-normal` | `180ms` | Controls, menu enter, tab selection |
| `--erx-motion-duration-moderate` | `250ms` | Dialog/toast enter |
| `--erx-motion-duration-slow` | `350ms` | Reserved exceptional large motion, not default |
| `--erx-motion-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Control and selection |
| `--erx-motion-ease-enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrance deceleration |
| `--erx-motion-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Fast exit |
| `--erx-motion-ease-linear` | `linear` | Continuous rotation |
| `--erx-motion-distance-overlay` | `0.25rem` | 4px at 16px root |
| `--erx-motion-distance-toast` | `0.5rem` | 8px at 16px root |
| `--erx-motion-scale-dialog` | `0.985` | Initial dialog scale |
| `--erx-motion-duration-pulse` | `1600ms` | Skeleton pulse cycle |
| `--erx-motion-duration-spin` | `900ms` | Spinner rotation cycle |

**Principle:** Focus ring visibility, DOM state, `aria-*` changes, disabled state, and focus management MUST be immediate and must not wait for transition completion.

## 4. Semantic timing roles and component mapping

Semantic roles are public CSS custom properties. All timings are derived from primitives. Exit durations are shorter than equivalent entrances, and no transition is allowed to block responding to user input.

| Role token | Default | Consumer / component use |
|---|---|---|
| `--erx-motion-hover-duration` | `var(--erx-motion-duration-fast)` | Hover color/border |
| `--erx-motion-press-duration` | `var(--erx-motion-duration-instant)` | Immediate press appearance |
| `--erx-motion-selection-duration` | `var(--erx-motion-duration-normal)` | Checkbox, radio, switch, tabs |
| `--erx-motion-tooltip-enter` | `var(--erx-motion-duration-fast)` | Tooltip opening |
| `--erx-motion-tooltip-exit` | `90ms` | Tooltip dismissal |
| `--erx-motion-floating-enter` | `var(--erx-motion-duration-normal)` | Dropdown/popover opening |
| `--erx-motion-floating-exit` | `var(--erx-motion-duration-fast)` | Dropdown/popover dismissal |
| `--erx-motion-dialog-enter` | `var(--erx-motion-duration-moderate)` | Dialog opening |
| `--erx-motion-dialog-exit` | `var(--erx-motion-duration-normal)` | Dialog closing |
| `--erx-motion-toast-enter` | `var(--erx-motion-duration-moderate)` | Toast presentation |
| `--erx-motion-toast-exit` | `var(--erx-motion-duration-normal)` | Toast dismissal |
| `--erx-motion-progress-duration` | `var(--erx-motion-duration-normal)` | Determinate progress change |

| Component | Open / state change | Close / reverse | Prohibition / note |
|---|---|---|---|
| Button / IconButton | Color, background and border at 120ms | Press immediately | No scale, shadow lift, layout movement |
| Checkbox / Radio | Visible check/dot and color at 180ms | 120ms if needed | State and accessible name change immediately |
| Switch | Thumb translation 180ms | 180ms | Coordinate with RTL layout; thumb movement is functional |
| ToggleGroup | Selected surface and indicator 180ms | 180ms | Selection always visible without motion |
| Tabs | Indicator translate or fade 180ms | 180ms | No horizontal scrolling animation unless consumer asks |
| Tooltip | Fade 120ms | Fade 90ms | No required info accessible only by hover |
| Dropdown / Popover | Fade + 4px toward settled position, 180ms | Fade + 4px toward trigger, 120ms | Placement drives direction; do not alter positioning transform |
| Dialog / AlertDialog | Fade + `0.985` scale, 250ms | Fade + slight scale, 180ms | Native top-layer/focus lifecycle governs release |
| Toast | Fade + 8px logical-direction translation, 250ms | 180ms | Do not make announcement await animation |
| Progress | Determinate value change 180ms | N/A | Always expose semantic value |
| Skeleton | 1600ms base↔shimmer *color pulse* | Immediate removal | No sweeping shimmer; decorative skeleton hidden from AT |
| Spinner | 900ms linear loop | Immediate removal | Reduced-motion static indicator plus status text when needed |

**Reconcile with Color v0.1:** Skeleton uses `--erx-color-skeleton-base` and `--erx-color-skeleton-shimmer`. Those names represent two luminance endpoints. The approved *gentle pulse* animates the background color between them rather than changing the entire content element's opacity; this retains color-system ownership and avoids shimmering stripes.

## 5. Overlay entrance / exit geometry

For a floating surface, animation starts **4px toward its trigger** and settles to zero. A top-placed overlay enters from `translateY(+4px)`; bottom enters from `translateY(-4px)`; left enters from `translateX(+4px)`; right enters from `translateX(-4px)`. Exit follows the reverse path. The arrow and positioned outer wrapper MUST remain correctly aligned. Apply motion to a nested visual panel if the positioning engine controls `transform` on the positioned outer wrapper.

| `data-side` | Enter offset X | Enter offset Y |
|---|---|---|
| `top` | 0 | `+4px` |
| `bottom` | 0 | `-4px` |
| `left` | `+4px` | 0 |
| `right` | `-4px` | 0 |

`data-side` is the *resolved physical placement* after positioning, RTL processing, and collision correction. Eroxo MUST NOT infer directions from the text language alone. The visual panel may use the CSS individual `translate` property; never silently overwrite the transform used by a positioning engine.

Dialogs animate opacity and `scale` only (`0.985` → `1`); no displacement. The motion layer does not add shadows, change border radii, alter backdrop colors, or adjust layout geometry. The opaque surface and shadow are owned by ERX-DS-DEPTH-001.

## 6. Visual interactions and state sequencing

1. On pointer press, native press feedback is immediate; clicks and keyboard activation MUST NOT wait for an animation.
2. Hover feedback uses only semantic Iris color/border tokens; default components MUST NOT translate, scale, glow, or increase elevation on hover.
3. Focus indication changes immediately. `:focus-visible` outline and its 2px offset belong to ERX-DS-SHAPE-001 and MUST NOT be faded, delayed, or encoded solely as glow.
4. Disabled and read-only states do not animate into an interactive state. `aria-disabled` needs event-policy enforcement by the component implementation.
5. Selection/checked values update synchronously with the action; animation is a secondary visual confirmation.
6. On repeated rapid actions, the newest requested state wins. No stale animation completion may revert current state.
7. Toast live-region announcements and validation errors appear semantically immediately; visual entrances are optional enhancement.
8. Large content changes MUST NOT trigger generic page animations. Consumer-defined route/page transitions are out of scope.

## 7. SolidJS presence contract (internal for v1)

**Ownership:** UL-15 establishes reduced-motion and animation utilities; UL-25 provides the in-house presence primitive used by Dialog/Popover/Tooltip/Toast and coordinates with UL-24 overlay lifecycle. Do not import Kobalte, Ark, Framer Motion, or a positioning library to satisfy this contract.

```ts
type PresencePhase = 'closed' | 'entering' | 'open' | 'exiting'

type PresenceApi = {
  phase: Accessor<PresencePhase>
  isMounted: Accessor<boolean> // true until exit completes
  bindElement: (node: HTMLElement | undefined) => void
  onAnimationEnd: (event: AnimationEvent) => void
  onAnimationCancel: (event: AnimationEvent) => void
}

function createPresence(options: {
  open: Accessor<boolean>
  initialAnimation?: boolean // default false for SSR/hydration
  onExitComplete?: () => void
}): PresenceApi
```

**State invariants:**

- Initial SSR output MUST reflect requested `open`: `open` if true, `closed` if false, with no forced entering transition. The same phase must be used for hydration.
- `closed` MUST be unmounted/inactive. `entering`, `open`, and `exiting` remain rendered.
- Opening during `exiting` MUST cancel the obsolete exit result and move to `entering` (or immediately `open` under reduced motion).
- Closing during `entering` MUST cancel the obsolete enter result and move to `exiting`; do not wait for enter to finish.
- Every animation/fallback completion MUST be guarded by a monotonically increasing generation or cancellation token.
- Normal completion may use an animation-end event on the visual panel, filtered by `event.target === element` and the expected animation name. A fallback deadline or WAAPI tracking is required because `animationend` may be absent when animations are cancelled or reduced to zero.
- Prefer actual animation-finished observation plus a guarded fallback timeout derived from computed animation duration/delay; never assume the token duration equals the true overridden duration.
- Under reduced motion or CSS unavailable, completion MUST occur without hanging; clear event listeners, queued frames and timers when replaced/disposed.
- Dialog close semantics MUST be coordinated with `<dialog>.close()` / top-layer release, focus restoration, scroll lock, and overlay-owner lifecycle. The presence primitive MUST NOT directly steal focus or call `showModal()`.
- Do not access `window`, `document`, `matchMedia`, `getComputedStyle`, `requestAnimationFrame`, or elements at module import time or during SSR. Browser-only effects run after mounting.

**DOM contract:** the logical requested state is exposed as `data-state="open|closed"` while the current rendered visual state is `data-erx-presence="entering|open|exiting"`. For an exiting overlay these can deliberately disagree (`data-state="closed"`, `data-erx-presence="exiting"`); CSS animation reads the latter. The overlay behavior layer is responsible for accessibility semantics while the element is temporarily rendered during exit.

### 7.1 Native top-layer behavior

- Start entrance **after** native `showModal()` / Popover API makes the element visible in the top layer.
- Defer native `.close()` and final overlay removal until exit is finished; after close, restore focus and release modality exactly once.
- If reduced-motion preference changes to `reduce` while exiting, complete exit immediately and release native modal state.
- The overlay manager MUST choose behavior when another modal interrupts a closing modal; no generic z-index promise is made by this motion specification.
- Modern `@starting-style` and `transition-behavior: allow-discrete` MAY be used after browser-matrix validation, but the implementation must have a tested fallback.

## 8. Reduced-motion contract

`prefers-reduced-motion: reduce` is authoritative. The application MAY additionally set `data-erx-motion="reduce"` on a local scope. **No `full`/`force` mode in v1 may override a system reduced-motion request.**

Under reduced motion:

- All nonessential visual transitions, entrance translation and dialog scaling become instant; distances resolve to zero or animations are suppressed.
- Skeleton stays static at `--erx-color-skeleton-base` (no pulse).
- Spinner rotation stops. A static visible indicator plus text or an accessible busy status MUST preserve progress context; simply hiding a busy indicator is insufficient.
- Functional state changes, keyboard focus, accessible notifications and modal behavior continue normally.
- Focus restoration and DOM unmount must never wait on a duration that is now zero.
- Consumer animations are outside Eroxo's control; docs MUST explain how to respect the same preference in app styles.

CSS token overrides should be exposed at both `@media (prefers-reduced-motion: reduce)` and `[data-erx-motion="reduce"]`. Component keyframes additionally use explicit reduce selectors for `animation: none` or paused/static visual fallback. Tests MUST cover switching the OS setting while an overlay is entering and exiting.

**Accessibility nuance:** WCAG 2.2 AA is the library baseline; the broader preference to remove nonessential triggered motion also advances WCAG 2.3.3 (AAA). The distinction must be documented rather than claiming AAA certification for the entire package.

## 9. Instant theme switching

Color tokens switch immediately between Iris light, dark, or custom scopes. Theme switching MUST NOT trigger unwanted long color transitions from button hover rules or generic `transition` declarations.

**Recommended protocol:** ThemeManager sets `data-erx-theme-switching` on the affected theme scope just before changing its theme attribute, then removes that temporary flag after the new theme has painted. Within that flag, Eroxo CSS uses zero motion durations for its own component transitions. Do not remount components or rewrite independent application markup. The implementation should avoid a flash of the old scheme on initial SSR hydration by applying the chosen theme before first paint (ERX-DS-COLOR-001 / UL-18).

Component styles MUST use explicit `transition-property` lists; never `transition: all`. Do not add a global `transition` to `body`, `:root`, or every CSS descendant. The temporary switching flag only governs Eroxo-provided styles, not arbitrary application transitions.

## 10. CSS layering, names and scope architecture

Follow the established cascade order and public prefix. Use `@layer erx.tokens` for generated defaults and `@layer erx.components` for component rules. Consumer unlayered CSS can override Eroxo's layered defaults. Motion-specific scoped values can be set on any theme or density scope without coupling animation to color or spacing density.

**Token grammar:** `--erx-motion-{duration|ease|distance|scale}-*` for primitives, `--erx-motion-{component}-{enter|exit}` for timings, and `--erx-motion-{hover|press|selection|progress}-duration` for roles. Avoid redefining existing `--erx-space-*`, `--erx-shadow-*`, `--erx-color-*`, or `--erx-radius-*` tokens.

A nested scope can override motion primitives or component timing roles. When the consumer overrides the base duration globally, predeclared semantic variable aliases may already have been resolved at the ancestor scope; the correct override is the **semantic role on the active scope**. Document this explicitly, consistent with the previous foundation's CSS custom-property inheritance guidance.

```css
@layer erx.components {
  .erx-button {
    transition-property: background-color, border-color, color;
    transition-duration: var(--erx-motion-hover-duration);
    transition-timing-function: var(--erx-motion-ease-standard);
  }

  .erx-button:active {
    /* Semantic pressed colors from ERX-DS-COLOR-001; never transform/scale. */
    transition-duration: var(--erx-motion-press-duration);
  }

  .erx-button:focus-visible {
    outline: var(--erx-focus-outline-width) solid var(--erx-color-focus-ring);
    outline-offset: var(--erx-focus-outline-offset);
  }
}
```

## 11. Performance and runtime constraints

1. Prefer `opacity` and CSS individual `translate`/`scale` for floating surfaces. Keep the positioned wrapper separate from the visual panel to avoid clobbering the placement engine's `transform`.
2. Background and border-color changes are intentionally allowed for small UI elements; they are not equivalent to expensive full-page repaints.
3. NEVER use continuous `will-change` on all components. MAY enable it briefly for a mounted overlay during a known transition; remove afterward.
4. Avoid layout animation of height/width/top/left for the default components; content reflow should remain instantaneous and stable.
5. No runtime motion dependency, no scroll-driven animation requirement, no global RAF loop, no global listeners while idle.
6. CSS distribution is static and tree-shakable; Button-only imports MUST NOT pull in overlay presence runtime by accident (UL-43).
7. A motion preference observer MAY be shared at runtime and MUST be lazy, disposed after last subscriber, and inert on SSR.
8. No animation should delay validation or control interaction; test rapid repeated clicks.

## 12. Accessibility and internationalization checklist

| Concern | Requirement |
|---|---|
| Keyboard | Activation, Escape and focus behavior work independently of animation timing |
| Focus | Focus-visible indicator appears immediately and remains visible during motion |
| Screen readers | State/label/live-region updates do not wait for animations |
| Error / selected | Color and motion are not the only information channels |
| Reduced motion | OS and scoped reduce mode; static loading fallback |
| RTL | `data-side` is resolved placement; directional offsets remain correct |
| International text | No animated clipping as glyphs expand, wrap or change scripts |
| Forced colors | No reliance on shadows or animated color for essential boundaries |
| Zoom / reflow | At 200% text scaling and 320px viewport, no functional clipping |
| Gestures | No motion dependent on drag or pointer-only input for core controls |

## 13. Test strategy and executable acceptance matrix

| Test layer | Test cases | Gate |
|---|---|---|
| Token validation | All values, ranges, semantic aliases, CSS generation determinism | Node script |
| Static CSS | Keyframes declared, motion reduction selectors, no `transition: all`, no hover lift | Vitest/static validator |
| Interactive controls | Hover 120ms; press instant; focus immediate; switch/tabs 180ms | Chromium/Firefox/WebKit |
| Floating surfaces | Correct `data-side` offsets; exit duration shorter; anchor stable | Three browser engines |
| Presence | enter→exit, exit→reopen, repeated rapid toggles, dispose, cancelled event | Unit + three browsers |
| No animation | `prefers-reduced-motion`, forced-color mode where applicable, zero CSS duration | Browser |
| Mid-flight reduction | Change preference during enter/exit; no stale mounted modal | Browser |
| Native top-layer | `showModal()`, delayed close, focus restoration, nested overlays | Three engines + manual AT |
| SSR | No DOM during import/render; open/closed markup stable on hydration | SSR fixture |
| Themes | Light→dark instant, nested theme override, no flash or transition leak | Browser |
| Loading | Skeleton pulse; static reduced-motion; spinner static state and status | Browser + accessibility |
| Performance | Only opacity/translate/scale for overlay motion; no idle timers | Trace/bundle audit |

**Manual checks:** keyboard-only flows, screen reader on supported platforms, OS reduction setting, virtual keyboard and touch, RTL Hebrew and mixed Latin/CJK content. Record exact browser/OS versions, result, limitations, and severity. Do not call the suite “passed” before actual execution.

## 14. Production acceptance criteria

- [ ] Approved token JSON and generator produce deterministic CSS with stable `--erx-` names.
- [ ] No collisions with any of the five preceding Eroxo foundations.
- [ ] Light/dark/custom, nested scope, density and SSR fixtures retain intended motion without remounts.
- [ ] No default hover lift, scale press, new elevation, decorative glow animation, or shimmer.
- [ ] Component-level durations match the mapping in Section 4.
- [ ] Opening and closing the native Dialog coordinates exactly once with focus restoration/top-layer exit.
- [ ] In-flight cancellation and preference changes leave no stale overlay or timers.
- [ ] Reduced-motion spinner/skeleton remain accessible and visible.
- [ ] Three-engine browser tests, keyboard tests and conformance notes are recorded.
- [ ] Standalone Button import excludes overlay engine; package CSS is delivered and styles are overrideable.
- [ ] Documentation contains copyable examples, animation hooks and customization boundaries.

## 15. Proposed repository integration

```text
docs/design/eroxo-iris-motion-interactions-spec.md
tokens/motion.json
src/styles/motion.css                      # generated token defaults
src/styles/motion-components.reference.css # example-only recipes
src/internal/createPresence.reference.ts  # non-production illustrative helper
scripts/generate-motion.mjs
scripts/validate-motion.mjs
test/motion.tokens.test.ts
test/fixtures/motion.html
examples/MotionShowcase.tsx
integration/guide.md
```

**Implementation order:** merge this spec into UL-12 visual foundation; add token generator and CSS to UL-13/UL-18 build; implement shared motion preference and first native focus/control rules at UL-15; implement presence/overlay coordination at UL-24/UL-25; audit with UI components and UL-42/UL-43. The `*.reference.*` files are explanatory examples, not certified production implementations.

## 16. Decisions intentionally deferred

- Native `@starting-style` / `transition-behavior: allow-discrete` adoption and fallback after UL-04 browser spike.
- Event/deadline implementation details and cancellation tokens finalized in the UL-25 presence ADR.
- Pointer gesture/swipe motion for Toast or Slider if needed; not part of default foundation.
- Custom page transitions, spring physics and animated charts belong to consumers, not Eroxo v1.

No remaining *visual-design* decision needs owner approval before this contract is implemented. Technical choices above are constrained by acceptance tests rather than brand preference.

## 17. Standards and related specifications

- [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN — `animationend`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)
- [MDN — `animationcancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)
- [MDN — CSS top layer](https://developer.mozilla.org/en-US/docs/Glossary/Top_layer)
- [MDN — `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- Existing Eroxo contracts: ERX-DS-COLOR-001, TYPE-001, SPACE-001, SHAPE-001 and DEPTH-001.

**Change policy:** Any amendment to durations, semantics, selectors, or accessibility behavior requires an explicit design-system decision record, token-version update, regression tests and migration notes if a public token changes.
