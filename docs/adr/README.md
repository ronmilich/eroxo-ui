# UL-05 · Architecture decisions

**Status on 23 November 2026.** All twelve records approved by the owner. The owner authorized UL-05 to proceed with UL-03 legal matters deferred. These decisions describe the target for later implementation milestones.

1. [Repository and prerelease consumption](01-repository.md)
2. [Package structure](02-package.md)
3. [Build toolchain and exports](03-build.md)
4. [CSS authoring and delivery](04-css.md)
5. [Internal behavior layer](05-behavior.md)
6. [Native platform and fallback policy](06-native.md)
7. [Dependency policy](07-dependencies.md)
8. [Framework, browser and assistive technology support](08-support.md)
9. [Icon source and packaging](09-icons.md)
10. [Motion and presence](10-motion.md)
11. [Documentation technology](11-docs.md)
12. [Node and package manager](12-tooling.md)

The [UL-04 spike](../ul-04-spike.md) supplies consumer and browser evidence. The [Iris reconciliation](../design-system/reconciliation.md) supplies the approved design constraints. UL-08 verifies the production package against the chosen contracts.

## Handoff to TAO-04

[TT-034 records the accepted handoff](https://github.com/ronmilich/taotale/commit/588b823). Develop Eroxo UI in its own repository. Keep the TaoTale application in its existing repository and import only published public entries of `eroxo-ui`. Pin exact registry versions before 1.0. Internal canaries validate the library pipeline. TAO-09 first integrates the verified UL-20 release, planned as `0.1.0`. Record the version actually installed when the gate is reached. UL-07 remains the separate sequencing gate for TAO-04.
