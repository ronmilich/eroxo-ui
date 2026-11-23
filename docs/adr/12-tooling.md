# Node and package manager

## Context

The repository already has a pnpm lockfile and CI on Node 26. Replacing the package manager would change both dependency resolution and fixture installation.

## Decision

Use pnpm 12.21.0 as pinned in `packageManager`, frozen installs in CI, Node 26 for CI, and the existing contributor Node ranges (`^22.22.2 || ^24.15.0 || >=26`). Track future tool upgrades with lockfile changes and a complete package/fixture check. Consumers install the published package with their own package manager.

## Alternatives and consequences

A floating pnpm version or regenerated npm lockfile makes local and CI resolution harder to compare. UL-07 shares the workspace settings across private projects; UL-08 tests a tarball in an isolated consumer.

[UL-05 status and evidence](README.md)
