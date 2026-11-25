Apply a color scheme, custom theme or density to a Solid subtree.

## Example

{{example}}

## When to use

Wrap a page or region to select its theme. Pass `root` on the outermost scope to apply it to the document.

## When not to use

For a single style override, set a documented component hook on the element.

## Props

{{props}}

## Keyboard

{{keyboard}}

## Accessibility

Verify text and focus contrast when changing semantic colors.

## Styling hooks

The root class is `.erx-theme-scope`. Use `data-erx-theme` and `data-erx-density` to identify the scope.

{{styling}}

## Common mistakes

When supplying a controlled color scheme, update it from `onColorSchemeChange`.
