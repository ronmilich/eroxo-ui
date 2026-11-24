# UL-03 · Licence and initial release model

**Owner decision, 23 November 2026.** Everything shipped for the initial release is free. The library uses the MIT licence and Developer Certificate of Origin sign-off for contributions. The owner will decide the longer-term business model after the initial release. This supersedes the earlier preference for paid Pro components. The owner also approved the complete free 1.0 catalog in the [charter](ul-01-charter.md). A later change to that commitment requires a recorded scope decision.

## Options for the post-release review

| Option | Distribution | Trade-off to evaluate |
|---|---|---|
| Permissive core with services or add-ons | Free public npm package. Services sold by agreement. MIT is the current grant. Apache-2.0 is an alternative for future work with express patent terms. | Broad adoption. Service revenue depends on capacity to deliver support or integration. |
| Open core with paid components | Keep the core on public npm and deliver separately licensed add-ons through an authenticated registry. | Adds entitlement management, separate packaging, support and licence terms. |
| Dual licensing | Offer the same code under copyleft or a commercial agreement. | Requires rights to make both grants, including appropriate contributor agreements. A DCO alone does not grant relicensing rights. |
| Source-available commercial licensing | Distribute eligible future code and source under commercial terms through controlled access. | Adds procurement and redistribution restrictions. Prior MIT grants on distributed copies continue to apply. |

Review actual installations, requests for support, demand for features and maintenance cost after the first release. Any proposal must identify the affected future work, ownership and contributor rights, distribution channel, support cost and customer terms. [MIT](https://opensource.org/license/mit) · [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) · [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Distribution and support

The target is one free public npm package, `eroxo-ui`. Keep every initial-release component available under MIT. There is no Pro SKU, paid support tier, entitlement service, component licence check or telemetry in the initial offering. Proposed support for 1.0 is public issues and best-effort fixes, with private handling for security reports. Revisit support commitments if the owner later changes the model.

## Implementation, contribution and attribution

Start a behavior change with a public specification, an observable requirement and an independently written failing test. For an intentional adaptation, the contributor identifies the original file, revision, copyright notice, licence and changes. A maintainer checks compatibility, preserves notices and puts the required text in the distributed artifact. Hold material with unclear provenance for review. Check vendored code, icons, fonts, samples and output injected by build tools. Track development-only tools separately from shipped assets. [Contribution rules](../CONTRIBUTING.md) · [Current notice](../NOTICE)

Contributors sign the DCO and retain their rights. The owner has not identified a designated individual or company as copyright holder for new project work. Preserve the starter's notice and each contributor's attribution pending clarification. Use Eroxo UI to describe compatibility or contribution accurately. Obtain permission for official logos or claims of sponsorship or endorsement. Apply the same rule to the SolidJS name and logo.

## Counsel and design-partner handoff

The owner has not identified counsel or confirmed an appointment. On 24 November 2026 the owner moved the counsel review into UL-45's final legal review, which lets UL-03 close; the review must finish before `1.0.0` is published. This replaces the earlier deadline of UL-44 sign-off. The review should cover the initial GitHub distribution, starter attribution, ownership of new work, DCO, class 9/42 marks and any later proposed terms. Record the appointment and outcome with UL-45's legal review.

TaoTale decision TT-033 records the TAO-02 handoff for Eroxo UI, free npm package `eroxo-ui`, MIT, current repository `ronmilich/eroxo-ui`. TaoTale and other consumers receive the same free catalog. The long-term business model remains open. Brand reservations and API details remain open.
