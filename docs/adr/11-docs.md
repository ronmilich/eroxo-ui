# Documentation technology

## Context

UL-11 needs searchable static pages, examples that run in Solid and versioned deployment. The library already has a Vite playground.

## Decision

Build a private Vite documentation app with Markdown compiled to static HTML at build time and Solid 2 islands for interactive examples. Keep the public package independent of the docs stack. Examples import public package entries and styles. Generate the search index from built pages and publish immutable versioned docs for stable releases.

## Alternatives and consequences

A SolidStart application would currently introduce a Solid peer conflict. Making every page client-rendered would add JS to prose pages. UL-11 owns the Markdown pipeline, example hydration, page template, preview deployment and search verification.

## Publishing and versioning

`pnpm build:docs` builds the library and the static docs. `pnpm test:docs` checks the built site under a project URL prefix with Chromium. The deployable website is in `dev/dist`, and the npm tarball includes the matching Markdown, metadata and example sources under `dist/docs`.

GitHub Pages serves the development preview from `main`. Pull request checks attach an optional static preview artifact. Extract it and serve the directory over HTTP to use the example and search.

For stable releases, build from the matching release tag and publish the complete static output under `/v/<version>/`. Keep each version's HTML, search index and agent files together. Links are relative so each snapshot works at its own prefix. Publish any latest-version alias separately so it can move while release snapshots stay immutable.

[UL-05 status and evidence](README.md)
