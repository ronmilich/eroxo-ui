# Package structure

## Context

A Button-only consumer needs a small dependency graph. All components share the same styling contract and release cadence.

## Decision

Publish one ESM package, `eroxo-ui`, with named root exports and explicit component subpaths such as `eroxo-ui/button`. Root and subpath imports resolve to the same underlying modules, contexts and types. Keep internal modules outside the exports map. Ship the initial themes and icon wrapper with the core.

## Alternatives and consequences

One package per component would multiply releases and peer constraints. A root-only API would hide import boundaries. UL-08 tests both forms in one application and checks that importing Button excludes overlays.

[UL-05 status and evidence](README.md)
