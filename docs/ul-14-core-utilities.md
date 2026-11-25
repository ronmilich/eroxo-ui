# UL-14 Core component utilities

These utilities are internal. The [authoring rules](design-system/eroxo-iris-component-anatomy-api-spec.md) define state ownership, DOM forwarding, and native button and link behavior. HTML supplies keyboard activation, navigation, focus, and native disabled behavior. The utilities leave those behaviors to the chosen element and preserve native `preventDefault()` semantics. They implement no additional ARIA APG keyboard pattern.

## State ownership

`createControllableState<T>(options)` returns a value accessor and a function that requests a new value. Pass the current `value` and `onChange` as getters when they come from reactive props. The `component` and `prop` fields identify the source of warnings. `prop` selects the public `value`, `open`, or `checked` vocabulary.

- A defined `value` takes precedence. Use `undefined` for uncontrolled state and `null` for a controlled empty value if the component supports it.
- `defaultValue` is read once. `fallback` supplies the initial uncontrolled value when the default is omitted.
- Equal requests use `Object.is` and are ignored. An uncontrolled request writes to Solid's signal before invoking `onChange`, with normal Solid scheduling for reactive readers. Duplicate uncontrolled requests in the same batch are ignored. A controlled request calls `onChange` and leaves the state update to the parent.
- Mounts, hydration, and external prop changes emit no semantic change request. Ownership changes are unsupported and produce a development warning. Initialization warns when both controlled and default values are supplied.

## DOM forwarding

- Read component-owned props directly. Use Solid's `omit(props, ...keys)` to forward native props and `merge(defaults, forwarded)` for fallback props. Keep getters intact and handle composed refs and events explicitly so a prop spread cannot overwrite them.
- `composeRefs<T>(...refs)` accepts Solid refs for one element type. It calls each callback in order and handles nested ref arrays. Solid compiles an assignment ref into a callback and invokes the composed ref when it has an element.
- `composeEventHandlers(() => props.onClick, action)` returns a stable handler that reads the latest consumer callback. It calls plain handlers with the native event and bound handlers with `(data, event)`. Both receive the original event and the element as `this`. The default action runs unless a cancelable event was prevented. Components handle disabled activation before calling this wrapper and keep mandatory cleanup outside the default action.
- `ButtonOrAnchorProps<OwnProps>` combines component props with typed native props and refs. Use two static JSX branches. The button is the default and should set `type="button"` unless the caller requests submit or reset. The anchor requires `href`, excludes the button `type`, and retains native link behavior. Keep `as` stable for the instance's lifetime.

## SSR and diagnostics

- Call `createElementId(() => props.id)` once inside the component's Solid owner. Its accessor returns a supplied ID or a stable, `erx-`-prefixed Solid ID. Use the same accessor for `id` and its `for` or ARIA reference. Call it in the same order on server and client.
- Guard browser-only work with `isServer` from `@solidjs/web` when a universal path needs the check. Defer browser setup to the owner lifecycle and register cleanup there. The utilities install no listeners or timers, and the development ownership effect is disposed with its owner.
- `warnInDevelopment(component, problem, fix, docs?)` emits `[eroxo-ui] <Component>: <problem>. <fix>. <docs URL>.md`. Pass problem and fix text without terminal periods. Put diagnostic-only computation behind `import.meta.env.DEV` so the production build removes both the work and the messages.

Unit tests cover state requests, diagnostics, reactive props, refs, event composition, and polymorphic types. The private conformance fixture exercises SSR hydration, native keyboard activation, cancellation, nested theme scopes, and portal disposal in Chromium, Firefox, and WebKit. The same fixture checks production client and server output for warning strings.
