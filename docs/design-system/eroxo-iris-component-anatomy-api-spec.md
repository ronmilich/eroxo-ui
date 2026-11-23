# Eroxo Iris — Component Anatomy & API Conventions

**Specification ID:** ERX-DS-COMPONENT-001  
**Version:** 0.1.0  
**Decision date:** 23 November 2026  
**Status:** Public API design contract approved; reference code and conformance pending integration  
**Owner:** Eroxo UI  
**Target:** SolidJS 2, TypeScript, ESM, SSR, static CSS, WCAG 2.2 AA

> **Normative language:** MUST and MUST NOT are contractual requirements; SHOULD is a strong default; MAY is optional. This is a design baseline, not evidence that an implementation has passed production verification. The included ZIP is a reference implementation, not a complete accessible component library.

## 1. Executive decision record

| Dimension | Approved contract |
| --- | --- |
| Architecture | **Hybrid:** single-component API for atomic controls; compound components for multi-part interactive patterns |
| Visual variants | Shared vocabulary: `solid`, `soft`, `outline`, `ghost`, `text` (only meaningful variants per component) |
| Semantic style | `variant`, `tone`, `size`; named component-specific props only when necessary |
| Size | `sm`, `md`, `lg`; inherited density selects default; explicit size overrides density |
| Polymorphism | **Selective** `as`, with element-specific types and semantics; never universal on all components |
| Customization | Documented CSS variables, stable `data-erx-slot`, part classes, `class` and `style` |
| State | `open/defaultOpen/onOpenChange`, `checked/defaultChecked/onCheckedChange`, `value/defaultValue/onValueChange` |
| SolidJS conventions | Preserve reactive props; native event behavior; ref forwarding; `onCleanup`; SSR-safe modules |
| Public stability | Exports, TypeScript signatures, documented parts/slots/state attributes and CSS variables are versioned |
| Behavior ownership | In-house behavior primitives; no required third-party headless UI framework |
| Default appearance | Eroxo Iris foundations; `unstyled` not required for 1.0 |

**Relationship to the roadmap:** This spec supplies the conventions for UL-06 and the consumer styling contract for UL-19. UL-04 and UL-05 still govern the technical spike and structural ADRs. The package's public API MUST match the final accepted ADRs if they differ; record an explicit superseding decision rather than silently diverging.

**Foundation dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001, ERX-DS-SHAPE-001, ERX-DS-DEPTH-001, ERX-DS-MOTION-001 and ERX-DS-ICON-001. This specification consumes their tokens; it does not redefine their values.

## 2. Scope, vocabulary and component categories

**This specification owns:** naming, anatomy rules, public prop vocabulary, native attribute forwarding, state control, event composition, refs, styling hooks, slot and state selectors, polymorphism guardrails, accessibility interfaces, RTL/i18n conventions, SSR/performance obligations, tests and versioning.

**This specification does not implement:** focus containment, modality, positioning, pointer/keyboard collection navigation, live-region orchestration, overlay top-layer sequencing, responsive visual designs or actual component-specific behavior. Those are implemented and tested by their own milestones.

| Category | API default | Examples | Reason |
| --- | --- | --- | --- |
| Atomic | Single JSX component | Button, IconButton, Icon, Spinner, Badge, Separator, Skeleton, Progress | One obvious semantic root and few meaningful parts |
| Structured | Named optional parts; a convenience root MAY exist | Card, Field, Alert, Table, EmptyState | Rich layout with replaceable content and styling parts |
| Interactive composition | Compound parts required | Dialog, AlertDialog, Popover, Tooltip, Select, Combobox, Tabs, RadioGroup, DropdownMenu | Shared state, IDs, roles and coordinated interaction across elements |
| Provider/manager | Provider plus independent child APIs when needed | Toast | Shared notification manager and live-region ownership |

**Namespace rule:** prefer `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title` etc. Also export named parts (`DialogRoot`, `DialogTrigger`, `DialogContent`) from documented entry points. Group objects MUST be defined without eagerly importing unrelated implementation families where that would harm tree-shaking. Components with a public standalone name MUST NOT introduce a redundant `Root` unless there is a compound form.

**Part naming:** Root, Trigger, Portal (if required), Overlay, Positioner, Content, Header, Title, Description, Footer, Close, Indicator, Item, ItemIndicator and Label only when meaningful; keep these words consistent across patterns. A part MUST document whether it creates an element, provides context, or controls rendering.

## 3. API spelling, naming, defaults and sizing

| Concern | Required API | Notes |
| --- | --- | --- |
| Visual treatment | `variant` | `solid`, `soft`, `outline`, `ghost`, `text`; per-component subset |
| Semantic intent | `tone` | `primary`, `neutral`, `success`, `warning`, `danger`, `info` where supported |
| Size | `size` | `sm`, `md`, `lg` (never overload with pixel numbers on controls) |
| Native disabled | `disabled` | Use actual native property where available |
| Read-only | `readOnly` | Only on relevant editable controls |
| Required | `required` | Native forms plus accessible indication |
| Invalid | `invalid` | Mirrors `aria-invalid` and `data-erx-invalid` where applicable |
| Pending | `loading` | Only where a component owns pending UI behavior, e.g., Button |
| Class/style | `class`, `style` | Use Solid conventions, not React-only `className` |
| Full-width | `fullWidth` | Components whose width can reasonably stretch |
| Logical positions | `start`, `end`, or named slots | Prefer logical start/end over physical left/right |

**Tone-to-colors contract:** `danger` maps to existing Iris error/destructive semantic tokens; `success`, `warning` and `info` likewise reuse existing color roles. `tone` is not a new palette; mapping belongs to each component's styling. Default Button: `variant="solid"`, `tone="primary"`; other components MUST define their own defaults explicitly in their reference page.

**Variant availability:** Button and IconButton MAY expose all five. Badge MAY support `solid`/`soft`/`outline`; TextField SHOULD expose only meaningful field treatments; dialogs and tooltips MUST NOT receive nonsensical button variants. An unsupported variant MUST be rejected by TypeScript, not ignored silently.

**Density:** nearest `data-erx-density` scope determines the default effective control size; explicit `size` wins. Effective control minimum heights: sm 32px, md 40px, lg 48px. Density MUST NOT alter typography scale, corner radii or semantic focus-ring geometry. Use the existing spacing CSS mapping rather than duplicating it in component JavaScript.

## 4. Controlled and uncontrolled state

| State family | Controlled prop | Initial uncontrolled prop | Change callback | Examples |
| --- | --- | --- | --- | --- |
| Visibility | `open` | `defaultOpen` | `onOpenChange(next: boolean)` | Dialog, Popover, Select menu |
| Binary choice | `checked` | `defaultChecked` | `onCheckedChange(next: boolean)` | Switch, Checkbox |
| Selection / value | `value` | `defaultValue` | `onValueChange(next: T)` | Tabs, Select, TextField |

**Ownership rule:** a defined controlled prop is authoritative. In controlled mode, user interaction MUST issue the change request but MUST NOT commit a contradictory local value. In uncontrolled mode, component-owned state changes first, then emits the semantic callback. A parent may reject an update by leaving the controlled prop unchanged. An already-equal requested value SHOULD NOT emit a duplicate callback.

**Initialization:** `default*` is read at first mount only. Changing it later MUST NOT reset the state. No change callback is emitted at initial mount/hydration or when the controlled prop changes from outside. If both `value` and `defaultValue` are specified, controlled behavior wins and development mode SHOULD warn. The same rule applies to `open` and `checked` families.

**Mode stability:** switching between controlled and uncontrolled ownership within a mounted instance is unsupported. For public props, `undefined` means uncontrolled and SHOULD NOT be used to represent a meaningful controlled selection value. Use a documented nullable value (`null`) or explicit empty value where needed. Warn on a mode switch in development builds.

**Callback semantics:** `onValueChange` conveys the proposed semantic value; native `onInput` and `onChange` remain separate, forwarded DOM events. Collection selection must specify equality and cardinality. `onValueChange` MAY include a documented metadata argument in a *later* ADR; do not invent varying metadata shapes per component.

**Hydration:** controlled and uncontrolled initial markup, generated IDs and ARIA relationships MUST be deterministic between server and client. Do not fire semantic callbacks while reconciling hydrated markup. Test with a real SSR consumer fixture.

## 5. SolidJS event contract

Solid uses native DOM events, with both delegated `onClick`-style and direct `on:click`-style attachment. Delegated handlers also support bound `[handler, data]` tuples. Library handler composition MUST preserve those calling conventions; do not assume every handler is a plain `(event) => void` callback.

**Default event policy:** for cancellable default actions such as opening a trigger or selecting an item, execute the consumer's native event callback first; if the event is cancelable and `event.defaultPrevented` is true, skip that default action. The library MUST perform invariant safety/cleanup work even when a default action is cancelled. Disabled or inert controls MUST short-circuit before consumer activation callbacks. A handler's return value MUST NOT imply cancellation; `preventDefault()` is authoritative.

**Do not fake native semantics:** a disabled `<button>` must use the native `disabled` attribute. An anchor is not a disabled button; explicitly suppress navigation, apply accessible disabled state and remove it from the tab sequence when the documented link-disabled API is used. Never leave a clickable `href` functioning while announcing disabled.

**Solid-specific details:** do not double-attach both delegated and direct handlers to the same logical action. Don't rebind delegated handlers as a way to track reactive callback props; use a stable wrapper that reads the latest prop at event time. Support externally supplied event tuples; retain proper `currentTarget` typing. Direct listeners, timers and global listeners MUST be cleaned up under their reactive owner.

**Native vs semantic callbacks:** a TextField MAY provide `onValueChange(text)` while also forwarding `onInput(event)` and `onChange(event)` unchanged. Selection primitives MUST document when a semantic callback is emitted relative to the native DOM event; avoid double emission for a single user action.

## 6. Refs, native attributes and DOM transparency

Every rendered root or meaningful compound part SHOULD forward an appropriately typed Solid `ref` to its actual DOM element. For example, `Button` forwards `HTMLButtonElement` and `Dialog.Content` forwards `HTMLDivElement` or the actual selected element type. `Icon` forwards `SVGSVGElement`. Callback refs MUST be composed when the library also needs its own element reference.

**DOM forwarding rules:** native `id`, `title`, `tabIndex`, `aria-*`, `data-*`, native event handlers, `class`, `style` and input-specific attributes MUST forward when valid for that element. Internal props (`variant`, `tone`, `size`, semantic state callbacks) MUST NOT leak as unknown native DOM attributes. Native and library-required ARIA relationships MUST be merged intentionally; do not overwrite consumer labeling without a documented reason or permit contradictory labels silently.

**Ref lifecycle:** do not read refs during server-side module evaluation. Do not promise that a DOM element exists before mounting. Internal ref composition MUST NOT silently drop the consumer's ref. A ref may be invoked by the renderer as part of mount/hydration; avoid assumptions about synchronous layout measurements.

**Children:** use Solid's `children` utility when child resolution is consumed more than once or lazily inspected. Avoid repeated direct `props.children` evaluation that could recreate content. Avoid unnecessary wrapper DOM elements; `Slot` helpers MUST not introduce hidden interactive elements.

## 7. Polymorphic rendering (selective `as`)

Initial scope: `Button` MAY render a native `<button>` (default) or `<a>` through `as="a"`. Allowing arbitrary components (e.g. router links), changing `as` after mount, or a universal `asChild` API is deferred until a typed adapter design and size/SSR benchmark are accepted. Polymorphism is never implied for `Dialog.Content`, TextField, Checkbox, etc.

| Rendered element | Required semantics | API restrictions |
| --- | --- | --- |
| `button` | Native button, keyboard activation, disabled state | Defaults `type="button"`; supports `type="submit"`/`"reset"` explicitly |
| `a` | Native link semantics and navigation | Requires `href`; must not receive button-only props such as `type` |
| Custom router component | Not in the v0.1 guaranteed contract | Future ADR after behavior/ref/type and packaging tests |

An anchor rendering MUST NOT automatically add `role="button"` or implement Space-key button behavior. If the consumer needs an action, render a button. A disabled anchor MUST prevent activation, report `aria-disabled`, and respect the project's keyboard/UX contract. TS discriminated unions SHOULD narrow `href`, `type`, `onClick` and ref types appropriately. Two static render branches MAY be cheaper than a general dynamic renderer and SHOULD be measured in the UL-04/UL-08 fixtures.

## 8. Slot, state and styling selectors

Each rendered, externally styleable part MUST have a stable public `data-erx-slot` attribute with a documented value. Examples: `root`, `trigger`, `content`, `title`, `description`, `indicator`, `icon-start`, `icon-end`, `item`. A single root can use `data-erx-slot="root"`; the component's public class/slot identity must still distinguish component families.

| Attribute | Contract |
| --- | --- |
| `data-erx-slot` | Part name; public and semver-governed |
| `data-erx-state` | Logical state, e.g. `open`, `closed`, `checked`, `unchecked`, `indeterminate`, `active` |
| `data-erx-presence` | Motion lifecycle only: `entering`, `open`, `exiting` when relevant |
| `data-erx-disabled` | Present with an empty value when disabled |
| `data-erx-invalid` | Present when invalid |
| `data-erx-loading` | Present when loading |
| `data-erx-size` | Resolved `sm`, `md`, or `lg`, not merely the optional input prop |
| `data-erx-variant` | Resolved supported variant |
| `data-erx-tone` | Resolved supported semantic tone |

**Never conflate:** `data-erx-state="closed"` may coexist briefly with `data-erx-presence="exiting"`; accessibility state must match the actual interaction state rather than animation opacity. `data-erx-*` attributes MUST NOT replace real native `disabled`, `aria-expanded`, `aria-checked`, etc. For state selector compatibility, do not silently rename to unprefixed `data-state` or `data-slot`.

**CSS layering:** use the shared `@layer erx.tokens`, `@layer erx.components` foundation. Any additional layer ordering must be defined by UL-05 and be consistent across packages. `--erx-` CSS custom properties are public only when documented; internal implementation variables should have their own non-public documentation/status. Theming is through static CSS and nested theme scopes; no runtime CSS-in-JS, no Tailwind requirement, no `!important` in shipped component styles. Prefer logical `margin-inline`, `padding-inline` and insets for RTL. `:focus-visible`, forced-colors and reduced-motion modes must remain functional under customization.

**Customization precedence:** consumer unlayered CSS normally takes precedence over library declarations in normal layered styles; specificity and origin still apply. Each component MUST publish its accessible part slots, state attributes, semantic component variables, and customization examples. A `classes` map MAY be added for multi-part non-compound components when direct part props are unavailable; it is not mandatory everywhere.

## 9. Accessible interaction contract

| Topic | Required policy |
| --- | --- |
| Native elements | Prefer native `<button>`, `<input>`, `<label>`, `<table>`, `<dialog>` when they satisfy the full behavior contract |
| Labels | Accessible name for every interactive control; IconButton named on the button |
| Keyboard | Document pattern-specific WAI-ARIA APG behavior and test it in all three browser engines |
| Disabled | Native disabled when available; never preserve activation for declared disabled controls |
| Loading | Keep the button label, expose pending semantics; busy state must not create a dead-end control |
| Forms | Associate label/help/error IDs using deterministic Solid-safe IDs; preserve native form submission semantics |
| Focus | Visible focus via Iris token, not shadow/glow; restore focus following overlay dismissal |
| Modality | Enforce focus containment/inertness only in the behavior layer; visual scrim does not implement modality |
| Feedback | Do not communicate status solely with tone or icon; use semantic text and roles |
| Hit target | Preserve approved control sizes and offer a suitable >=44px option for demanding contexts |

Target **WCAG 2.2 AA** for documented compositions. APG examples and native browser semantics are behavioral references, not evidence of conformance. Use automated axe checks **and** manual screen-reader sessions where required.

## 10. Localization, direction and IME

**Labels:** all built-in UI strings (e.g., close, clear, loading, selected count) MUST be overrideable. Do not hardcode application-specific copy into general components. Prefer a locale/direction provider with per-component overrides for built-in labels. Consumers own business text and persistence.

**Direction:** respect nearest `dir` and logical CSS properties. Navigation arrows, roving focus, horizontal slider interaction and overlay placement must follow their pattern-specific RTL contract. Do not automatically mirror nondirectional icons (search, settings, brand). Any directional icon mirroring follows ERX-DS-ICON-001. Never infer LTR/RTL from translated strings alone.

**IME:** text inputs and comboboxes MUST avoid committing selection, tokenization or premature search navigation during active IME composition; test East Asian input methods and Hebrew/RTL text. Preserve native input event semantics. Theme changes, density switches and locale changes SHOULD NOT remount controlled fields or discard composition state.

## 11. SolidJS 2 implementation rules

1. Components MUST preserve reactive prop access with `props.key`, `splitProps`, `mergeProps` or appropriate accessors. Arbitrary destructuring of reactive props is prohibited.
2. Components SHOULD keep state derivations in signals/memos and use effects only for external synchronization, DOM work and lifecycle management.
3. No DOM globals (`window`, `document`, `HTMLElement`, `ResizeObserver`, etc.) at module top level. Initialize browser listeners only when mounted and clean them up.
4. Internal behavior helpers SHOULD be `create*` primitives with accessors and prop getters. They MUST register cleanup with `onCleanup` where needed and not install listeners at import time.
5. Compound components SHOULD use typed context for coordinated state and ARIA IDs, with an informative development error for parts rendered outside a required root.
6. Favor compile-time static JSX for common DOM structures; benchmark any general dynamic renderer. A Button-only import MUST avoid overlay, positioning and collection code.
7. Ensure CSS is included in distribution: the current repository has `sideEffects: false`; UL-08 MUST verify that static stylesheet entry points survive consumer bundling and consider CSS-aware `sideEffects` entries.
8. Use the currently declared SolidJS 2 peer dependencies and test against the minimum and latest supported peer versions, including `@solidjs/web`.

## 12. TypeScript public interfaces (reference)

The exact renderer-provided intrinsic prop types should be confirmed against the installed Solid 2 peer range. The intended discriminated API is:

```tsx
import type { JSX } from 'solid-js';

type EroxoSize = 'sm' | 'md' | 'lg';
type EroxoVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text';
type EroxoTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface StyledControlOptions {
  size?: EroxoSize;
  variant?: EroxoVariant;
  tone?: EroxoTone;
  class?: string;
  style?: JSX.CSSProperties | string;
}

// Native element props must narrow with the rendered element.
type ButtonButtonProps = StyledControlOptions & {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children?: JSX.Element;
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'>;

type ButtonAnchorProps = StyledControlOptions & {
  as: 'a';
  href: string;
  disabled?: boolean; // Eroxo-managed semantic disabled state
  children?: JSX.Element;
} & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

type ButtonProps = ButtonButtonProps | ButtonAnchorProps;
```

The example is an **API sketch**, not a guarantee that every DOM attribute collision and element-specific `ref` inference is already correctly modeled. The implementation kit supplies isolated reference utilities and an example Button for integration and compiler validation.

## 13. Reference markup and semantics

```tsx
// Atomic with semantic styling
<Button variant="soft" tone="primary" size="md">Save</Button>

// Controlled
<Switch checked={enabled()} onCheckedChange={setEnabled} />

// Uncontrolled; defaultOpen read only on mount
<Dialog.Root defaultOpen={false}>
  <Dialog.Trigger>Preferences</Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Title>Preferences</Dialog.Title>
    <Dialog.Description>Update your settings.</Dialog.Description>
    <Dialog.Close>Close</Dialog.Close>
  </Dialog.Content>
</Dialog.Root>

// Public slot styling
<Dialog.Content class="app-dialog-content">...</Dialog.Content>

// Link semantics, not fake-button semantics
<Button as="a" href="/dashboard" variant="text">Dashboard</Button>
```

A compound Dialog example in this document expresses public anatomy, **not** a complete implementation. Native `<dialog>`/Popover API, top layer, focus management, escape dismissal, presence and inertness are evaluated and implemented by the behavior milestones, not generated implicitly by JSX nesting.

## 14. API compatibility and release governance

**Public contract includes:** package exports and subpaths, component/part names, TS props and defaults, semantic callback signatures, documented `data-erx-*` selectors, public CSS variables and style hooks, documented keyboard interactions and accessibility behavior. Changing public slots or state attribute values is a compatibility change even when TypeScript signatures remain identical.

**Non-public:** internal contexts, helper file paths, private CSS selectors, effect scheduling details, unexported signals and unannounced attributes. Avoid encouraging consumers to depend on them.

**Deprecation policy:** during 0.x, every breaking change MUST carry a migration note, versioned changelog entry and an explicit owner decision. After 1.0, follow semantic versioning; do not remove a public alias without a documented deprecation period unless correcting a security/accessibility emergency. Any exceptions should state impacted consumers and supported migration steps.

**Package integration:** component-specific export paths, correct `types`/`solid`/`node`/`default` conditions, CSS stylesheet exports, tree-shaking and the `sideEffects` metadata need independent verification in Vite SPA and Vite SSR fixtures; do not assume those already work because source tests pass.

## 15. Validation matrix and release gates

| Area | Minimum verifiable acceptance |
| --- | --- |
| API shape | Type-tests accept valid props and reject invalid `variant`, `size`, wrong `as` combinations |
| Reactive behavior | Controlled parent reactivity and uncontrolled updates behave without remounts |
| Callbacks | One semantic event per action; zero events on initial mount/hydration; external handler cancellation respected |
| Event tuples | Plain and Solid `[handler, data]` callbacks have correct arguments |
| Refs | Correct native element reference; user and internal refs both receive the element |
| Native semantics | Button defaults `type="button"`; anchor retains link behavior; disabled anchor cannot navigate |
| Parts | Stable `data-erx-slot`, size, variant, tone, disabled and invalid attributes |
| CSS | Token/theme/slot overrides work; no `!important`; nested themes remain isolated |
| Accessibility | Keyboard, focus, labels, axe scans, manual screen-reader protocol, touch and forced colors |
| RTL/IME | RTL directional interaction and East Asian composition tests |
| SSR | Import-safe on server, deterministic HTML and hydrated interaction without warnings |
| Packaging | Consumer fixtures load CSS; Button import excludes overlay engine; peer matrix green |
| Browsers | Playwright Chromium, Firefox and WebKit, 200% zoom and small viewport checks |

**Local kit checks** verify a subset only (contract JSON, pure TypeScript helpers and reference CSS). Solid JSX integration, browser, SSR and accessibility checks MUST run in the actual library consumer fixtures before any production claim.

## 16. Implementation sequence and outstanding engineering gates

1. **UL-04/UL-05:** validate native-first behavior, selective polymorphism and Solid packaging; settle ADRs if evidence contradicts this draft.
2. **UL-06:** publish API conventions, naming and lint rules; add contract tests for shared vocabulary.
3. **UL-07/UL-08:** set up strict TypeScript, CSS cascade export, published artifact tests, proper CSS side-effect metadata.
4. **UL-09:** establish three-browser, SSR, accessibility and test harness before building complex behavior.
5. **UL-15/UL-19:** implement state/event/ref utilities and five-layer styling contract; verify theme scopes and public slots.
6. **UL-20 onward:** apply the contract per component, publish props/parts/keyboard tables, maintain migration notes.

**Outstanding implementation decisions (not blocking the design document):** (a) exact grouped-export bundling strategy, (b) literal Button `as` typing and router adapter policy, (c) native vs delegated event composition in each primitive, (d) CSS side-effect/export layout. These require evidence, not another visual-design questionnaire.

## 17. Source references and design provenance

- Eroxo UI: `docs/ui-library-roadmap.md`, UL-04, UL-05, UL-06, UL-08, UL-09, UL-15, UL-19, UL-20, UL-25; `docs/ul-01-charter.md`; `package.json` (reviewed 23 Nov 2026).
- SolidJS documentation: [Props](https://docs.solidjs.com/concepts/components/props), [on* event handlers](https://docs.solidjs.com/reference/jsx-attributes/on_), [Refs](https://docs.solidjs.com/reference/jsx-attributes/ref), [Dynamic rendering](https://docs.solidjs.com/reference/solid-web/components/dynamic/), [Context](https://docs.solidjs.com/concepts/context).
- W3C: [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Related Eroxo visual foundations: Color, Typography, Spacing & Sizing, Shape & Borders, Elevation & Depth, Motion & Interactions, Iconography (v0.1).

**Approval note:** The four architecture/design choices are locked by the owner. The technical conventions in this document are accepted defaults subject to verification against Solid 2 and final ADRs. This artifact intentionally does not modify the GitHub repository.
