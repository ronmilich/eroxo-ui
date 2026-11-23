# Repository and prerelease consumption

## Context

TaoTale needs reproducible builds while Eroxo UI follows its own release schedule.

## Decision

Keep `ronmilich/eroxo-ui` standalone. Use a pnpm workspace within it for the public package, private docs, fixtures and tooling. TaoTale consumes exact published npm versions and commits its lockfile. Its first component gate is the verified UL-20 release (planned `0.1.0`). Use a specific published RC for an agreed RC trial. Earlier `0.0.0-canary.*` builds and local tarballs serve library validation only.

## Alternatives and consequences

A shared monorepo or Git/path dependencies would speed coordinated edits but let consumers bypass the packaged exports and CSS. With separate repositories, fixes travel through a versioned release. TAO-04 can establish the dependency policy before it installs anything.

[UL-05 status and evidence](README.md)
