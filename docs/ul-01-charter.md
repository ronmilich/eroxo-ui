# UL-01 · Product charter

On 23 November 2026 the owner approved the final charter, including the market scan, free 1.0 catalog, TaoTale design partnership and success measures. The catalog is frozen. Changes follow the approval process below.

On 24 November 2026 the owner amended the charter with decisions from the [product strategy](product-strategy.md) review: the audience, a Solid 2 recheck of the market scan, four catalog additions, the 1.0 launch kit and an agent-readiness measure.

## Who we serve

A SolidJS team should be able to install a button today and a keyboard-accessible dialog tomorrow, give both its own visual identity, and ship them with SSR. Eroxo UI supplies the default styling, interaction behavior and tests. The application supplies accessible labels, content, routing, persistence and business rules. TaoTale is the first design partner. Its transcript, audio player, Quiet Study theme and language-specific workflows stay in the application. Eroxo's public materials do not feature TaoTale; the SaaS starter's live demo and the blocks gallery are the showcase.

**Audience (owner decision, 24 November 2026).** Curious developers are the launch audience and startups are the adoption audience. When their needs differ:

- Curious developers decide first-impression choices: the look, setup, docs, playground and launch content.
- Startups decide product choices: coverage, stability, upgrades, forms and data.
- In a real conflict, stability in the package wins. Novelty belongs in demos, blocks and docs.
- Coding agents are a first-class consumer of every API, so each API choice also follows the agent conventions in the [component rulebook](design-system/eroxo-iris-component-anatomy-api-spec.md).

Enterprises are not a target before 1.0. The cheap foundations already decided stay: cascade layers, the `erx` prefix, scoped themes, accessibility evidence, semver, and no network requests or telemetry.

## Market scan

Checked 23 November 2026. Dates are the latest default-branch commit observed on GitHub. All five repositories were unarchived. Commit activity is a maintenance signal; compatibility with Solid 2 needs an independent test.

| Project | What adopters receive | Licence | Latest commit observed |
|---|---|---|---|
| Kobalte | Unstyled accessible primitives for Solid. Teams supply the visual system. | MIT | [7 Sep 2026](https://github.com/kobaltedev/kobalte/commit/675b4a11f4f074007c98b47a573760a1b60849ff) |
| Ark UI | Headless components across frameworks, including Solid. Teams style the parts. | MIT | [23 Nov 2026](https://github.com/chakra-ui/ark/commit/831c8ea279431ffb22d793e912eeee4cebee429a) |
| corvu | Unstyled Solid primitives for controls such as dialogs and drawers. | MIT | [31 Oct 2026](https://github.com/corvudev/corvu/commit/4bd466c980588e9d02eabaa145755eb45a383f1d) |
| shadcn-solid | Styled component source using Tailwind and headless primitives. The consumer maintains its copy. | MIT | [13 Feb 2026](https://github.com/hngngn/shadcn-solid/commit/4c75b892148dc81f81167a43756d4ce0fbfe6eae) |
| SUID | Solid implementations of Material UI components. A fit for teams seeking the Material API and design vocabulary. | MIT | [5 Jul 2025](https://github.com/swordev/suid/commit/c5902c2605b86dcbb3440a30fe5a9cee00129a7a) |

Our proposed gap is a versioned, styled Solid package with ordinary CSS, five documented customization layers (tokens, theme scopes, variants, slots/state, direct overrides), and a first-party behavior implementation. Wrapping a headless toolkit would reduce initial development. TT-032 assigns keyboard interaction, focus, collections, layering, positioning and presence to this library. That makes behavior and its cross-browser verification the largest 1.0 investment. Prefer native HTML where it meets the interaction contract. Use APG and platform specifications to design independent tests. [WAI-ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) · [HTML Standard](https://html.spec.whatwg.org/)

### Solid 2 recheck · 24 November 2026

`solid-js` 2.0.0 was published on 17 November 2026. The Solid 2.0 announcement retired SolidStart; its replacement is Start mode in `@solidjs/vite-plugin`. No styled component package supports Solid 2 yet. [Product strategy §3.1](product-strategy.md#31-solid-2-and-its-ui-ecosystem) lists the sources.

| Project | Solid 2 status |
|---|---|
| Kobalte | `2.0.0-alpha.5` supports Solid 2; the stable 0.13 line is Solid 1 |
| Ark UI | 5.40 imports `solid-js/web`, which Solid 2 removed |
| corvu | Solid 1; its Solid 2 branch has stalled since February 2025 |
| shadcn-solid | Solid 1, built on Kobalte |
| SUID | Solid 1 |
| UI SDK (Vercel Labs, Apache-2.0) | New since the first scan: unstyled, built for Solid 2, beta since 12 November 2026 |

UI SDK joins the scan for completeness. The owner decided on 24 November 2026 not to review it; TT-032 stands, and Eroxo builds its behavior layer in-house.

## Approved free 1.0 catalog

| Area | Included |
|---|---|
| Foundation | Button, IconButton, Icon, Spinner, Field, Label, TextField (including styled native date and time inputs), Textarea, Checkbox, Switch, RadioGroup, ToggleGroup, Badge/Chip/Tag, Avatar, Card, Separator, Skeleton, layout primitives (Stack, Inline, Grid, Container) |
| Disclosure | Accordion, Collapsible |
| Overlays | Tooltip, Popover, Dialog, AlertDialog, Drawer, DropdownMenu |
| Selection and navigation | Select, Combobox/Autocomplete, Tabs, Pagination |
| Feedback | Alert, Toast, Progress, EmptyState |
| Design-partner needs | Slider, semantic Table primitives, FileDropzone with a keyboard-accessible file input |
| System | Light, dark and custom themes, scoped tokens through portals, CSS distribution, ESM, declarations and SSR. Solid 2 requires the solid-js and @solidjs/web runtime peers. |

**1.0 launch kit (owner decisions, 24 November 2026).** The 1.0 launch also ships:

- a theme builder, and a SaaS starter with a live demo;
- copy-and-own blocks, including an application shell and a command menu, installed with `npx shadcn add` or copied from the docs;
- an opt-in Tailwind v4 bridge (`eroxo-ui/tailwind.css`); Tailwind is never required;
- the agent kit: Markdown docs inside the package, `npx eroxo-ui agents-md`, an Agent Skill and consumer lint rules.

After 1.0, evaluate touch gestures and full-screen variants for overlays, navigation menus, breadcrumbs, context menus, hover card, sortable or virtualized data views, number inputs and a DatePicker, token interchange, a design kit, public headless exports and advanced component offerings. The owner will revisit the commercial model after the initial free release. To change the approved catalog, record the proposed addition or removal, consumer evidence, cost, affected releases and owner approval in this charter.

### Scope changes

| Change | Consumer evidence | Cost | Affected releases | Approval |
|---|---|---|---|---|
| Add Avatar | Startup screens show users in menus, lists and comments ([strategy §4.2](product-strategy.md#42-startups-adoption-audience)) | Small; no behavior layer | UL-23 | Owner, 24 November 2026 |
| Add layout primitives | Agents need a layout vocabulary instead of ad-hoc CSS, and startups need consistent spacing ([strategy §6.1](product-strategy.md#61-core-library)) | Small; CSS with token gaps, and new props in the UL-06 vocabulary | UL-23 | Owner, 24 November 2026 |
| Add Drawer | Mobile navigation and side panels; the application-shell block needs it | Small to medium; a side-anchored Dialog, with touch gestures left to UL-46 | UL-29a | Owner, 24 November 2026 |
| Add Accordion and Collapsible | Settings, filter and FAQ sections; Solid developers miss a complete styled kit ([strategy §3.1](product-strategy.md#31-solid-2-and-its-ui-ecosystem)) | Small; native `<details>` | UL-23a | Owner, 24 November 2026 |

The owner will decide before the launch whether to run developer interviews. Until then, the research in the product strategy serves as the consumer evidence.

## How we measure success

- For each public component, record keyboard coverage in Chromium, Firefox and WebKit, automated accessibility results and a manual screen-reader check. Target WCAG 2.2 AA for documented compositions. Publish outstanding failures and limitations with the conformance report.
- Measure compressed JS and CSS separately for Button alone and an overlay-heavy consumer. Capture the first published-package baseline, then set and enforce per-entry budgets in UL-43. A Button import must exclude the overlay engine.
- TaoTale installs registry releases in its consumer fixture. At UL-31 verify theming, portals, SSR and focus restoration. At release review, record the installed version, adoption blockers, and voluntary reports of independent production use. Collect these signals outside the components.
- Ship the same free catalog to TaoTale and other consumers. Record a generic reproduction for partner defects and verify the fix against the next registry build.
- Agent readiness: CI enforces that every public prop is documented and every docs example compiles. Each agent mistake found in real use is fixed in the docs, the API or the component's "Common mistakes" section by the next minor release. There are no automated AI test runs (owner decision, 24 November 2026).

The component list reconciles TaoTale design specification §4.1 with [UL-20 through UL-45](ui-library-roadmap.md#phase-p5--foundation-components).
