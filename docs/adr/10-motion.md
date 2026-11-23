# Motion and presence

## Context

Overlay exits must finish predictably across rapid toggles, reduced motion and disposal. UL-04 measured the native dialog and bounded CSS animation approach.

## Decision

Use CSS transitions for ordinary state changes and keyframes for entry. Manage delayed unmount in a private presence primitive. Cancel stale completion handlers on reversal, ignore infinite animations and cap waiting at the finite animation deadline. Reduced motion and disposal complete cleanup promptly. Hydration starts from the requested state without replaying entry.

## Alternatives and consequences

A motion runtime adds weight and a second lifecycle. Relying on an end event alone can leave an overlay mounted. UL-25 verifies cancellation, focus restoration and live motion preference changes, and settles the explicit entering phase identified in D11.

[UL-05 status and evidence](README.md)
