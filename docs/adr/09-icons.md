# Icon source and packaging

## Context

Iris D7 selects Lucide and defines distinct standalone and in-control sizes.

## Decision

Vendor only the selected, version-pinned Lucide SVG paths. Record the source revision and notice for each asset. Use the library’s `Icon` wrapper for sizing, current color, decorative hiding and labelled graphics. Controls supply their semantic size. UL-20 settles precedence for explicit icon sizes.

## Alternatives and consequences

A runtime icon package would add an external dependency. Drawing a full set would introduce a second visual vocabulary. Review the vendored subset with each update and check that a Button import retains only its required assets.

[UL-05 status and evidence](README.md)
