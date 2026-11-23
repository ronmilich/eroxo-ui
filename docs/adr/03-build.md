# Build toolchain and exports

## Context

The spike observed silent hydration failure with compiled, non-hydratable output. JSX-aware Vite consumers took the Solid condition.

## Decision

Use Vite, the official Solid 2 Vite plugin and TypeScript. Emit preserved JSX, hydratable compiled DOM and hydratable compiled SSR ESM, JS source maps and declarations for each public JS entry. Order conditions from types to solid to browser to node to default. The default serves DOM ESM. Browser and node branches can share their respective compiled artifacts between development and production. Development diagnostics come from the consumer’s Solid runtime and JSX transform. Externalize both Solid peers and their subpaths.

## Alternatives and consequences

JSX alone requires a consumer compiler. Compiled output alone removes the consumer’s Solid transform. UL-08 must pack and install both a Vite SPA and a direct SSR consumer, verify the selected entry, hydrate existing markup and exercise an event. Test a Node-hosted DOM runner with browser resolution explicitly selected. Keep direct Node SSR imports free of unhandled CSS imports.

[UL-05 status and evidence](README.md)
