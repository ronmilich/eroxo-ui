# Documentation technology

## Context

UL-11 needs searchable static pages, examples that run in Solid and versioned deployment. The library already has a Vite playground.

## Decision

Build a private Vite documentation app with Markdown compiled to static HTML at build time and Solid 2 islands for interactive examples. Keep the public package independent of the docs stack. Examples import public package entries and styles. Generate the search index from built pages and publish immutable versioned docs for stable releases.

## Alternatives and consequences

A SolidStart application would currently introduce a Solid peer conflict. Making every page client-rendered would add JS to prose pages. UL-11 owns the Markdown pipeline, example hydration, page template, preview deployment and search verification.

[UL-05 status and evidence](README.md)
