Render SVG artwork with consistent dimensions.

## Example

{{example}}

## When to use

Use Icon for a decorative glyph beside text or a named image that conveys meaning on its own.

## When not to use

Use IconButton for an interactive graphic.

## Props

{{props}}

## Keyboard

{{keyboard}}

## Accessibility

The root is an SVG. Supply its paths as children, pass a matching `viewBox`, and add `label` when the image conveys meaning on its own. Native SVG attributes, class, style and refs are forwarded.

## Styling hooks

`.erx-icon`. `data-erx-size`.

{{styling}}

## Common mistakes

Match the viewBox to the artwork so paths keep their intended proportions.
