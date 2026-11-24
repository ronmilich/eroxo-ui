Hello renders a greeting from the `to` prop. It uses “World” when no initial name is provided.

## Example

Change the name to see the greeting update. Switch the theme to see how the same example responds to CSS variables.

{{example}}

## When to use

Use Hello to verify that a Solid app can import and style an Eroxo UI component.

## When not to use

Use ordinary text for application copy and a live region when your interface needs to announce dynamic updates.

## Props

{{props}}

## Keyboard

{{keyboard}}

## Accessibility

Hello renders ordinary text and adds no focus stops or announcements. The example labels its name field. Changes to the greeting are visible and are not announced automatically.

## Styling hooks

{{styling}}

## Common mistakes

- Pass a name such as `"Iris"` to `to`. The component adds “Hello” and the exclamation mark.
- Set `--erx-hello-color` on an ancestor of the greeting to change its color.
