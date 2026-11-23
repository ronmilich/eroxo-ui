# UL-01 · Product charter

On 23 November 2026 the owner approved the final charter, including the market scan, free 1.0 catalog, TaoTale design partnership and success measures. The catalog is frozen. Changes follow the approval process below.

## Who we serve

A SolidJS team should be able to install a button today and a keyboard-accessible dialog tomorrow, give both its own visual identity, and ship them with SSR. Eroxo UI supplies the default styling, interaction behavior and tests. The application supplies accessible labels, content, routing, persistence and business rules. TaoTale is the first design partner. Its transcript, audio player, Quiet Study theme and language-specific workflows stay in the application.

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

## Approved free 1.0 catalog

| Area | Included |
|---|---|
| Foundation | Button, IconButton, Icon, Spinner, Field, Label, TextField, Textarea, Checkbox, Switch, RadioGroup, ToggleGroup, Badge/Chip/Tag, Card, Separator, Skeleton |
| Overlays | Tooltip, Popover, Dialog, AlertDialog, DropdownMenu |
| Selection and navigation | Select, Combobox/Autocomplete, Tabs, Pagination |
| Feedback | Alert, Toast, Progress, EmptyState |
| Design-partner needs | Slider, semantic Table primitives, FileDropzone with a keyboard-accessible file input |
| System | Light, dark and custom themes, scoped tokens through portals, CSS distribution, ESM, declarations and SSR. Solid 2 requires the solid-js and @solidjs/web runtime peers. |

After 1.0, evaluate Drawer/Sheet, navigation menus, breadcrumbs, context menus, accordion, collapsible, hover card, sortable or virtualized data views, number and date inputs, token interchange, a design kit, public headless exports and advanced component offerings. The owner will revisit the commercial model after the initial free release. To change the approved catalog, record the proposed addition or removal, consumer evidence, cost, affected releases and owner approval in this charter.

## How we measure success

- For each public component, record keyboard coverage in Chromium, Firefox and WebKit, automated accessibility results and a manual screen-reader check. Target WCAG 2.2 AA for documented compositions. Publish outstanding failures and limitations with the conformance report.
- Measure compressed JS and CSS separately for Button alone and an overlay-heavy consumer. Capture the first published-package baseline, then set and enforce per-entry budgets in UL-43. A Button import must exclude the overlay engine.
- TaoTale installs registry releases in its consumer fixture. At UL-31 verify theming, portals, SSR and focus restoration. At release review, record the installed version, adoption blockers, and voluntary reports of independent production use. Collect these signals outside the components.
- Ship the same free catalog to TaoTale and other consumers. Record a generic reproduction for partner defects and verify the fix against the next registry build.

The component list reconciles TaoTale design specification §4.1 with [UL-20 through UL-45](ui-library-roadmap.md#phase-p5--foundation-components).
