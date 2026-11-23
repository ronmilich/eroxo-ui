# CSS authoring and delivery

## Context

UL-04 packed two CSS candidates into SPA and SSR fixtures. Layered CSS supported stable selectors and overrides across the three engines; the CSS Modules candidate produced different class names under different compilers.

## Decision

Author ordinary CSS and process it with Lightning CSS at build time. Begin every sheet with `@layer erx.tokens, erx.components;`. Client component entries bring their styles and share a single token sheet through the module graph. Export `eroxo-ui/tokens.css` for tokens alone and `eroxo-ui/styles.css` for the complete stylesheet, including components, suitable for a server-rendered document. Keep public token imports aggregated across families. Expose per-component CSS as `eroxo-ui/button.css` and equivalent entries. Mark CSS as side-effectful in package metadata when CSS ships.

## Alternatives and consequences

Requiring a single global import would ship unused component styles. Family-specific token sheets add public ordering and dependency contracts. UL-08 must prove default styling from one Button import, no Dialog CSS in that fixture, first-paint CSS in SSR, a single copy of tokens in the production bundle, and working consumer overrides. The spike proved the delivery modes; automatic token inclusion and the final export names still need those fixtures.

[UL-05 status and evidence](README.md)
