Indicate that an operation is in progress.

## Example

{{example}}

## When to use

Use Spinner alongside a status message while the application fetches, saves or computes a result.

## When not to use

Use a determinate progress indicator when a percentage is available.

## Props

{{props}}

## Keyboard

{{keyboard}}

## Accessibility

The status text defaults to Loading. Supply a localized `label` or use `decorative` when a parent already communicates progress. Rotation stops with reduced motion.

## Styling hooks

`.erx-spinner`.

{{styling}}

## Common mistakes

Inside a loading Button, let the control render its decorative spinner to avoid duplicate announcements.
