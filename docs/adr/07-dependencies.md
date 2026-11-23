# Dependency policy

## Context

Solid 2 separates its web renderer from its reactive runtime. Duplicate runtime instances would break shared ownership.

## Decision

Keep `solid-js` and `@solidjs/web` as the only runtime peers, both `^2.0.3`. Accept the web renderer as the explicit Solid 2 exception to the earlier single-peer assumption. Build, lint, documentation and test dependencies stay in development or private workspace packages. Require an ADR for an additional runtime dependency.

## Alternatives and consequences

Bundling a runtime would simplify installation but risks duplication. Depending on positioning or headless libraries contradicts the approved behavior ownership. UL-07 checks the manifest allow-list and UL-08 inspects the packed module graph.

[UL-05 status and evidence](README.md)
