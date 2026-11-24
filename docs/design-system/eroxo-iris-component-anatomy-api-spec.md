# Eroxo Iris — Component Anatomy & API Conventions

**Specification ID:** ERX-DS-COMPONENT-001  
**Version:** 0.4.0\
**Decision date:** 23 November 2026, amended 24 November 2026  
**Status:** Approved by the owner for UL-06\
**Owner:** Eroxo UI  
**Target:** SolidJS 2, TypeScript, ESM, SSR, static CSS, WCAG 2.2 AA

> **0.4.0 (24 November 2026)** makes Select and Combobox data-first (§2) and adds the agent conventions (§11.1), from the owner's decisions in the [product strategy](../product-strategy.md) review.

> **0.3.0 (23 November 2026)** resolves the UL-06 questions in the [Iris reconciliation](reconciliation.md). The [architecture decisions](../adr/README.md) govern build, CSS delivery and native overlays.

> **Normative language:** MUST and MUST NOT are contractual requirements; SHOULD is a strong default; MAY is optional. This is a design baseline, not evidence that an implementation has passed production verification. The companion ZIP is not yet in the repository; it is a reference implementation, not a complete accessible component library.

## 1. Executive decision record

| Dimension | Approved contract |
| --- | --- |
| Architecture | **Hybrid:** single-component API for atomic controls; compound components for multi-part interactive patterns; Select and Combobox are data-first, with optional parts (0.4.0) |
| Visual variants | Shared vocabulary: `solid`, `soft`, `outline`, `ghost`, `text` (only meaningful variants per component) |
| Semantic style | `variant`, `tone`, `size`; named component-specific props only when necessary |
| Size | `sm`, `md`, `lg`; inherited density selects default; explicit size overrides density |
| Polymorphism | **Selective** `as`, with element-specific types and semantics; never universal on all components |
| Customization | Documented CSS variables, stable part classes (`erx-<component>`, `erx-<component>__<part>`), `class` and `style`; library parts are identified by class |
| State | `open/defaultOpen/onOpenChange`, `checked/defaultChecked/onCheckedChange`, `value/defaultValue/onValueChange` |
| SolidJS conventions | Preserve reactive props; native event behavior; ref forwarding; `onSettled` and `onCleanup`; SSR-safe modules |
| Public stability | Exports, TypeScript signatures, documented parts/slots/state attributes and CSS variables are versioned |
| Behavior ownership | In-house behavior primitives; no required third-party headless UI framework |
| Default appearance | Eroxo Iris foundations; 1.0 ships styled components only |

This is the UL-06 rulebook for component authors and the CSS contract that TaoTale can consume through TAO-09/10. UL-19 verifies customization against shipped components.

**Foundation dependencies:** ERX-DS-COLOR-001, ERX-DS-TYPE-001, ERX-DS-SPACE-001, ERX-DS-SHAPE-001, ERX-DS-DEPTH-001, ERX-DS-MOTION-001 and ERX-DS-ICON-001. This specification consumes their tokens; it does not redefine their values.

## 2. Scope, vocabulary and component categories

**This specification owns:** naming, anatomy rules, public prop vocabulary, native attribute forwarding, state control, event composition, refs, styling hooks, slot and state selectors, polymorphism guardrails, accessibility interfaces, RTL/i18n conventions, SSR/performance obligations, tests and versioning.

**This specification does not implement:** focus containment, modality, positioning, pointer/keyboard collection navigation, live-region orchestration, overlay top-layer sequencing, responsive visual designs or actual component-specific behavior. Those are implemented and tested by their own milestones.

| Category | API default | Examples | Reason |
| --- | --- | --- | --- |
| Atomic | Single JSX component | Button, IconButton, Icon, Spinner, Badge, Separator, Skeleton, Progress | One obvious semantic root and few meaningful parts |
| Structured | Named optional parts; a convenience root MAY exist | Card, Field, Alert, Table, EmptyState | Rich layout with replaceable content and styling parts |
| Interactive composition | Compound parts required; Select and Combobox are data-first (below) | Dialog, AlertDialog, Popover, Tooltip, Select, Combobox, Tabs, RadioGroup, DropdownMenu | Shared state, IDs, roles and coordinated interaction across elements |
| Provider/manager | Provider plus independent child APIs when needed | Toast | Shared notification manager and live-region ownership |

**Data-first collections (0.4.0).** Select and Combobox MUST take an `items` collection as their source of truth. With no parts, `Root` MUST render the default parts, as in `<Select.Root items={countries} />`; parts customize how the same items render, in one implementation. DropdownMenu, Tabs, RadioGroup and ToggleGroup keep registered JSX children. UL-17 builds one keyboard and typeahead core for both.

**Namespace rule:** prefer `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title` etc. Also export named parts (`DialogRoot`, `DialogTrigger`, `DialogContent`) from documented entry points. Group objects MUST be defined without eagerly importing unrelated implementation families where that would harm tree-shaking. Components with a public standalone name MUST NOT introduce a redundant `Root` unless there is a compound form.

**Part naming:** Root, Trigger, Overlay, Positioner, Content, Header, Title, Description, Footer, Close, Indicator, Item, ItemIndicator and Label only when meaningful; keep these words consistent across patterns. A part MUST document whether it creates an element, provides context, or controls rendering.

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

### Treatment and intent by component

| Component | Variants | Tones and defaults |
| --- | --- | --- |
| Button, IconButton | `solid`, `soft`, `outline`, `ghost`, `text` | All six tones. Default Button is solid primary. Default IconButton is ghost neutral and requires an accessible name. |
| Badge, Chip, Tag | `solid`, `soft`, `outline` | All six tones. Default is soft neutral. |
| Alert / Callout, Toast | Fixed feedback treatment | Default neutral. Also accept success, warning, danger and info. Announce status with text and appropriate semantics. |
| AlertDialog, DropdownMenu.Item | Fixed overlay / item treatment | Default neutral. Use `danger` for a destructive confirmation or menu action. |
| Other 1.0 components | Fixed treatment | Use the component's semantic roles, such as field borders and invalid state, link colors, or overlay surfaces. Any additional style axis requires a documented change to this table. |

The following names are suffixes of `--erx-color-`. The status family `S` is `success`, `warning`, `error` (public tone `danger`) or `info`. A slash separates fill and foreground.

| Variant | Primary | Neutral | Status |
| --- | --- | --- | --- |
| solid | primary / on-primary | secondary / on-secondary, secondary-border | S / on-S |
| soft | item-selected / item-selected-text | secondary / on-secondary (Badge uses neutral-badge-bg / neutral-badge-text) | S-soft / S-text |
| outline | transparent / link, item-selected-border | transparent / on-secondary, border-interactive | transparent / S-text, S-border |
| ghost | transparent / link | transparent / on-ghost | transparent / S-text |
| text | transparent / link | transparent / on-secondary | transparent / S-text |

Solid actions use the fill family's hover and pressed roles. Soft, outline and ghost actions use ghost-hover and ghost-pressed surfaces, retaining their tone foreground. Text actions retain a transparent fill, underline on interaction and use link-hover for primary. Soft and text actions have no visible resting border. Passive badges have no activation states. Always use the focus-ring role for keyboard focus and the disabled roles on disabled controls. UL-13 checks contrast across themes and surfaces, including boundaries that identify a control. Render supported axes as `data-erx-variant` and `data-erx-tone`. Public types reject unsupported combinations.

**Density:** nearest `data-erx-density` scope determines the default effective control size; explicit `size` wins. Effective control minimum heights: sm 32px, md 40px, lg 48px. Density MUST NOT alter typography scale, corner radii or semantic focus-ring geometry. Use the existing spacing CSS mapping rather than duplicating it in component JavaScript.

## 4. Controlled and uncontrolled state

| State family | Controlled prop | Initial uncontrolled prop | Change callback | Examples |
| --- | --- | --- | --- | --- |
| Visibility | `open` | `defaultOpen` | `onOpenChange(next: boolean)` | Dialog, Popover, Select menu |
| Binary choice | `checked` | `defaultChecked` | `onCheckedChange(next: boolean)` | Switch, Checkbox |
| Selection / value | `value` | `defaultValue` | `onValueChange(next: T)` | Tabs, Select, TextField |

**Ownership rule:** a defined controlled prop is authoritative. In controlled mode, user interaction MUST issue the change request but MUST NOT commit a contradictory local value. In uncontrolled mode, component-owned state changes first, then emits the semantic callback. A parent may reject an update by leaving the controlled prop unchanged. An already-equal requested value SHOULD NOT emit a duplicate callback.

**Close vetoes:** a close request (Escape, outside press, the Close part) calls `onOpenChange(false)`; a controlled parent that keeps `open` true vetoes it, and the dialog stays fully interactive and modal. Vetoes are best effort, because browsers may close a dialog on a repeated Escape without a cancelable `cancel` event; UL-25 verifies them.

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

Every rendered root or meaningful compound part SHOULD forward an appropriately typed Solid `ref` to its actual DOM element. For example, `Button` forwards `HTMLButtonElement`, and `Dialog.Content`, the part that renders the native `<dialog>`, forwards `HTMLDialogElement` and carries the `erx-dialog` class that the scroll-lock rule targets. `AlertDialog.Content` forwards the same element type with its own `erx-alert-dialog` class. The document selector is `html:has(.erx-dialog:modal, .erx-alert-dialog:modal)`. `Icon` forwards `SVGSVGElement`. Callback refs MUST be composed when the library also needs its own element reference.

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

An anchor rendering MUST NOT automatically add `role="button"` or implement Space-key button behavior. If the consumer needs an action, render a button. A disabled anchor MUST prevent activation, report `aria-disabled`, and respect the project's keyboard/UX contract. TS discriminated unions SHOULD narrow `href`, `type`, `onClick` and ref types appropriately. Two static render branches MAY be cheaper than a general dynamic renderer and SHOULD be measured in the UL-08 fixtures.

## 8. Slot, state and styling selectors

Each rendered, externally styleable part MUST have a stable public class with a documented name: `erx-<component>` on the root and `erx-<component>__<part>` on parts, for example `erx-button`, `erx-button__label`, `erx-dialog`. These classes are versioned public API, as approved in UL-04. Part-name examples: `trigger`, `content`, `title`, `description`, `indicator`, `icon-start`, `icon-end`, `item`. Use the stable class for part selection. Library components do not emit a parallel `data-erx-slot` attribute. Consumer-provided data attributes still forward to the element.

| Attribute | Contract |
| --- | --- |
| `data-erx-state` | Logical state, e.g. `open`, `closed`, `checked`, `unchecked`, `indeterminate`, `active` |
| `data-erx-presence` | Motion lifecycle only: `entering`, `open`, `exiting` when relevant |
| `data-erx-disabled` | Present with an empty value when disabled |
| `data-erx-invalid` | Present when invalid |
| `data-erx-loading` | Present when loading |
| `data-erx-size` | Explicit `sm`, `md` or `lg` only. Omit when size is inherited from the density scope |
| `data-erx-variant` | Resolved supported variant |
| `data-erx-tone` | Resolved supported semantic tone |
| `data-erx-side` | Resolved physical placement after positioning, RTL and collision correction |
| `data-erx-density` | Density scope attribute; values per ERX-DS-SPACE-001 |

**Never conflate:** `data-erx-state="closed"` may coexist briefly with `data-erx-presence="exiting"`; accessibility state must match the actual interaction state rather than animation opacity. `data-erx-*` attributes MUST NOT replace real native `disabled`, `aria-expanded`, `aria-checked`, etc. For state selector compatibility, do not silently rename to unprefixed `data-state` or `data-slot`.

**CSS layering:** use the shared `@layer erx.tokens`, `@layer erx.components` foundation; every library stylesheet starts with the order statement `@layer erx.tokens, erx.components;`. Any additional layer ordering must be defined by UL-05 and be consistent across packages. `--erx-` CSS custom properties are public only when documented. Components read them with a fallback at the declaration site, for example `var(--erx-button-bg, var(--erx-color-primary))`, and never declare a public `--erx-<component>-*` variable on their own element. Internal implementation variables use private `--_erx-*` names and should have their own non-public documentation/status. Theming is through static CSS and nested theme scopes; no runtime CSS-in-JS, no Tailwind requirement, no `!important` in shipped component styles. Prefer logical `margin-inline`, `padding-inline` and insets for RTL. `:focus-visible`, forced-colors and reduced-motion modes must remain functional under customization.

**Token ownership.** Foundation names start with their family (for example `--erx-color-primary` and `--erx-control-height-md`). Scope-owned density aliases always begin with `--erx-density-`, such as `--erx-density-card-padding`. Reserve `--erx-<component>-<property>` for a consumer override read at its use site. For example, Card can read `var(--erx-card-padding, var(--erx-density-card-padding))`. Prefer a shared semantic role or a part class first. Allow up to four documented override hooks per component family. An additional hook needs a recorded use case and owner approval. UL-12 inventories foundation tiers and literals in the token source.

**Customization precedence:** consumer unlayered CSS normally takes precedence over library declarations in normal layered styles; specificity and origin still apply. Each component MUST publish its part classes, state attributes, semantic component variables, and customization examples. A `classes` map MAY be added for multi-part non-compound components when direct part props are unavailable; it is not mandatory everywhere.

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

1. Components MUST preserve reactive prop access with `props.key`, `omit`, `merge` or appropriate accessors. Read local props directly, as `props.variant`. `omit(props, "variant", "size")` returns the props without those keys (the keys are variadic, or a predicate), and `merge(...sources)` lets the right-most source win; both are imported from `solid-js`. `splitProps` and `mergeProps` don't exist in Solid 2. Arbitrary destructuring of reactive props is prohibited.
2. Components SHOULD keep state derivations in signals/memos and use effects only for external synchronization, DOM work and lifecycle management.
3. No DOM globals (`window`, `document`, `HTMLElement`, `ResizeObserver`, etc.) at module top level. Initialize browser listeners only when mounted and clean them up.
4. Internal behavior helpers SHOULD be `create*` primitives with accessors and prop getters. They MUST run DOM-dependent setup and teardown in `onSettled` (returning its cleanup), register owner-disposal cleanup with `onCleanup` where needed, and not install listeners at import time.
5. Compound components SHOULD use typed context for coordinated state and ARIA IDs, with an informative development error for parts rendered outside a required root.
6. Favor compile-time static JSX for common DOM structures; benchmark any general dynamic renderer. A Button-only import MUST avoid overlay, positioning and collection code.
7. Ensure CSS is included in distribution: the current repository has `sideEffects: false`; UL-08 MUST verify that static stylesheet entry points survive consumer bundling and consider CSS-aware `sideEffects` entries.
8. Use the currently declared SolidJS 2 peer dependencies and test against the minimum and latest supported peer versions, including `@solidjs/web`.

### 11.1 Agent conventions (0.4.0)

Coding agents are a first-class consumer of every public API.

1. Public names SHOULD use the vocabulary coding agents already know from Radix, Base UI, Ark and Kobalte: `Root`, `Trigger`, `Content`, `open`/`onOpenChange`, `value`/`onValueChange`. The docs MUST publish a mapping for developers coming from shadcn, Radix or Kobalte.
2. Public props MUST use literal unions where the values are enumerable and MUST NOT use `any`. Every public prop MUST have JSDoc with a description, its default and a short example. Types SHOULD enforce required accessible names, so that an IconButton without a label fails to type-check.
3. Development warnings MUST use one format: `[eroxo-ui] <Component>: <problem>. <fix>. <docs URL>.md`.
4. Docs and examples MUST style through `--erx-*` tokens and documented hooks, never hard-coded values. In Tailwind projects they SHOULD use the theme-aware utilities from the opt-in `eroxo-ui/tailwind.css` bridge.
5. Docs SHOULD show one pattern per task, and deprecated aliases MUST NOT appear in examples.

## 12. TypeScript public interfaces (reference)

The exact renderer-provided intrinsic prop types should be confirmed against the installed Solid 2 peer range. The intended discriminated API is:

```tsx
import type { JSX } from '@solidjs/web';

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
  href?: never;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children?: JSX.Element;
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'>;

type ButtonAnchorProps = StyledControlOptions & {
  as: 'a';
  type?: never;
  href: string;
  disabled?: boolean; // Eroxo-managed semantic disabled state
  children?: JSX.Element;
} & Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'type'>;

type ButtonProps = ButtonButtonProps | ButtonAnchorProps;
```

The example is an **API sketch**, not a guarantee that every DOM attribute collision and element-specific `ref` inference is already correctly modeled. The implementation kit, not yet in the repository, is to supply isolated reference utilities and an example Button for integration and compiler validation.

## 13. Reference markup and semantics

```tsx
// Native form and ref forwarding. The browser submits the form after onClick.
<Button type="submit" variant="soft" tone="primary" ref={saveRef} onClick={onSaveClick}>
  Save
</Button>

// Solid calls recordAction("settings", event) for this bound handler.
<Button onClick={[recordAction, "settings"]}>Settings</Button>

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

// The parent can keep the modal open until changes have been saved.
<Dialog.Root open={open()} onOpenChange={next => { if (next || !dirty()) setOpen(next) }}>
  <Dialog.Trigger>Edit profile</Dialog.Trigger>
  <Dialog.Content class="app-dialog-content" ref={dialogRef}>
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description>Review and save your changes.</Dialog.Description>
    <Dialog.Close>Close</Dialog.Close>
  </Dialog.Content>
</Dialog.Root>

// Link semantics, not fake-button semantics
<Button as="a" href="/dashboard" variant="text">Dashboard</Button>
```

A compound Dialog example in this document expresses public anatomy, **not** a complete implementation. Native `<dialog>`/Popover API, top layer, focus management, escape dismissal, presence and inertness are evaluated and implemented by the behavior milestones, not generated implicitly by JSX nesting.

## 14. API compatibility and release governance

**Public contract includes:** package exports and subpaths, component/part names, TS props and defaults, semantic callback signatures, documented `data-erx-*` selectors, public CSS variables and style hooks, documented keyboard interactions and accessibility behavior. Changing public slots or state attribute values is a compatibility change even when TypeScript signatures remain identical.

**Non-public:** internal contexts, helper file paths, private CSS selectors, effect scheduling details, unexported signals and unannounced attributes. Avoid encouraging consumers to depend on them.

**Deprecation policy:** during 0.x, every breaking change MUST carry a migration note, versioned changelog entry and an explicit owner decision. After 1.0, follow semantic versioning; do not remove a public alias without a documented deprecation period unless correcting a security/accessibility emergency. Any exceptions should state impacted consumers and supported migration steps.

**Package integration:** ship preserved JSX under the `solid` export condition, plus compiled DOM and SSR builds compiled as hydratable; in UL-04, non-hydratable compiled builds rendered but never hydrated, with no warning. The `node` condition selects SSR and `browser` selects DOM as specified in ADR 03. UL-08 validates both in packed consumer fixtures. Component-specific export paths, correct `types`/`solid`/`node`/`default` conditions, CSS stylesheet exports, tree-shaking and the `sideEffects` metadata need independent verification in Vite SPA and Vite SSR fixtures; do not assume those already work because source tests pass.

## 15. Validation matrix and release gates

| Area | Minimum verifiable acceptance |
| --- | --- |
| API shape | Type-tests accept valid props and reject invalid `variant`, `size`, wrong `as` combinations |
| Reactive behavior | Controlled parent reactivity and uncontrolled updates behave without remounts |
| Callbacks | One semantic event per action; zero events on initial mount/hydration; external handler cancellation respected |
| Event tuples | Plain and Solid `[handler, data]` callbacks have correct arguments |
| Refs | Correct native element reference; user and internal refs both receive the element |
| Native semantics | Button defaults `type="button"`; anchor retains link behavior; disabled anchor cannot navigate |
| Parts | Stable part classes; size, variant, tone, disabled and invalid attributes |
| CSS | Token/theme/slot overrides work; no `!important`; nested themes remain isolated |
| Accessibility | Keyboard, focus, labels, axe scans, manual screen-reader protocol, touch and forced colors |
| RTL/IME | RTL directional interaction and East Asian composition tests |
| SSR | Import-safe on server, deterministic HTML and hydrated interaction without warnings |
| Packaging | Consumer fixtures load CSS; Button import excludes overlay engine; peer matrix green |
| Browsers | Playwright Chromium, Firefox and WebKit, 200% zoom and small viewport checks |

Run `pnpm lint` before submitting a component. Oxlint checks directly authored JSX data attributes and literal size, variant and tone names in library source. Stylelint checks the layer-order declaration, class and data-selector spelling, custom property names and references, and forbidden `!important` in `src/**/*.css`. The package manifest check requires the root and explicit flat kebab-case JS or CSS entries with targets under `./dist/`. Wildcards, internal entry points and source paths fail. `pnpm test:conventions` exercises accepted and rejected examples. Component milestones verify runtime behavior, dynamic attributes, contrast and CSS inheritance in the fixtures above.

## 16. Decision and consequences

Keep a single styled API in 1.0. Atomic controls expose their native root, and compound parts expose coordinated state and individually styleable elements. A universal polymorphic root or headless switch would require separate accessibility and typing contracts for each rendering path. Stable part classes already identify each styleable element, so a second part selector would add another public name to maintain. A distinct density prefix lets a consumer change an entire scope or override one component independently. Separate modal classes let Dialog and AlertDialog evolve their styling while sharing the browser's modal scroll lock.

The owner approved these decisions on 23 November 2026. [TT-035 records the TaoTale handoff](https://github.com/ronmilich/taotale/commit/0426446). UL-08 verifies export resolution and CSS delivery, UL-14 implements shared utilities, UL-19 verifies the customization contract and UL-25 tests nested native dialogs and focus restoration.

The owner amended these decisions on 24 November 2026 (version 0.4.0): Select and Combobox are data-first, and the agent conventions in §11.1 apply to every component.

## 17. Source references and design provenance

- Eroxo UI: `docs/ui-library-roadmap.md`, UL-04, UL-05, UL-06, UL-08, UL-09, UL-15, UL-19, UL-20, UL-25; `docs/ul-01-charter.md`; `package.json` (reviewed 23 Nov 2026).
- SolidJS documentation: [Props](https://docs.solidjs.com/concepts/components/props), [on* event handlers](https://docs.solidjs.com/reference/jsx-attributes/on_), [Refs](https://docs.solidjs.com/reference/jsx-attributes/ref), [Dynamic rendering](https://docs.solidjs.com/reference/solid-web/components/dynamic/), [Context](https://docs.solidjs.com/concepts/context).
- W3C: [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Related Eroxo visual foundations: Color, Typography, Spacing & Sizing, Shape & Borders, Elevation & Depth, Motion & Interactions, Iconography (v0.2.0).

## Remaining verification

- UL-12 inventories and validates foundation tokens against the grammar in §8.
- UL-25 verifies modal scroll lock and the entering presence phase against the supported browser matrix.
- The optional reference kit mentioned in earlier revisions has not been integrated. The contract and repository checks above are usable independently of that kit.
