# Contributing to Eroxo UI

Core contributions are submitted under MIT. Sign off each commit with `git commit -s` after reading the [Developer Certificate of Origin 1.1](https://developercertificate.org/). The sign-off certifies your right to submit the work under the indicated licence. Contributors retain copyright.

Follow the [component authoring rulebook](docs/design-system/eroxo-iris-component-anatomy-api-spec.md) for public props, styling and exports. Run `pnpm lint` and `pnpm test` before submitting.

Open a pull request against `main`. The `build` check installs the frozen workspace, checks formatting, runs strict type checks and tests, and builds the library and docs. The [dependency policy](docs/adr/07-dependencies.md) permits only the two required Solid peers at runtime. Package changes that extend the allow-list need an accepted ADR and a corresponding change to the check. Follow the [code of conduct](CODE_OF_CONDUCT.md) in project discussions.

For interaction changes, include the public specification and a test that demonstrates the expected keyboard, focus or pointer behavior. Write the implementation independently. If you adapt existing code or assets, disclose their source, revision, licence, notices and what changed in the pull request. The reviewer must confirm compatibility, update NOTICE and verify that the packed artifact contains all required notices before merging. Apply the same process to icons, fonts and generated code that ships with the package.

Use the [screen-reader protocol and keyboard harness](docs/screen-reader-protocol.md) for new patterns. The required `build` check collects the source quality job and both packed-consumer jobs. A failing coverage threshold, keyboard row, axe scan or fixture assertion blocks the merge. CI uploads HTML and LCOV reports for library source and a size report for each peer tier.
