# UL-16 Interaction primitives

These internal helpers implement native event handling and focus traversal for future widgets. Native buttons and links retain their browser activation semantics. The private fixture uses a custom button to exercise the WAI-ARIA button keyboard pattern. [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) · [Pointer Events](https://www.w3.org/TR/pointerevents3/)

## Press, capture, hover and modality

Call `createPress({ onPress, disabled, onLongPress, longPressMs })` under a Solid owner and spread its handlers on one custom actionable element. The component supplies its role, accessible name and tab stop. Pass a getter for reactive disabled state. Enter requests activation on keydown and Space requests it on keyup. A virtual click supports assistive technology. Pointer-generated clicks and repeated keys do not duplicate the action.

Only a primary pointer's main button starts a press. Press captures that pointer and activates on release inside the element. Moving more than 10 CSS pixels, leaving the bounds, cancellation, capture loss, blur, a disabled transition or disposal ends the gesture. A long press is opt-in, defaults to 500 ms, and consumes the short press. The timer exists only during the pending gesture. For drag controls, `capturePointer(element, pointerId)` returns a release callback. The caller owns drag state and handles `pointercancel` and `lostpointercapture`.

`createHover()` returns a reactive `hovered` accessor and enter, leave and cancel handlers. It checks hover capability in the element's window and accepts mouse or hovering pen input. When combining hover and press, call both cleanup handlers for shared event types.

Create `createInputModality(getDocument?)` once per application document under a Solid owner. Its accessor distinguishes keyboard, touch and other pointing devices. Capture listeners start after mount and are removed on disposal. Use native `:focus-visible` with the Iris `erx-focus-ring` class. For a widget that moves focus after keyboard input, set the presence attribute `data-erx-focus-visible` on its focus target while modality is keyboard. This supplements the native focus indicator.

## Keyboard and composition

`normalizedKey(event)` maps legacy key names to DOM key values. `widgetKey(event, guard?)` returns a key for an unmodified widget command. It yields `undefined` for handled events, text-entry targets, modified shortcuts and IME keystrokes. The widget decides which keys it owns. `horizontalStep(key, element)` maps Left and Right to -1 or +1 using the element's computed direction, including scoped RTL. Other keys return `undefined`.

Give each editable control a `createCompositionGuard()`. Wire its start and end handlers to the native composition events and reset it on blur. Check `isComposing(event?)` before filtering or pointer selection and `blocksKey(event)` before accepting a keyboard command. Let the browser edit the input throughout composition. Final input can be processed after composition ends. The guard suppresses the confirming key in the same event-loop turn, and recognizes the browser's `isComposing`, `Process` and key code 229 signals. Disposal clears pending work.

## Focus and logical containment

`getFocusable(root)` returns rendered, focusable descendants in composed-tree order, including programmatic negative tab stops. `getTabbable(root)` returns sequential stops with positive tabindex priority within navigation scopes. Both inspect open shadow roots and assigned slot content. Native disabled controls, inert or hidden subtrees, and invisible elements are excluded. Named radio groups use the checked member, or the first eligible member in the query when none is checked. Roots may be documents, elements or shadow roots. Embedded documents and closed shadow internals require a scope supplied by their owner. [HTML focus navigation](https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation)

`focusFirst(root)`, `focusLast(root)` and `focusNext(root, from, backwards?)` return whether focus moved successfully. Moving beyond a boundary returns false. `isInsideLayerTree(target, roots)` checks composed ancestry against the explicit roots belonging to a logical layer. Include each portal mount or remote subtree that belongs to that layer.

## Verification

The fixture covers keyboard and touch activation, actual pointer capture, long press, cancelled movement, focus queries, portal containment, RTL commands and Chinese and Korean composition sequences. Unit tests cover teardown, disabled transitions, capture loss, repeated keys and same-turn IME termination.

Manual Chinese and Korean IME verification is pending. Build and open the fixture with the following commands, then visit `/interaction/` on the preview server.

```sh
pnpm build
node --input-type=module -e "import { buildPrimitiveFixture } from './test/browser/primitive-fixture.mjs'; await buildPrimitiveFixture(process.cwd(), 'interaction', { styles: true })"
pnpm exec vite preview --host 127.0.0.1
```

In **Compose**, use a Chinese IME to select a candidate. Repeat with a Korean IME while forming a Hangul syllable. During composition, verify that native editing continues and the filtered and committed outputs stay unchanged. Confirm a candidate and verify that the confirming key leaves the widget selection unchanged. A subsequent deliberate Enter should commit the final input. Also cancel composition with Escape and verify native cancellation and focus. Record the OS, browser, IME and observed behavior for each run.
