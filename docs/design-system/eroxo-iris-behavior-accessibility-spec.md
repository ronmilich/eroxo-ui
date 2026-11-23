# Eroxo Iris — Component Behavior & Accessibility Architecture

**Specification ID:** ERX-DS-BEHAVIOR-001  
**Version:** 0.2.0  
**Decision date:** 23 November 2026  
**Status:** Architecture design contract locked; implementation, browser conformance and accessibility certification pending  
**Owner:** Eroxo UI  
**Target:** SolidJS 2 + `@solidjs/web`, TypeScript, ESM/SSR, WCAG 2.2 AA

> **0.2.0 (23 November 2026):** revised to match the approved [Iris reconciliation record](reconciliation.md): C5, C6, C7, D1, D13 and D14, and the record's gaps on the CSS scroll-lock rule, missing companion files and the Tooltip profile. Choices it leaves open are listed under "Open items after 0.2.0".

> **Normative language:** MUST and MUST NOT are mandatory for a conforming Eroxo implementation; SHOULD indicates a preferred default requiring documented justification for exceptions; MAY is optional. This document specifies intended behavior, not evidence of a shipping implementation. Reference code in the companion ZIP (not yet in the repository; see §19) is deliberately limited and MUST NOT be advertised as production-ready focus management or overlay behavior.

## 1. Executive decision record

| Decision | Locked policy | Rationale |
| --- | --- | --- |
| Native browser primitives | **Native-first with verified fallback** | Reduce bespoke behavior while keeping a single observable contract |
| Standard Dialog | Escape and outside-pointer dismissal by default | Familiar, recoverable interaction; consumer vetoes supported |
| AlertDialog | No outside-pointer dismissal; Escape normally available | Avoid accidental destructive dismissal without trapping users |
| Collections | **JSX-first with data adapters** | Composable authoring with one underlying item model |
| Behavior distribution | **Internal primitives in v1** | Minimize public compatibility surface while the in-house engine matures |
| Focus and overlay orchestration | One coordinator per document/root context | Coordinate nested layers and cleanup; not one manager per component |
| Headless library | No runtime dependency on Kobalte, Ark UI or another behavior toolkit | Maintain the in-house TT-032 decision |
| Accessibility | WCAG 2.2 AA for documented compositions | Release gate, not merely design aspiration |
| Supported rendering | Client, SSR and hydration | Avoid non-deterministic IDs or import-time DOM access |

**Related decisions:** ERX-DS-COMPONENT-001 (public API), ERX-DS-MOTION-001 (visual presence phases), ERX-DS-DEPTH-001 (elevation/z-index), ERX-DS-SPACE-001 (density/hit targets), ERX-DS-ICON-001 (decorative icons), ERX-DS-COLOR-001 (focus and status). This specification owns **behavior**, and MUST NOT redefine visual tokens.

**Roadmap traceability:** UL-14 state/event helpers; UL-15 accessibility/motion/localization utilities; UL-16 interaction primitives; UL-17 collections; UL-24 layer registry/dismissal; UL-25 modal focus/inertness/scroll lock/presence; UL-26 positioning. The UL-04 native-first spike is done ([report](../ul-04-spike.md)), and UL-05 ADRs may refine implementation mechanisms, but changes to the user-visible contract require a written superseding decision. The approved [Iris reconciliation record](reconciliation.md) is such a decision; 0.2.0 applies it.

## 2. Ownership boundaries and module topology

| Layer | Owns | Must not own |
| --- | --- | --- |
| Public component | Part composition, semantic props, accessible names, state exposure | A private duplicate overlay or keyboard engine |
| Core state | Controlled/uncontrolled ownership and deterministic IDs | Browser event listeners at module evaluation |
| Interaction | Input modality, pointer/press, keyboard, IME | Global theming or style values |
| Collections | Item identity/order, focus strategy, typeahead, selection | Direct DOM positioning of overlays |
| Overlay orchestration | Layer relationships, dismissal, modality, focus return, presence | Application business rules or persistence |
| Accessibility services | Locale strings, announcements, focus helpers | Announcing native semantics a second time |
| Browser adapter | Native `<dialog>`, Popover API and fallbacks | Altering the public contract by browser |

**Internal-only entry points:** `createPress`, `createFocusVisible`, `createCollection`, `createRovingFocus`, `createVirtualFocus`, `createDismissableLayer`, `createFocusScope`, `createTypeahead`, `createLiveAnnouncer`, `createPresence` and native platform adapters are names for internal modules, not promised exports. The 1.0 package MUST export only approved styled components and their documented parts. Avoid a single barrel that eagerly loads positioning and overlays when importing Button.

**State distinction:** requested `open`/`checked`/`value` are semantic states. `data-erx-presence="exiting"` is a visual mounting phase. Native top-layer state, DOM mounting state and controlled prop state may temporarily differ during transitions; orchestration MUST reconcile them explicitly.

## 3. Platform-selection policy

1. Prefer semantic native `<button>`, `<input>`, `<a>`, `<label>` and `<dialog>` when their actual interaction contract matches the component.
2. For modals, consider `<dialog>.showModal()` first: browser-provided top layer, focus behavior and document inertness are the baseline. DO NOT add a redundant focus trap or a parallel inert manager unless a verified browser gap requires one.
3. Standard Dialog SHOULD begin with `closedby="closerequest"` and coordinated outside-pointer dismissal. AlertDialog SHOULD also default to `closerequest`; never rely on native `any` light dismissal for AlertDialog. Feature detection and actual cancel/close behavior must be verified in all supported engines.
4. For Popover API, choose `popover="manual"` when the Eroxo registry needs to own dismissal/ordering; use `auto` only if its native behavior fully matches the relevant component profile and documented nesting semantics.
5. Native top-layer ordering is **not** controlled by CSS `z-index`. Overlays render in the top layer, where UL-04 found portals and a z-index stack unnecessary; ERX-DS-DEPTH-001's `--erx-z-base` and `--erx-z-sticky` are for in-page layers. Portals, other z-index tokens and a mixed native/portaled overlay stack exist only if the UL-05 native-first ADR names an overlay that can't use the top layer; such a stack MUST then be explicitly tested, and the portal requirements elsewhere in this specification apply only to that overlay.
6. Use a custom fallback only after recording unmet capabilities and a browser-compatibility test. Avoid silent degradation of modality, Escape, keyboard navigation or focus restoration.

**Controlled native dialog rule:** native `cancel` requests a close and MAY be prevented while a controlled parent decides; the library MUST NOT call `close()` merely because a controlled consumer emitted a callback. Close only after the authoritative controlled state accepts dismissal. Direct native `close` events or unexpected browser closures MUST reconcile the logical state and avoid focus loss. If a feature cannot preserve this contract, select the tested fallback.

## 4. Interaction defaults

| Input | Behavior requirement |
| --- | --- |
| Native button | Use browser Enter/Space activation; do not synthesize an extra click |
| Pointer | Normalize mouse, pen and touch without duplicate action firing |
| Press | Activate only on valid completion; cancel when pointer is cancelled or gesture is no longer valid |
| Hover | Honor hover-capable pointers; touch MUST NOT trigger persistent hover state |
| Keyboard | Component/pattern-specific table; only intercept keys actually owned by widget |
| Modifiers | Do not steal text-editing shortcuts, Ctrl/Meta+Arrow or IME keys from editable fields |
| Disabled | Prevent activation and callbacks where component declares disabled; preserve native disabled behavior |
| Drag | Pointer capture only when appropriate; Slider/FileDropzone require non-drag alternatives |
| RTL | Apply logical left/right movement where the APG model calls for it; never reverse values indiscriminately |
| Key repeats | Supported for navigation, but no duplicate semantic requests due to mixed event paths |

**`createPress` boundary:** internal press handling is needed primarily for custom/non-button patterns; real `<button>` remains native. A press handler MUST track active pointer ID, pointer cancel, loss of capture, disabled transitions and teardown. Long-press support is opt-in, never a prerequisite for an action.

**Keyboard modality:** visible keyboard focus MUST remain visible when focus is moved programmatically after keyboard interaction. Pointer input must not permanently suppress keyboard focus indicators. Use `:focus-visible` and focus heuristics only for proven gaps; do not erase browser outlines without an accessible replacement.

## 5. Keyboard ownership and APG profiles

| Widget | DOM focus model | Core keys | Activation |
| --- | --- | --- | --- |
| Button | Native control | Enter, Space | Native |
| RadioGroup | Roving tab stop | Arrow navigation; Tab in/out | Pattern-specific |
| Tabs | Roving tab stop | Arrows, Home/End | Automatic when panel immediate; manual option |
| Menu | Focus on active item | Arrows, Home/End, Escape, typeahead | Enter/Space by pattern |
| Select-only popup | Pattern-specific | Arrows, selection, Escape | Committed choice |
| Editable Combobox | Input keeps DOM focus | Input navigation plus active-descendant | Commit active option only outside IME |
| Slider | Focus on thumb | Arrows, Home/End, Page keys as supported | Value change |
| Dialog | Contained within modal | Tab/Shift+Tab, Escape | Close request |

**No universal arrow handler:** orientation, menu/list semantics, text entry and RTL vary by widget. A primitive can normalize keyboard events, but the component's APG behavior table owns which key is intercepted. Default to no preventDefault unless a supported key is consumed.

**Tabs performance:** automatic activation is default only when panel display is effectively immediate; use `activationMode="manual"` for expensive or asynchronous panels so arrow navigation does not trigger network latency.

**Tooltip:** the Tooltip behavior profile (hover delay, keyboard focus, touch, Escape inside a dialog) is defined in UL-27, not in this specification; see "Open items after 0.2.0".

## 6. Focus system and restoration

**Utilities:** internal `getFocusable`, `getTabbable`, `focusFirst`, `focusLast`, `focusNext`, `isInsideLayerTree` and focus-return ownership tracking. Queries MUST respect native disabled controls, `inert`, visibility, hidden ancestors, `tabindex`, shadow/portal boundaries where supported, and the distinction between focusable and tabbable elements.

**Modal open:** initial focus order is explicit user target, pattern-specific recommended target, then first suitable tabbable node, then a static container/heading with `tabindex="-1"` if appropriate. For a large dialog with introductory content, focusing the heading may be preferable to jumping down to a button. AlertDialog SHOULD initially focus the least destructive action for destructive confirmation.

**Modal active:** focus containment is native: Tab and Shift+Tab never move focus to the page behind the active modal, though past the last element focus may reach the browser's own interface. Eroxo adds no Tab loop and no JavaScript focus trap. Background is actually inert, not merely visually dimmed or marked `aria-modal`. Disabled/hidden nodes are not focus candidates. Nested focus scopes recognize the topmost owner.

**Modal close:** after top-layer/modality release, restore focus to (1) explicit return target if still focusable, (2) invoking trigger if connected and usable, (3) logically adjacent fallback. Never call `.focus()` on a detached or inert node. Closing a child overlay inside an open modal restores focus *inside that modal*. For controlled components, only restore after authoritative closure and native release, not just on an emitted request.

**No surprise focus on hydration:** SSR markup MUST NOT focus elements on the server. Client hydration MUST avoid opening or stealing focus twice due to mismatched initial state.

## 7. Dialog and AlertDialog profiles

| Event/feature | Dialog | AlertDialog |
| --- | --- | --- |
| Modal top layer | Required when open | Required when open |
| Accessible label/title | Required | Required |
| Initial focus | Context appropriate | Least destructive for destructive confirmation |
| Escape | Closes/request-close by default; veto supported | Closes/request-close normally; exceptional veto only |
| Outside pointer | Closes/request-close by default | Ignored |
| Close/Cancel action | Expected | Required, clearly labeled |
| Inert background | Required | Required |
| Nested overlay | Dismiss topmost eligible child first | Dismiss topmost eligible child first |
| Restore focus | Required | Required |
| `onOpenChange` | Request only in controlled mode | Same |

**Outside pointer safety:** classify dismissal using an interaction pair (pointer down/up, pointer ID, button, movement, touch context) and the overlay's nested-layer containment. A gesture that begins inside content and releases outside MUST NOT dismiss accidentally. Right clicks, scroll gestures, scrollbar interactions and synthetic clicks MUST NOT trigger unintended light dismissal. Detail may be vetoed through a documented cancellable event on the public component when the API milestone approves it.

**Escape:** only the topmost eligible layer sees a global Escape dismissal request. Pressing Escape during IME composition MUST NOT dismiss a combobox selection popup as if the user had finished composition; do not overrule a browser-native composition cancellation. A developer MUST NOT disable all exit paths as the ordinary Dialog default.

**AlertDialog-specific rule:** outside pointer never dismisses. Escape ordinarily remains available, with a clearly identifiable cancel/safe action. Blocking Escape requires an explicit exceptional configuration and manual accessibility review.

## 8. Layer registry and nested overlays

Model a **logical tree**, not simply a z-index counter. A layer record includes unique ID, root/document identity, parent layer ID, presentation kind, modal flag, dismissal policy, active state, triggering element, content roots, portal roots and native top-layer registration.

| Invariant | Required result |
| --- | --- |
| Escape on Dialog → Select | Select closes first; Dialog remains |
| Pointer inside a nested child layer, wherever it renders | Counts as inside parent layer tree |
| Closing parent layer | Descendant layers dispose in reverse dependency order |
| Multiple native dialogs | Focus ownership follows top-layer order; no background escape |
| Tooltip within modal | Tooltip does not escape the modal's effective interaction scope |
| Controlled close rejected | Layer stays active and registered |
| Interrupted exit/reopen | Stale exit completion cannot destroy reopened layer |
| Last layer disposed | Shared listeners removed, scroll/inert locks released |
| Overlay theme scope | Nearest logical theme/density/direction applies in place, including `::backdrop` |

**Registration order is not always presentation order:** native top-layer show order and logical parenthood need reconciliation; do not assume CSS z-index makes a tooltip appear above a dialog. One managed coordinator SHOULD exist per relevant `Document`/render root rather than an eternal process-wide singleton, so multiple documents/iframes can function independently.

## 9. Modality, inertness and scroll lock

Prefer native modal `<dialog>` for inert background. A manual `inert` fallback exists only if the UL-05 native-first ADR names an overlay that can't use the top layer; in that fallback, record prior `inert`/ARIA values on each modified target, apply appropriate containment and restore **exact prior values** on final unlock. Never permanently overwrite application-supplied `aria-hidden` or `inert` attributes. Avoid applying `aria-hidden` to ancestors of the active dialog.

Scroll lock is CSS only: `html:has(.erx-dialog:modal) { overflow: hidden; }`. It needs no reference counting: the rule matches while any modal dialog is open, so releasing one nested modal cannot unlock scrolling while another modal remains active. Tests MUST still verify that scrolling stays locked while another modal is open, that scroll position is preserved, that classic scrollbars cause no layout shift (open since UL-04; consider `scrollbar-gutter: stable`), and that the lock holds against touch scrolling on iPadOS. State restoration must handle disposal and aborted transitions.

**Accessibility invariant:** an overlay is not modal merely because it has a scrim or `aria-modal="true"`; it is modal only when background interaction is effectively blocked and keyboard focus remains contained.

## 10. Collections, identity and selection

**JSX-first public API:** consumers declare items through compound parts (`<Select.Item value="solid">SolidJS</Select.Item>`). A data adapter MAY map arrays into the exact same internal collection rather than a second selection implementation.

**Internal collection record:** stable ID/key; semantic value; human-readable text value; disabled status; DOM ref when mounted; render order; parent/group ID where relevant; metadata required for typeahead. Identity MUST NOT be derived only from array index. Dynamic insertions/removals reconcile active item and selection; never retain stale `aria-activedescendant` references.

**Focus strategies:** roving `tabindex` for Tabs/RadioGroup/menus where APG requires; virtual focus (`aria-activedescendant`) for editable Combobox, with DOM focus remaining in the input. When the active virtual option is removed, clear or reassign the active descendant to an existing mounted ID before repaint.

**Selection:** use the controlled/uncontrolled convention from ERX-DS-COMPONENT-001. Disabled item semantics and Shift-range selection follow each pattern. Value equality MUST be explicit and stable; do not compare arbitrary object identity without a defined key model. Data adapter and JSX path MUST yield the same callbacks and accessibility state.

**Virtualization:** advanced list virtualization is out of v1 scope. A future virtualizer must preserve stable IDs, ARIA posinset/setsize when needed, active descendant validity, and scroll/focus restoration; never pretend that unmounted options are presently focusable.

## 11. Typeahead, locale and IME

The internal typeahead engine maintains a typed-text buffer with a **700ms default reset** (internal configurable), searches enabled items in collection order, and uses locale-sensitive normalization/comparison via `Intl.Collator` or a validated equivalent. Repeated-character behavior, diacritics, wraparound and changing locale are test cases. The timeout value is an engineering default, not a public CSS token or a hard public API promise.

**Composition:** maintain explicit composition state using `compositionstart`/`compositionend`, supplemented by `KeyboardEvent.isComposing` and browser-tested edge cases (including composition termination ordering). During active composition, text input MUST continue normally, but Eroxo MUST NOT tokenize, commit a choice, run typeahead navigation, or treat Enter/Escape as a finalized combobox command. Preserve native IME cancellation semantics.

**RTL:** resolve direction from the nearest scoped `dir` value. Logical horizontal arrow movement is widget-specific; Up/Down and typed values are not automatically reversed. Use logical positioning and icon rules; don't infer direction from language or script alone.

**Localization:** all built-in labels, selected-count messages, clear actions and loading announcements are overridable. English is a fallback, not a forced app language. Consumers own application content and persistence. Locale/direction changes MUST NOT remount stateful inputs or discard composition.

## 12. Live regions and announcements

Use one managed announcement service per relevant application/root with distinct polite and assertive channels. The service exposes an internal `announce(message, priority)` contract and enforces cleanup. Do not attach a new live region to every toast or field.

| Event | Default policy |
| --- | --- |
| Passive toast | Polite announcement, when not already announced |
| Critical error | Assertive only when interruption justified |
| Combobox results count | Polite, deduplicated/throttled |
| Validation summary | Announce at the right time; link to invalid fields |
| Progress | Announce meaningful milestones/state changes, not every animation frame |
| Native control state | Do not repeat announcements browsers/AT already provide |
| Decorative motion/icon | No announcement |

Announcements MUST be useful when motion is reduced or removed and when content is portaled. Priority MUST NOT turn all status messages into interruptions. Validate the resulting accessible DOM and screen-reader experience manually.

## 13. Motion and presence integration

The behavior layer consumes ERX-DS-MOTION-001 visual motion tokens. Presence can be `unmounted`, `entering`, `open`, `exiting`, but *logical open state* remains separate. Closing a modal requires the correct ordering of: request; parent acceptance (for controlled mode); visual exit; native top-layer/inertness release; logical registry cleanup; focus restoration. A documented exception may release native state before animation where retaining modality would be harmful, but must be validated.

Reduced-motion mode MUST complete pending presence work immediately, including transitions canceled mid-flight. The implementation MUST handle `transitioncancel`, missing `transitionend`, zero duration, style removal and rapid reopen. No focus loss, stale pointer blockers or leaked overlays are permitted.

## 14. SolidJS 2 lifecycle and ownership

Use SolidJS 2 APIs as documented for the declared peer range. In an owned component, `onSettled()` with a returned cleanup is the preferred component setup/teardown approach. `onCleanup()` remains useful in appropriate primitive/owner scopes; **do not register `onCleanup()` inside `onSettled()` or tracked effects where the runtime forbids it**. Lifecycle code MUST be verified under the minimum and latest supported SolidJS 2 versions.

A shared root coordinator MUST have explicit owner/dispose semantics. A `create*` helper may accept accessors and should return accessors/prop-getters; do not read reactive props once and freeze their values. All browser observers/listeners and global state modifications MUST be removed on teardown. No `document`, `window`, `HTMLElement` or `ResizeObserver` reads at import time or during SSR execution paths.

**SSR/hydration:** generated IDs and `aria-*` references must be stable; initial DOM must match; client-only dialogs/portals must have a documented hydration strategy; no client side effect may run during server render. Test with an installed package in a Vite SPA and SSR fixture, not only source-local unit tests.

## 15. Public API boundary and extensibility

Internal primitives are not public v1 exports. Public API comprises component exports, compound parts, props, callbacks, slots, documented `data-erx-*` attributes, documented CSS variables and behavior guarantees. Consumers MUST be able to style all documented parts and override built-in strings, but MUST NOT depend on the internal registry's object shape or primitive names.

Do not add public `createFocusScope` or `useOverlay` helpers before an explicit ADR and compatibility review. A later headless package can reuse internal pieces only after extracting stable contracts and measuring the cost of supporting them. Component-specific cancellable events should be named and typed consistently once UL-06's event rules are finalized; don't expose ad hoc low-level event hooks on each overlay.

## 16. Failure handling and operational observability

| Failure | Required behavior |
| --- | --- |
| Missing trigger on dismissal | Return focus to logical surviving target |
| Consumer vetoes close: a controlled parent keeps `open` true after a close request (Escape, outside press, the Close part) calls `onOpenChange(false)` | Remain fully interactive and modal as before. Best effort: browsers may close a dialog on a repeated Escape without a cancelable `cancel` event; UL-25 verifies this |
| `showModal()` fails/unsupported | Use verified fallback or surface documented development error; never pretend success |
| Active collection item removed | Reconcile focus to a valid enabled target, or none if empty |
| All items disabled | No invalid active descendant; Tab exit remains possible |
| User switches reduced-motion mid-exit | Resolve pending exit deterministically |
| Component owner disposed | Release listeners, observers, locks, portals, announcements |
| Custom portal outside theme subtree (only if the UL-05 native-first ADR requires one) | Apply resolved theme, direction and density explicitly; top-layer overlays inherit them in place |
| IME composition interrupted | Preserve native composition and avoid accidental commit |

Development-only diagnostics SHOULD identify missing labels, invalid nesting or impossible controlled state without exposing production-only warnings or leaking sensitive form content into logs. The library MUST NOT collect input contents or telemetry by default.

## 17. Behavior conformance and test matrix

| Suite | Minimum assertions | Gate |
| --- | --- | --- |
| Pure-unit | State transitions, collection reconciliation, disabled navigation, ordering, typeahead | UL-14/17 |
| DOM-component | ARIA names/relationships, refs, native input semantics, announcements | UL-15/16 |
| Real-browser keyboard | Per-component APG key table, focus, disabled, RTL | Chromium/Firefox/WebKit |
| Pointer/touch | Outside press safety, pointercancel, capture, no double activation | Chromium/Firefox/WebKit |
| Nested overlays | Escape ordering, portaled containment, controlled veto, top layer | UL-24 |
| Modal/focus | Initial focus, focus never reaching the page behind (no Tab loop), inertness, restoration, scroll locks | UL-25 |
| IME | Compositionstart/end edge cases, Chinese and Korean manual session | UL-16/17 |
| SSR/hydration | Deterministic IDs, no DOM import, portal lifecycle, teardown | UL-08/09 |
| Accessibility | axe plus manual screen-reader smoke tests: VoiceOver with Safari now, NVDA from UL-09, TalkBack as UL-05's support matrix settles | Each public component |
| Adaptation | 200% zoom, 320 CSS px reflow, forced colors, reduced motion | Each public component |
| Performance | Button-only bundle excludes overlays; no listeners when none open | UL-08/43 |

**Acceptance criteria:** an accessible UI requires actual assistive-technology testing; a passing axe scan does not establish conformance. Each primitive must meet the repository's Primitive Definition of Done, and each public component its Component Definition of Done. Record known exceptions and browser versions before release. A failed keyboard, focus, inertness or announcement test blocks release.

## 18. Implementation sequence and ownership

| Milestone | Deliverable | Proof |
| --- | --- | --- |
| UL-14 | Controlled state, event composition, refs, IDs | Pure/type tests; SSR import safety |
| UL-15 | VisuallyHidden, live announcer, locale/direction, motion preference | DOM + screen reader review |
| UL-16 | Press/hover, input modality, key normalization, focus queries, IME | Pointer/keyboard browser matrix |
| UL-17 | Split in two: roving tabindex, typeahead and the collection model first; virtual focus and selection second | Executable APG tables |
| UL-24 | Layering and dismissal: overlay registry, native top-layer rendering (a portal only if the UL-05 native-first ADR requires one), dismissal | Nested stacking + outside press |
| UL-25 | Modal focus, inertness, scroll lock, presence | Focus/cleanup/scroll tests |
| UL-26 | In-house positioning engine and collision handling; CSS anchor positioning only as a later fast path | Zoom/RTL/scroll geometry |

**Suggested integration order:** a native Button validates event/state APIs; Tabs or RadioGroup validates roving focus; editable Combobox validates virtual focus + IME; Dialog/AlertDialog validates native modality and exit handling; nested Select inside Dialog validates the registry; Tooltip/Popover validates positioning and layering.

## 19. Reference-kit classification

The companion ZIP is not yet in the repository. It is to provide: (a) machine-readable behavior contracts; (b) pure, DOM-free reference algorithms for layer order, roving navigation and typeahead; (c) SolidJS integration pseudocode/reference sketches; (d) executable Node tests for the pure algorithms; (e) manual browser and screen-reader checklists.

**Not included / not certified:** a native-dialog controlled adapter, positioning engine, cross-browser end-to-end suite, live announcer production runtime, or verified accessible components. Those require tests in the Eroxo repository with its exact SolidJS peer versions and release fixtures. Eroxo builds no modal focus trap and no scroll-lock manager: focus containment is native (§6) and scroll lock is a CSS rule (§9). A manual inertness fallback exists only if the UL-05 native-first ADR requires one (§9).

## 20. Sources and normative references

- [WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) — widget-specific keyboard and ARIA behavior.
- [APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [AlertDialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) — focus, labeling and dismissal expectations.
- [APG combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) — input focus and `aria-activedescendant` conventions.
- [HTML `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [`closedBy`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy), and [`requestClose()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/requestClose) — native modal behavior and close requests.
- [SolidJS 2 `onSettled`](https://docs.solidjs.com/reference/solid-js/lifecycle-actions/on-settled/), [`onCleanup`](https://docs.solidjs.com/reference/solid-js/advanced/specialized-reactivity/on-cleanup/), and [cleanup-scope diagnostics](https://docs.solidjs.com/reference/solid-js/diagnostics/cleanup-in-forbidden-scope/).
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility conformance target.

**Decision status:** Product and visual/interaction architecture is locked. Native browser fallback details, platform-specific event ordering, and lifecycle code shape are engineering validation gates, not unresolved product questions. Any shipped behavior must be validated independently of this specification.

## Open items after 0.2.0

- **Tooltip behavior profile** (record gap): hover delay, keyboard focus, touch, and Escape inside a dialog, with the hover-delay token from D12. Settled in UL-27.
- **`entering` presence phase** (D11): whether presence tracks `entering` at all; §13 still lists it. Settled in UL-25.
- **Portal or manual-inert fallback** (C7): whether any overlay can't use the top layer and so needs a portal, a z-index token other than `--erx-z-base` and `--erx-z-sticky`, or a manual `inert` fallback (§3, §9). Settled by the UL-05 native-first ADR.
- **Layout shift with classic scrollbars** (C5, open since UL-04): whether the scroll lock shifts the layout when scrollbars take space; check on Windows and consider `scrollbar-gutter: stable`. Settled in UL-25.
- **TalkBack** (D13): whether the manual screen-reader smoke tests include TalkBack. Settled in UL-05's support matrix.
- **Companion ZIP** (record gap, missing companion files): the owner adds it, with recorded provenance under the clean-room rules ([UL-03](../ul-03-commercial.md)) for any reference code, or §19 stays a plan. Settled by the owner.
- **AlertDialog and the scroll lock** (C5, D9): the scroll-lock rule matches `.erx-dialog:modal`, but an AlertDialog's `<dialog>` would carry `erx-alert-dialog`. Either it also carries `erx-dialog`, or the rule gains a second selector. Settled in UL-06 and UL-25.
