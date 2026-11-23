# Internal behavior layer

## Context

TT-032 assigns accessible interaction to the library. Dialog and Tooltip share some mechanics but have different modality and focus requirements.

## Decision

Organize private Solid/TypeScript modules by interaction, focus, layering and dismissal, positioning, presence, and collections. Components compose the modules and own their semantic markup. Bind listeners, timers and observers to the active owner and release them on close, cancellation or disposal. Keep DOM access out of module initialization and SSR.

## Alternatives and consequences

Wrapping a headless toolkit conflicts with TT-032. A public headless entry would commit internal APIs before multiple components have exercised them. Reconsider a separately versioned headless surface at UL-52. Test primitives independently and through their public components.

[UL-05 status and evidence](README.md)
