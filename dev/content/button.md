Run an action, submit a form, or navigate to a real destination.

## Example

{{example}}

## When to use

Use a native button for actions. Set `as="a"` and supply `href` for navigation, including links intercepted by a client router. The link accepts native anchor attributes and an `HTMLAnchorElement` ref. The default button accepts button attributes and an `HTMLButtonElement` ref.

For a router that intercepts native same-origin anchors, render `<Button as="a" href="/account">Account</Button>`. For an imperative router, attach its navigation callback to the anchor. Preserve modifier-click behavior so users can open the destination in a new tab.

```tsx
<Button as="a" href="/account" onClick={event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(event.currentTarget.pathname)
}}>Account</Button>
```

## When not to use

For an on/off setting, use a checkbox or switch so the current state is announced.

## Props

{{props}}

Native attributes, `class`, `style`, `children`, and the element ref pass through. The `as` prop defaults to `button`. Set `as="a"` with a required `href` for links. A native button defaults to `type="button"`.

## Keyboard

{{keyboard}}

## Accessibility

Loading keeps the accessible name and sets `aria-busy`. Both loading and disabled controls suppress activation. Use `focusableWhenDisabled` when keyboard users need to discover a disabled control.

## Styling hooks

`.erx-button`, `.erx-button__label`, `.erx-button__start-icon`, `.erx-button__end-icon`, `.erx-button__spinner`. `data-erx-variant`, `data-erx-tone`, `data-erx-size`, `data-erx-shape`, `data-erx-disabled`, `data-erx-loading`, `data-erx-full-width`.

{{styling}}

## Common mistakes

Use `type="submit"` for an intentional form submission. Use a link for a destination.
