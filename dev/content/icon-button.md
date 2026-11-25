Run a familiar action represented by a glyph.

## Example

{{example}}

## When to use

Supply `aria-label` or `aria-labelledby` on the control. Use a decorative graphic inside. Use `size="lg"` for a 48 px target.

## When not to use

Use Button when readers need a visible label to understand the action.

## Props

{{props}}

Native attributes, `class`, `style`, `children`, and the element ref pass through. The `as` prop defaults to `button`. Set `as="a"` with a required `href` for links. A native button defaults to `type="button"`.

## Keyboard

{{keyboard}}

## Accessibility

Loading keeps the accessible name and sets `aria-busy`. Both loading and disabled controls suppress activation. Use `focusableWhenDisabled` when keyboard users need to discover a disabled control.

## Styling hooks

`.erx-icon-button`, `.erx-icon-button__label`, `.erx-icon-button__start-icon`, `.erx-icon-button__end-icon`, `.erx-icon-button__spinner`. `data-erx-variant`, `data-erx-tone`, `data-erx-size`, `data-erx-shape`, `data-erx-disabled`, `data-erx-loading`, `data-erx-full-width`.

{{styling}}

## Common mistakes

Give the control its own accessible name even when its SVG already has a title.
