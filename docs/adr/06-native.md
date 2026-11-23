# Native platform and fallback policy

## Context

The spike exercised focus, dismissal, scrolling and positioning in Chromium, Firefox and WebKit, plus tablet touch behavior.

## Decision

Use semantic native form controls. Use `showModal()` for modal stacking, focus containment and background inertness, native cancel for Escape and a trigger fallback for focus restoration. Lock document scrolling with a scoped modal selector, including AlertDialog. Use manual popovers for non-modal top-layer content. Preserve DOM ancestry and theme scope. Implement outside interaction, tooltip timing, roving focus, typeahead, listbox/menu/combobox keys and placement in house. Provide JS geometry for collision, arrow and text-range anchors.

## Alternatives and consequences

A portal stack would duplicate top-layer behavior. Native anchor positioning had a WebKit placement failure in the spike. Adopt new platform features only after the support matrix passes the same behavioral checks. UL-24–26 exercise nested dismissal, repeated Escape, classic scrollbar layout shift and zoom.

[UL-05 status and evidence](README.md)
