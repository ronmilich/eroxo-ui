# UI Library — implementation roadmap




**Status:** Phase P0 is done: on 24 November 2026 the deferred UL-02 reservations moved to UL-09a and the UL-03 counsel review moved to UL-45. UL-04 is done, the Iris design specs are [reconciled](design-system/reconciliation.md), and [UL-05 architecture decisions](adr/README.md) are approved. The [product strategy](product-strategy.md) review added six milestones with letter suffixes, UL-09a to UL-44a.




**Product:** an independent, commercial-grade, **SolidJS-only** UI component library published to npm. The owner selected **Eroxo UI** and retained `eroxo-ui` for the free core. Below, `<pkg>` stands for the npm package name and `<p>` for the CSS/data-attribute prefix.




**Key decision — no Kobalte ([TT-032](https://github.com/ronmilich/taotale/blob/master/docs/02-taotale-decision-register.md), 23 November 2026):** the library implements its own accessible behavior layer — interaction, focus, layering, positioning, presence and collection navigation. No other headless UI library takes Kobalte's place.




**Normative sources:** [08 — Design system and SolidJS UI library](https://github.com/ronmilich/taotale/blob/master/docs/08-taotale-design-system.md) (primary; §2.3 for the in-house primitives), [02 — Decision register](https://github.com/ronmilich/taotale/blob/master/docs/02-taotale-decision-register.md) (TT-028–032, OPEN-10/11), [03 — Client](https://github.com/ronmilich/taotale/blob/master/docs/03-taotale-client.md) §6, [11 — Operations](https://github.com/ronmilich/taotale/blob/master/docs/11-taotale-operations-and-security.md) §6, [12 — Quality](https://github.com/ronmilich/taotale/blob/master/docs/12-taotale-quality-and-acceptance.md) (fixture F9).




This file in the Eroxo UI repository is the canonical roadmap. TaoTale links to it for current gate status.

**Consumer roadmap:** [TaoTale roadmap](https://github.com/ronmilich/taotale/blob/master/docs/roadmap/taotale-roadmap.md). TaoTale is the launch design partner: its milestones are **gated** on the milestones below. This library never depends on TaoTale code.




---




## 1. Product boundaries




Taken from 08 §1–§5; they apply to every milestone.




- **SolidJS + TypeScript only.** No React/Vue/Angular, no Web Components layer, no dual-framework builds.
- **Opinionated but customizable:** polished defaults, plus five customization layers that need no fork — tokens → theme scopes → variants/sizes → slots and state hooks → class/style overrides (08 §3.1).
- **No Tailwind** (not required internally or by consumers). **No runtime CSS-in-JS** by default.
- **In-house behavior layer (TT-032, 08 §2.3):** the library itself builds
- keyboard interaction and focus management;
- dismissal and layering, and positioning;
- presence/transitions;
- roving focus and typeahead;
- the listbox, menu and combobox keyboard models.




No Kobalte, and no other headless UI or positioning library.
- **Native first:** use platform features — `<dialog>`, the Popover API, `inert`, CSS anchor positioning — where the supported browsers allow and their behavior is good enough. Use JavaScript otherwise.
- **Spec-driven and clean-room:** the WAI-ARIA Authoring Practices and the HTML specification define behavior. Third-party code is never copied without licence-compatible attribution — important for a commercial licence.
- **Generic only:** the library owns generic behavior and presentation, never domain logic such as application cards, transcripts, audio players or topic models.
- **Standards:** WCAG 2.2 AA target per component; semantic versioning; ESM + TypeScript declarations + distributable CSS. `solid-js` is a peer dependency — and, by default, the only runtime dependency.
- **Commercial grade:** a deliberate name and licence, documented support/security/deprecation policies, an accessibility conformance report and supply-chain hygiene.




## 2. How this roadmap works




### 2.1 Milestone rules




- **Small:** each milestone has one reviewable outcome, sized for about 1–2 weeks of one developer. Split a milestone that grows beyond that before starting it. The UL-04 spike re-checked the sizes of the behavior-layer milestones: split UL-17 before starting it, and consider merging UL-24 and UL-25 ([estimate](ul-04-spike.md#effort-estimate-for-the-behavior-layer)).
- **Ordered:** milestones are numbered in execution order. A milestone starts only when everything in its *Depends on* list is Done.
- **Released:** every code milestone from UL-20 onward ends with a published version. Earlier code milestones may publish canary builds, which are not for consumers.
- **Need-driven:** primitives are built just before the components that need them. After the core set, components follow the design partner's needs (08 §9.3 step 5). There is no speculative catalog before 1.0.




### 2.2 Statuses




`Planned` → `In progress` → `Done` → (`Dropped` only with a recorded decision).




A milestone is **Done** when every exit criterion is checked and merged. A code milestone must also be **published and verified from the registry**. This "Done" definition is what TaoTale's gates check.




### 2.3 Definition of Done — decision milestones (UL-01 to UL-06, UL-12)




- Recorded as a charter or ADR with context, options considered, decision and consequences.
- Owner approval recorded.
- Decisions that TaoTale's specs mention (package name, licence, repository, CSS contract) are handed to TaoTale's register through TAO-02 or TAO-09/TAO-10.




### 2.4 Definition of Done — behavior-primitive milestones (UL-14 to UL-17, UL-24 to UL-26)




1. **Specification note:** which WAI-ARIA APG pattern or HTML/CSS behavior the primitive implements, and any deliberate deviation.
2. **Tests:** unit tests, plus real-browser tests in **Chromium, Firefox and WebKit**. Keyboard behavior is expressed as executable keyboard tables in the conformance harness ([UL-09](#ul-09--test-conformance-and-ci-infrastructure)).
3. **Robustness:**
 - safe to import during SSR;
 - no global listeners or timers while idle, and full cleanup on disposal;
 - works inside nested theme scopes and portals.
4. **Internal API documented** for maintainers: inputs, outputs, invariants. Primitives are internal by default (UL-05).
5. **No new runtime dependency:** the dependency allow-list from UL-07 stays green.




### 2.5 Definition of Done — component milestones (UL-20 onward)




1. **API** follows the [UL-06](#ul-06--api-and-styling-conventions) conventions: controlled and uncontrolled pairs, `class`/`style`/native attributes, documented slots and state attributes, ref forwarding, handler merging, and polymorphism where it applies.
2. **Styling** uses tokens only. Light, dark and a custom test theme all render correctly, with no hard-coded brand values.
3. **Accessibility:**
 - a native element or the correct WAI-ARIA pattern;
 - the keyboard table implemented and tested in Chromium, Firefox and WebKit;
 - a manual screen-reader smoke check following the UL-09 protocol;
 - accessible names enforced (dev warning where possible) and visible focus;
 - 200% zoom, reduced motion, touch and forced colors;
 - nothing conveyed by color alone.
4. **Tests:** unit tests, real-browser interaction tests, automated axe checks in light and dark, and the customization contract tests from [UL-19](#ul-19--component-customization-contract).
5. **Docs page:** examples, props table, keyboard table, accessibility notes (including what the consumer must still provide), and styling hooks (CSS variables, slots, state attributes).
6. **Size:** per-entry JS/CSS size measured and recorded, and within budget once [UL-43](#ul-43--performance-bundle-budgets-and-compatibility) sets budgets.
7. **Release:** changeset and changelog entry, version published, and the consumer smoke test installs it **from the registry** (not a workspace link) and passes.
8. **Generic only:** nothing application-specific — no domain rules, assets, fonts or brand colors.
9. **Agent-ready:** complete JSDoc on every public prop (description, default and a short example), an entry in the component metadata, a Markdown page shipped in the package, and development warnings in the UL-14 format. CI enforces the deterministic checks from UL-11 and UL-20.




## 3. Milestone summary




| ID | Milestone | Phase | Planned release | Gates in TaoTale | Status |
|---|---|---|---|---|---|
| UL-01 | Product charter and market scan | P0 | — | — | Done |
| UL-02 | Name selection and brand reservation | P0 | — | — | Done |
| UL-03 | Licence and commercial model | P0 | — | TAO-01–TAO-03 | Done |
| UL-04 | Technical spike (throwaway prototype) | P1 | — | — | Done |
| UL-05 | Architecture decisions (ADRs) | P1 | — | (input to TAO-04) | Done |
| UL-06 | API and styling conventions | P1 | — | — | Done |
| UL-07 | Repository and toolchain bootstrap | P1 | — | TAO-04–TAO-06 | Done |
| UL-08 | Build, packaging and consumer fixtures | P1 | — | — | Done |
| UL-09 | Test, conformance and CI infrastructure | P1 | — | — | Done |
| UL-09a | Name, organisation and domain reservations | P1 | — | — | Planned |
| UL-09b | Start-mode consumer fixture | P1 | — | — | Done |
| UL-10 | Release pipeline and supply-chain security | P1 | canary | — | Planned |
| UL-11 | Documentation site and playground skeleton | P1 | — | TAO-07, TAO-08, TAO-11 | Done |
| UL-12 | Design language and token taxonomy | P2 | — | — | Done |
| UL-13 | Default light and dark themes | P2 | canary | — | In progress |
| UL-14 | Core component utilities | P3 | canary | — | In progress |
| UL-15 | Accessibility, motion and localisation utilities | P3 | canary | TAO-12–TAO-15 | In progress |
| UL-16 | Interaction primitives | P3 | canary | — | Planned |
| UL-17 | Collection and navigation primitives | P3 | canary | — | Planned |
| UL-18 | Theming API | P4 | canary | — | Planned |
| UL-19 | Component customization contract | P4 | canary | — | Planned |
| UL-20 | Button, IconButton, Icon, Spinner — **first public release** | P5 | `0.1.0` | TAO-09 (hard), TAO-16, TAO-17 | Planned |
| UL-21 | Form field system | P5 | `0.2.0` | — | Planned |
| UL-22 | Choice controls | P5 | `0.3.0` | — | Planned |
| UL-23 | Display primitives | P5 | `0.4.0` | TAO-18–TAO-20 | Planned |
| UL-23a | Accordion and Collapsible | P5 | next 0.x minor | — | Planned |
| UL-24 | Layering and dismissal | P6 | `0.5.0` | — | Planned |
| UL-25 | Focus containment, modality, scroll lock and presence | P6 | `0.6.0` | — | Planned |
| UL-26 | Positioning engine | P6 | `0.7.0` | — | Planned |
| UL-27 | Tooltip | P6 | `0.8.0` | — | Planned |
| UL-28 | Popover | P6 | `0.9.0` | — | Planned |
| UL-29 | Dialog and AlertDialog | P6 | `0.10.0` | — | Planned |
| UL-29a | Drawer | P6 | next 0.x minor | — | Planned |
| UL-30 | DropdownMenu | P6 | `0.11.0` | — | Planned |
| UL-31 | Integration-readiness release | P6 | `0.12.0` | TAO-10 (hard) | Planned |
| UL-31a | Agent Skill and Solid guidance | P6 | — | — | Planned |
| UL-32 | Select | P7 | `0.13.0` | — | Planned |
| UL-33 | Feedback: Alert, Progress, EmptyState | P7 | `0.14.0` | TAO-21 (hard) | Planned |
| UL-34 | Pagination | P7 | `0.15.0` | TAO-22 (hard) | Planned |
| UL-35 | Slider | P7 | `0.16.0` | TAO-23, TAO-26 (hard); TAO-24, TAO-25, TAO-27 | Planned |
| UL-36 | Combobox / Autocomplete | P7 | `0.17.0` | TAO-28, TAO-29 (hard) | Planned |
| UL-37 | FileDropzone | P7 | `0.18.0` | TAO-31 (hard); TAO-30, TAO-32–TAO-35 | Planned |
| UL-38 | Table primitives | P7 | `0.19.0` | — | Planned |
| UL-39 | Toast | P7 | `0.20.0` | TAO-39 (hard, with UL-38); TAO-36–TAO-38, TAO-40, TAO-41 | Planned |
| UL-40 | Tabs | P7 | `0.21.0` | — | Planned |
| UL-41 | Documentation completion | P8 | — | TAO-42–TAO-46 | Planned |
| UL-42 | Accessibility audit and conformance report | P8 | `0.22.0` | TAO-47 (hard) | Planned |
| UL-43 | Performance, bundle budgets and compatibility | P8 | `0.23.0` | TAO-48 (hard); TAO-49, TAO-50 | Planned |
| UL-44 | API freeze and 1.0 release candidate | P8 | `1.0.0-rc.N` | TAO-51 (hard) | Planned |
| UL-44a | Launch kit | P8 | — | — | Planned |
| UL-45 | 1.0 GA and commercial launch | P8 | `1.0.0` | TAO-52, TAO-53, TAO-55–TAO-57, TAO-60 | Planned |
| UL-46 | Responsive and touch hardening | P9 | `1.1.0` | (part of TAO-59) | Planned |
| UL-47 | Navigation and menus | P9 | `1.2.0` | TAO-59 (hard) | Planned |
| UL-48 | HoverCard | P9 | `1.3.0` | TAO-54, TAO-58 (hard) | Planned |
| UL-49 | Data components | P9 | `1.4.0` | — | Planned |
| UL-50 | Date and number inputs | P9 | `1.5.0` | — | Planned |
| UL-51 | Design-token interchange and design kit | P9 | — | — | Planned |
| UL-52 | Public headless package (evaluate) | P9 | separate package | — | Planned |
| UL-53 | Commercial expansion (conditional) | P9 | — | — | Planned |




*"Hard" means the TaoTale milestone uses what this milestone delivers. Unmarked entries are sequencing gates: library-first ordering that TaoTale also must respect. See the [TaoTale gating rules](https://github.com/ronmilich/taotale/blob/master/docs/roadmap/taotale-roadmap.md#2-ui-library-gating-rules).*




*Milestones with a letter suffix were added on 24 November 2026 by the [product strategy](product-strategy.md) review. Each follows the milestone with the same number, so existing numbers and TaoTale's gates do not change. Component milestones with a suffix also publish a 0.x minor, so later planned versions shift; the actual version is recorded when each milestone is Done.*




---




## 4. Phases and milestones




### Phase P0 — Product and business foundations




#### UL-01 — Product charter and market scan




[Decision record](ul-01-charter.md)




**Goal:** Define what the library is, who it serves and what 1.0 contains.




**Scope**
- Mission, target users (SolidJS teams that want styled, accessible components without Tailwind), principles and non-goals (08 §1).
- Market scan of the SolidJS UI ecosystem: headless options (e.g. Kobalte, Ark UI, Corvu) and styled ones (e.g. shadcn-style ports, SUID). Record each one's maintenance status and licence at scan time, and the gap this library fills. Their behavior is a reference to test against, never code to copy (clean-room rule).
- Record the build-vs-buy outcome (TT-032): the behavior layer is built in-house and is the largest single part of the 1.0 effort.
- 1.0 scope: the 08 §4.1 catalog (foundation, core overlays, selection/navigation, feedback), plus the design partner's needs (Slider, Table, FileDropzone), plus an explicit post-1.0 list.
- Success metrics (accessibility conformance, per-import size, adoption indicators) and the design-partner arrangement with TaoTale.




**Exit criteria**
- [x] Final charter text approved by the owner on 23 November 2026.
- [x] 1.0 scope list frozen; later changes go through a recorded scope change.




**Depends on:** —




#### UL-02 — Name selection and brand reservation




[Decision record](ul-02-name.md)




**Goal:** Choose a durable, available, legally safe name and derive the technical prefixes from it.




**Scope**
- Naming criteria:
- short, pronounceable and distinctive;
- usable as the npm package/scope and as a 2–4 letter CSS prefix;
- does not imply official SolidJS affiliation;
- does not collide with existing UI libraries.
- Long list → short list of 3–5 → availability checks: npm package and organisation scope, GitHub organisation, domain(s), social handles, and negative meanings in major languages.
- Trademark knockout search (e.g. USPTO, EUIPO, WIPO Global Brand Database; software classes 9 and 42). Decide whether and when to file.
- Reserve the npm organisation/scope, GitHub organisation and domain. Record the CSS custom-property prefix (`--<p>-`) and data-attribute prefix (`data-<p>-`). 08 §3.1 requires the prefix to be fixed together with the package name.




**Exit criteria**
- [x] Name, npm package name and CSS/data-attribute prefixes approved and recorded.
- [x] npm scope, GitHub organisation and domain reservations moved to [UL-09a](#ul-09a--name-organisation-and-domain-reservations) by owner decision on 24 November 2026.
- [x] Trademark filing decision recorded: file before 1.0 after clearance.




**Depends on:** UL-01




#### UL-03 — Licence and commercial model




[Decision record](ul-03-commercial.md)




**Goal:** Decide how the library is licensed, distributed and monetised before any public code exists.




**Scope**
- Compare these models:
- permissive open source (MIT/Apache-2.0) with paid services or add-ons;
- open-core: a free core plus paid "Pro" packages;
- dual licensing: copyleft plus a commercial licence (requires a CLA);
- a source-available commercial licence.
- Distribution for each model: free packages on public npm; paid packages via a private registry or licence-gated access. **No runtime licence checks or telemetry inside components.**
- **Clean-room policy:** behavior is implemented from public specifications and our own tests. Any adapted third-party code needs a compatible licence and recorded attribution (NOTICE). With no runtime dependencies besides `solid-js`, the remaining licence checks cover icon sets, fonts and dev tooling.
- Contribution policy (DCO vs CLA), trademark usage policy, and the support tiers offered at 1.0.
- Engage qualified counsel. The legal review must be complete before `1.0.0` is published in UL-45.




**Exit criteria**
- [x] MIT and the free initial release approved. Long-term business model deferred by owner until after the initial release. LICENSE text drafted.
- [x] Clean-room policy, contribution policy and third-party notices process defined.
- [x] Counsel review moved into UL-45's final legal review by owner decision on 24 November 2026. It must close before `1.0.0` is published.




**Depends on:** UL-01, UL-02 · **Gates in TaoTale:** TAO-01, TAO-02 (hard: records the name and licence), TAO-03




### Phase P1 — Technical foundations and infrastructure




#### UL-04 — Technical spike (throwaway prototype)




[Decision record](ul-04-spike.md)




**Goal:** Gather evidence for the build, CSS and behavior-layer decisions, and estimate the in-house effort. 08 §2.2 says to choose tooling only "after a small working library prototype".




**Scope**
- Build exactly three things:
- a native styled Button;
- an in-house modal Dialog (focus containment, Escape/outside dismissal, scroll lock, focus restoration);
- an in-house positioned Tooltip.
- Compare two CSS approaches on Button and Dialog styling: plain CSS with cascade layers (via Lightning CSS) and CSS Modules. Add zero-runtime vanilla-extract only if the owner asks for TypeScript-typed tokens. Criteria:
- stable public selectors;
- per-component CSS;
- `sideEffects` safety;
- theming through custom properties;
- override friendliness.
- Compare Solid library build outputs: compiled DOM + SSR builds, and/or JSX preserved under a `solid` export condition. 08 §2.2 says shipping raw JSX must be deliberate and tested.
- **Native-first check:** try `<dialog>` with `showModal()`, the Popover API, the `inert` attribute and CSS anchor positioning against the provisional browser matrix in the decision record. UL-05 sets the final matrix. Record the gaps: focus restoration, entry/exit animation, stacking, theme inheritance. Top-layer content stays in place in the DOM, which may remove the need for portals.
- Pack the prototype and install it in a Vite SPA and a minimal Vite SSR app built on `@solidjs/web`. SolidStart is not used because it does not support Solid 2 yet. Check for a single Solid runtime, CSS loading and types, and compare a Button-only bundle with a Dialog bundle.
- **Time-box:** 10 working days. When the cap is reached, the spike stops and the report lists what it did not cover.




**Exit criteria**
- [x] Spike report with measurements, a recommendation per question, and a native-vs-JavaScript recommendation per primitive. Approved by the owner on 23 November 2026.
- [x] Effort estimate for the behavior layer (UL-14–UL-17, UL-24–UL-26), used to re-check milestone sizes.
- [x] Spike code not reused as product code. Not archived on GitHub: the owner decided on 23 November 2026 that the report replaces it (see the [decision record](ul-04-spike.md#exit-criteria)).




**Depends on:** UL-01




#### UL-05 — Architecture decisions (ADRs)

[Architecture decisions and TaoTale handoff](adr/README.md)




**Goal:** Lock the structural choices that are expensive to change later. Write one ADR per item. Inputs: the UL-04 [decision record](ul-04-spike.md) and the approved [Iris reconciliation](design-system/reconciliation.md).




**Scope**
- **Repository topology:** a standalone library repository or a monorepo shared with TaoTale. Standalone is recommended: independent versioning, public contributions, a clean licence, and no private app data. Also decide how consumers obtain pre-release builds.
- **Package structure:** one package with per-component subpath exports, or several packages. Optional extra packages (icons, theme presets).
- **Build toolchain and export conditions:** DOM, SSR, `solid`, development/production, source maps, declarations.
- **CSS architecture and delivery:** authoring approach, cascade-layer order, and per-component CSS vs a required global stylesheet vs both. This must be proven in a consuming app (08 §2.2).
- **Behavior-layer architecture:**
- an internal module with a clean boundary (recommended for 1.0), or a public headless package from the start;
- module layout: interaction, focus, layering, positioning, presence, collections;
- what might become public later (UL-52).
- **Native-first policy:** for each primitive, native platform feature or JavaScript, with fallback rules tied to the support matrix.
- **Dependency policy:** `solid-js` is the only runtime dependency by default. No headless UI libraries (Kobalte, Ark/Zag and similar) and no positioning libraries (TT-032). Any exception needs its own ADR.
- **Support matrix:**
- `solid-js` peer range — start from UL-04's Solid 2-only assumption and recheck whether SolidStart supports Solid 2;
- TypeScript minimum;
- browser policy — start from UL-04's provisional matrix;
- bundlers — Vite first, others verified in UL-43;
- SSR (SolidStart) support level.
- **Smaller choices:**
- icons: a vendored, version-pinned Lucide subset (ISC, with NOTICE entries) plus an `Icon` wrapper, approved in the Iris reconciliation (D7); an optional icon package later;
- motion: CSS transitions plus the in-house presence primitive, no motion library;
- docs-site technology;
- package manager and Node version.




**Exit criteria**
- [x] All ADRs merged, each with alternatives and consequences.
- [x] Repository topology and pre-release consumption model handed to TaoTale in TT-034; they are a hard input to TAO-04.




**Depends on:** UL-04 and the recorded UL-03 initial distribution decision. On 23 November 2026 the owner authorized UL-05 to proceed while UL-03 legal work remains deferred.




#### UL-06 — API and styling conventions




**Goal:** One rulebook every component follows, so the 1.0 API is consistent. The [component authoring rulebook](design-system/eroxo-iris-component-anatomy-api-spec.md) records the decisions and examples.




**Scope**
- **Component anatomy:** compound parts (e.g. `Dialog.Root` / `Trigger` / `Content`) or single-component props — set a rule per component category. Naming rules.
- **Props vocabulary:**
- state pairs: `value` / `defaultValue` / `onValueChange` and `open` / `defaultOpen` / `onOpenChange`;
- booleans: `disabled`, `readOnly`, `required`, `invalid`;
- style axes: `variant`, `size`, `tone`;
- customization: `class`, per-slot `classes`, `style`;
- refs, event-handler merging (including Solid's bound-handler arrays) and polymorphic `as`.
- **CSS conventions:**
- naming: prefix from UL-02, token naming grammar, component class names;
- cascade layers: names and order;
- state attributes (`data-erx-state`, `data-erx-disabled`, `data-erx-invalid`, …), defined and documented by the library;
- slot attributes and logical properties;
- `:focus-visible`, `forced-colors` and `prefers-reduced-motion` handling;
- no `!important`.
- **Internal primitive conventions:** `create*` factories that return accessors and prop getters, run DOM-dependent setup and teardown in `onSettled`, register owner cleanup with `onCleanup`, and do no DOM work at import time.
- **Localisation:** every built-in label can be overridden; text direction (LTR/RTL).
- **Public-API definition:** what counts as public (props, exports, CSS variables, slots, state attributes), a deprecation policy and a migration-note policy.
- **`unstyled` mode** (08 §10): recommended default is not in 1.0.




**Exit criteria**
- [x] Component rulebook v0.3.0 approved by the owner on 23 November 2026. [TT-035 records the handoff to TaoTale](https://github.com/ronmilich/taotale/commit/0426446).
- [x] `pnpm lint` checks CSS and JSX naming, CSS layer order, `!important` and public export patterns. `pnpm test:conventions` exercises the rules.
- [x] Amended on 24 November 2026: [rulebook](design-system/eroxo-iris-component-anatomy-api-spec.md) v0.4.0 adds the agent conventions and data-first `items` for Select and Combobox (product strategy Q4).




**Depends on:** The approved UL-02 name, package and prefix decisions, and the accepted UL-05 ADRs. UL-02 reservations moved to UL-09a.




#### UL-07 — Repository and toolchain bootstrap




**Goal:** A clean, protected repository that every later milestone lands in.




**Scope**
- Repository per UL-05, with a workspace layout for the library package, docs app, consumer fixtures and tools.
- Pinned package manager and Node version; strict TypeScript; Solid-aware lint rules; formatting; stylelint enforcing the CSS conventions.
- **Dependency allow-list check:** CI fails if any runtime dependency appears that an ADR hasn't approved — in particular any headless UI or positioning library (TT-032).
- LICENSE (from UL-03), README stub, CONTRIBUTING (DCO or CLA), code of conduct, issue/PR templates, CODEOWNERS and branch protection.
- Decide where this roadmap lives long-term: this folder or the library repository. Keep TaoTale's link to it working.




**Exit criteria**
- [x] A [clean GitHub Actions checkout](https://github.com/ronmilich/eroxo-ui/actions/runs/45249181255) passed the frozen workspace install, lint, strict type checks, formatting, tests and both builds.
- [x] The CLI rejects a manifest containing an unapproved runtime dependency. The regression test checks the nonzero exit and the offending field and package name for regular, optional, peer and bundled dependencies.

The initial branch protection required pull requests with a passing, up-to-date GitHub Actions `build` check and zero required reviews. During early development, the owner approved direct pushes to `main` while keeping the protections against force pushes and deletion. Restore the required pull request and build check before release. [TaoTale links to this roadmap](https://github.com/ronmilich/taotale/commit/9159df8) for TAO-04 through TAO-06.




**Depends on:** UL-05, UL-06 · **Gates in TaoTale:** TAO-04, TAO-05, TAO-06




#### UL-08 — Build, packaging and consumer fixtures




**Goal:** An installable package whose exports, types and CSS are proven in real consumer apps.




**Scope**
- Build pipeline per UL-05: ESM, `.d.ts`, compiled CSS and source maps.
- `package.json`:
- `exports` with per-component subpaths and CSS entry points;
- `files` and `sideEffects`;
- `solid-js` as a peer dependency.
- Import safety: no browser globals at module initialisation (08 §2.2).
- Packaging checks, e.g. `publint` and "Are the types wrong?".
- Consumer fixtures install the same `npm pack` tarball in isolated Vite SPA and direct Solid SSR applications. [ADR 08](adr/08-support.md) specifies the SSR target. Stable [SolidStart 2.2.3](https://registry.npmjs.org/@solidjs%2Fstart/2.2.3) still declares a Solid 1 peer, and the Solid 2.0 announcement retired SolidStart. [UL-09b](#ul-09b--start-mode-consumer-fixture) adds a fixture for its replacement, Start mode in `@solidjs/vite-plugin`.
- Size report: per-entry JS/CSS, comparing a Button-only import with an overlay-heavy import.




**Exit criteria**
- [x] Both fixtures install the built tarball. They type-check, resolve one Solid runtime and render in Chromium. The SSR fixture verifies first-paint CSS with JavaScript disabled, then hydrates the original DOM and handles a click.
- [x] CI runs publint and the ESM profile of Are the Types Wrong against the tarball and uploads the raw and gzip [size report](https://github.com/ronmilich/eroxo-ui/actions/workflows/tests.yml). Private Button and Dialog probes verify that a light import excludes overlay JS and CSS. Production component sizes follow their respective implementation milestones.




**Depends on:** UL-07




#### UL-09 — Test, conformance and CI infrastructure




**Goal:** Every quality gate in 08 §5 runs automatically — with extra depth, because the behavior layer is in-house.




**Scope**
- Test layers:
- unit/component tests (e.g. Vitest + Solid Testing Library);
- real-browser interaction tests (e.g. Playwright);
- automated accessibility checks (axe);
- optional visual snapshots in light and dark.
- **Three engines from day one:** browser tests run in Chromium, Firefox and WebKit, because in-house focus and keyboard behavior must be proven in each.
- **Conformance harness:** helpers that turn each WAI-ARIA APG keyboard table into executable tests.
- **Screen-reader protocol:** a manual checklist per pattern for NVDA, VoiceOver and TalkBack. Evaluate screen-reader automation (e.g. Guidepup) for regression checks.
- **Input coverage:** touch/pointer emulation, and IME composition events for text inputs and comboboxes.
- CI stages: lint → typecheck → unit → build → pack → fixtures → browser (three engines) → accessibility → size report. Run a `solid-js` peer-range matrix (minimum and latest supported).
- Coverage reporting and thresholds for library logic.




**Exit criteria**
- [x] CI runs source unit/component coverage and SSR tests, then exercises the packed library in Chromium, Firefox and WebKit with minimum and latest-compatible Solid peers. Samples cover hydration, keyboard activation, focus, touch, composition and axe.
- [x] The protected `build` check requires both peer jobs and source checks. Negative controls verify that an unnamed button, a broken APG activation row and incorrect fixture output trigger their respective assertions.
- [x] The [screen-reader protocol](screen-reader-protocol.md) covers pattern-specific checks and result recording for NVDA, VoiceOver and TalkBack. Manual execution is recorded at each component milestone.




**Depends on:** UL-08




#### UL-09a — Name, organisation and domain reservations




**Goal:** Secure the names before the first canary is published. The deferred UL-02 reservations moved here on 24 November 2026, so UL-02 could close.

**Deferred (25 November 2026).** Resume reservations when npm account access is restored. The account is temporarily suspended.




**Scope**
- Create the `@eroxo-ui` npm organisation with owner-controlled publisher access. The first UL-10 canary then claims the `eroxo-ui` package name.
- Reserve the `eroxo-ui` GitHub organisation. Moving the repository stays a separate decision.
- Register the domain (candidate `eroxoui.com`) after checking the price and renewal terms.
- Check the social handle before advertising it.
- Record the evidence in the [UL-02 reservation ledger](ul-02-name.md#reservation-ledger).




**Exit criteria**
- [ ] The npm organisation, GitHub organisation and domain are reserved, with evidence in the UL-02 ledger.




**Depends on:** UL-02




#### UL-09b — Start-mode consumer fixture




**Goal:** Prove the package in Solid's official application setup, now that the Solid 2.0 announcement has retired SolidStart.




**Scope**
- A packed-consumer fixture built with Start mode in `@solidjs/vite-plugin` (`start: true` with `ssr: true`), checked like the existing SSR fixture: first-paint CSS, hydration of the server DOM and an interaction, in Chromium, Firefox and WebKit.
- Track [TanStack Solid Start 2.0](https://www.npmjs.com/package/@tanstack/solid-start?activeTab=versions) and add a fixture once that version is stable.




**Exit criteria**
- [x] [ADR 08](adr/08-support.md) names Start mode as the framework-level SSR target (24 November 2026).
- [x] The packed Start-mode fixture passed locally in Chromium, Firefox and WebKit with the minimum and latest compatible Solid peers. Both tiers resolved `solid-js` and `@solidjs/web` 2.0.3. The same harness runs in GitHub Actions.




**Depends on:** UL-09




#### UL-10 — Release pipeline and supply-chain security




**Goal:** Publishing is automated, traceable and safe before the first public component exists.

**Deferred (25 November 2026).** Resume release pipeline work when npm account access is restored.




**Scope**
- Versioning and changelog automation (e.g. Changesets). Release channels (canary, next/beta, rc, latest) and the 0.x policy in [§5](#5-release-and-versioning-plan).
- Publishing from CI with npm trusted publishing (OIDC) and provenance attestations; organisation 2FA; protected release branch.
- Dependency update bot, vulnerability scanning, licence allow-list check, SBOM generation and secret scanning.
- `SECURITY.md` with a vulnerability-disclosure process.
- End-to-end proof: publish a canary, then install it from the registry into the fixtures.




**Exit criteria**
- [ ] A canary can be installed from the registry and shows provenance.
- [ ] Changelog generated; security policy published.




**Depends on:** UL-03, UL-08, UL-09 · **Release:** canary




#### UL-11 — Documentation site and playground skeleton




**Goal:** A docs site that can host live examples from the first component onward.




**Scope**
- Docs framework per UL-05 with live SolidJS examples.
- Component page template: overview, examples, props table, keyboard table, accessibility notes, styling hooks.
- Theme playground stub (light, dark, custom).
- API tables generated from TypeScript where feasible, search, and a versioned-docs strategy for 1.x. The GitHub Pages preview builds from `main`; pull requests get downloadable previews during early development.
- **Agent channels from the first page (product strategy):** every page is also emitted as Markdown, together with `llms.txt`, `llms-full.txt` and component metadata. The metadata takes props and defaults from TypeScript, and parts, state attributes, CSS variables, keyboard tables and examples from the docs source.
- Examples are real `.tsx` files that are compiled, type-checked and tested. The same files feed the site, the package docs and the Agent Skill.
- Each component page adds "When to use", "When not to use" and "Common mistakes" to the template.




**Exit criteria**
- [x] The [GitHub Pages preview](https://ronmilich.github.io/eroxo-ui/) serves the component template and [live Hello example](https://ronmilich.github.io/eroxo-ui/components/hello/).
- [x] The docs check verifies example compilation and rendering, Markdown, `llms.txt` and metadata locally and in [GitHub Actions](https://github.com/ronmilich/eroxo-ui/actions/runs/45471670599). Direct pushes remain available during early development.

StackBlitz examples can use the public package once UL-10 publishes a canary.




**Depends on:** UL-02, UL-07 · **Gates in TaoTale:** TAO-07, TAO-08, TAO-11




### Phase P2 — Design-system foundations




#### UL-12 — Design language and token taxonomy




**Goal:** The library's own neutral default look, and the token system every component uses. The seven Iris foundation specs in `docs/design-system/`, as amended by the approved [Iris reconciliation](design-system/reconciliation.md), are the draft token specification.




**Scope**
- Visual principles for the default theme. It is deliberately generic — TaoTale's Quiet Study stays in TaoTale (08 §6).
- Three token tiers: primitive palette → semantic tokens → a limited set of component tokens.
- Token categories:
- color: surface, text, action, border, focus, feedback, overlay;
- typography: font families default to system stacks — no bundled web fonts, which keeps licensing simple;
- spacing, radii, border widths, elevation;
- motion: durations and easings;
- z-index layers, control sizes, focus ring.
- Accessibility built into the tokens:
- contrast: 4.5:1 for text; 3:1 for large text and non-text UI;
- dark mode as its own mapping, not an inversion;
- defined forced-colors behavior;
- control sizes meet the WCAG 2.2 target-size minimum (24×24 CSS px), with a ≥44 px option for touch-first apps.
- A design source (e.g. Figma) for the default light and dark themes.




**Exit criteria**
- [x] Owner approved the token specification and both default theme designs on 24 November 2026.

The [token decision record](design-system/ul-12-token-taxonomy.md) and [light/dark design study](https://ronmilich.github.io/eroxo-ui/design/iris.html) are the approved inputs for UL-13.




**Depends on:** UL-06




#### UL-13 — Default light and dark themes




**Goal:** Ship the tokens as CSS, with automated contrast verification.




**Scope**
- One source of truth (TS or JSON) generates CSS custom properties for light and dark. Each theme sets `color-scheme`.
- Automated contrast tests for every documented foreground/background pair.
- Omitted custom-theme tokens inherit from the nearest built-in or system theme. Color-dependent aliases resolve within the custom scope.
- Token reference page in the docs.




**Exit criteria**
- [ ] Token CSS builds and ships in a canary.
- [x] All 144 contrast checks passed. The [token reference](https://ronmilich.github.io/eroxo-ui/tokens/) and its Markdown are live.

The [Iris token source](../tokens/iris.json) generates the package stylesheet and the docs reference. The packed library passed the minimum and latest compatible Solid peer tiers in Chromium, Firefox and WebKit. The checks cover nested scopes, partial custom themes and light and dark server first paint. The final canary check is deferred until npm account access is restored and UL-10 publishes a canary.




**Depends on:** UL-08, UL-12 · **Release:** canary




### Phase P3 — Behavior layer (in-house, JavaScript/TypeScript)




This phase builds the foundation that a headless library would otherwise provide (08 §2.3). The overlay-specific primitives follow in Phase P6, just before the overlays that use them.




#### UL-14 — Core component utilities




**Goal:** The shared runtime helpers every component is built on.




**Scope**
- A controlled/uncontrolled state helper that warns in development when a component switches modes (08 §2.1).
- Prop splitting/merging patterns, ref merging, event-handler composition (including Solid's bound-handler arrays), and polymorphic `as` with correct types.
- SSR-safe unique IDs and server guards; no work at import time.
- Development-only warnings, e.g. an icon-only control without an accessible name. They are removed from production builds. Every warning uses one format, readable by people and coding agents: `[eroxo-ui] <Component>: <problem>. <fix>. <docs URL>.md`.
- Implemented in-house (TT-032). Any new runtime dependency needs an ADR.




**Exit criteria**
- [x] Primitive Definition of Done (§2.4) verified locally. See the [maintainer specification](ul-14-core-utilities.md).
- [x] Production client and server fixture builds contain no library development warnings. Hydration and interaction checks passed in Chromium, Firefox and WebKit with Solid 2.0.3 and 2.0.4.

Canary publication and registry verification remain pending until npm account access is restored and UL-10 publishes a canary.




**Depends on:** UL-06, UL-09 · **Release:** canary




#### UL-15 — Accessibility, motion and localisation utilities




**Goal:** Cross-cutting accessibility plumbing that many components share.




**Scope**
- `VisuallyHidden`, and one managed live region with an `announce()` API (polite or assertive).
- Focus helpers: programmatic focus and focus-visible conventions.
- Motion configuration: honours `prefers-reduced-motion` and offers an explicit consumer override (08 §3.2).
- Locale and direction provider: default English messages for built-in labels, an overridable dictionary and `dir` support.
- Forced-colors utility styles.




**Exit criteria**
- [x] Primitive Definition of Done (§2.4) verified locally, including the live-region DOM before and after hydration. See the [maintainer specification](ul-15-accessibility-utilities.md).
- [x] The fixture overrides built-in labels and direction while preserving mounted input state.

Manual screen-reader speech verification remains pending. Canary publication and registry verification depend on restored npm access and UL-10.




**Depends on:** UL-14 · **Release:** canary · **Gates in TaoTale:** TAO-12–TAO-15




#### UL-16 — Interaction primitives




**Goal:** Consistent, accessible input handling that every interactive component builds on.




**Scope**
- **Input modality:** track whether the user is on keyboard, pointer or touch, so focus rings appear for keyboard users even after focus is moved in code.
- **Pointer and touch:** press handling for non-button elements, hover that is never triggered by touch, a long-press guard, and a pointer-capture helper (used by Slider).
- **Keyboard:** key normalisation, RTL-aware arrow keys for horizontal widgets, modifier handling, and no interference with text entry.
- **Focus queries:**
- find tabbable and focusable elements, respecting `disabled`, `inert`, hidden content and `tabindex`;
- move focus to the first, last or next element;
- a `contains` check that works across portals.
- **IME composition guard:** while an input method is composing, no key handling, filtering or selection happens. This is essential for Chinese, Japanese and Korean input.




**Exit criteria**
- [ ] Primitive Definition of Done met.
- [ ] Composition-event tests pass in all three engines, plus a manual check with a Chinese and a Korean input method.




**Depends on:** UL-14, UL-15 · **Release:** canary




#### UL-17 — Collection and navigation primitives




**Goal:** The keyboard models shared by radio groups, toggle groups, tabs, menus, listboxes and comboboxes.




**Sizing (UL-04):** estimated at 2.5–3 weeks, beyond the 1–2 week rule. Split before starting: roving tabindex, typeahead and the collection model first; virtual focus and selection second.




**Scope**
- **Roving tabindex:** one tab stop per widget; arrows and Home/End; orientation; wrap-around; skips disabled items; RTL.
- **Virtual focus:** `aria-activedescendant` management for widgets where focus stays in an input (combobox), with the active option scrolled into view.
- **Typeahead:** a character buffer with a timeout and locale-aware matching.
- **Selection:** single and multiple, controlled or uncontrolled, disabled items, and Shift-range selection where the APG pattern calls for it.
- **Collection model (decided 24 November 2026, product strategy Q4):** Select and Combobox take an `items` data collection as their source of truth; DropdownMenu, Tabs, RadioGroup and ToggleGroup register JSX children. One keyboard and typeahead core serves both, with stable keys so items can be added or removed without losing focus. Page Up/Down for long lists.




**Exit criteria**
- [ ] Primitive Definition of Done met.
- [ ] Each keyboard model has an executable keyboard table in the conformance harness, passing in all three engines.




**Depends on:** UL-16 · **Release:** canary




### Phase P4 — Theming and customization




#### UL-18 — Theming API




**Goal:** Consumers can apply, switch and nest themes without remounting anything.




**Scope**
- A theme root/scope component. Scopes can nest inside a subtree without rewriting `:root` (08 §3.1).
- `colorScheme` of light, dark or system, controlled or uncontrolled, with access to the resolved value. Persisting the choice is the consumer's job.
- A typed helper for defining custom themes: partial overrides are checked by TypeScript and produce static CSS where possible.
- A first-paint helper (a tiny inline script or snippet) so SPAs and SSR apps apply the stored theme before rendering.
- Overlay content — whether in portals or the native top layer — inherits the nearest theme scope; how nested themes combine with overlays is documented.




**Exit criteria**
- [ ] A fixture switches between light, dark and custom themes while stateful children keep their state (no remount).
- [ ] Nested-scope and overlay-inheritance tests pass.
- [ ] A first-paint demo shows no theme flash.




**Depends on:** UL-13, UL-14 · **Release:** canary




#### UL-19 — Component customization contract




**Goal:** Make the five customization layers of 08 §3.1 real and testable.




**Scope**
- Styling plumbing:
- slot attributes and per-slot class props;
- normalised state attributes;
- a typed variant/size/tone resolver;
- component-level CSS variables;
- cascade layers wired into the built CSS.
- Documented precedence: a consumer's unlayered CSS beats the library's layers, so `!important` is never needed.
- A reusable contract-test harness covering a custom theme, a nested theme, a slot override, a variant override and a missing-token fallback. Every component milestone runs it.
- First draft of the "Customization" guide.
- **Tailwind v4 bridge (product strategy Q5):** an opt-in `eroxo-ui/tailwind.css` that maps `--erx-*` tokens into Tailwind's theme. A documented layer order puts Tailwind's preflight below Eroxo components and utilities above them, with unlayered application CSS on top. The file needs exemptions from the `erx` layer-statement and `--erx-` prefix lint rules, and the style build passes `@theme` through unchanged. Tailwind is never required.




**Exit criteria**
- [ ] The harness passes on a test component.
- [ ] A consumer restyles a multi-part test component without private selectors.
- [ ] A Tailwind v4 fixture confirms the documented layer order and the theme-aware utilities.




**Depends on:** UL-06, UL-18 · **Release:** canary




### Phase P5 — Foundation components




#### UL-20 — Button, IconButton, Icon and Spinner (first public release)




**Goal:** The first styled native component, proving external customization and bundling end to end (08 §9.3 step 2).




**Scope**
- Button:
- variants, sizes (including a ≥44 px option) and tones;
- disabled, or focusable `aria-disabled`;
- a pending state with Spinner and `aria-busy` that keeps the label;
- start/end icon slots and full width;
- `type="button"` by default;
- polymorphic rendering as a link or router link, with correct semantics.
- IconButton: an accessible label is required, enforced by a dev warning.
- `Icon` wrapper: any SVG; size and color from tokens; decorative or labelled.
- Spinner: accessible label and a reduced-motion variant.
- Installation and theming docs written for external users.
- Package docs: Markdown for every public component and guide inside the package (for example `eroxo-ui/docs/`), matching the installed version.
- `npx eroxo-ui agents-md` (product strategy Q8): a zero-dependency script in the package that writes or refreshes a marked Eroxo section in the consumer's AGENTS.md, and creates a CLAUDE.md that imports AGENTS.md when none exists. It runs only when called; the package gains no install scripts.
- Deterministic agent-kit checks in CI: every public prop documented, metadata and package docs complete, and valid `agents-md` output.




**Exit criteria**
- [ ] Component Definition of Done (§2.5) met.
- [ ] `0.1.0` published, and the fixtures install it from the registry.
- [ ] A consumer re-theme and slot restyle demo passes.
- [ ] A packed-consumer fixture runs `agents-md` and validates the section it writes.




**Depends on:** UL-10, UL-11, UL-15, UL-19 · **Release:** `0.1.0` · **Gates in TaoTale:** TAO-09 (hard), TAO-16, TAO-17




#### UL-21 — Form field system




**Goal:** Accessible text entry with label, description and error wiring.




**Scope**
- Label, and a Field wrapper (label, description, error message, required indicator, counter slot) that wires `aria-describedby`, `aria-invalid` and `aria-errormessage`.
- TextField (text, search, email, URL and similar, plus styled native `date`, `time` and `datetime-local` inputs) and Textarea (rows, optional auto-resize, resize policy).
- A counter helper with a pluggable counting function, e.g. Unicode code points or UTF-16 units. The library displays the count; the counting rule stays with the consumer.
- Native form integration (`name`, `required`, reset), immediate `onInput` updates, and read-only, disabled and invalid states.
- **IME-safe:** controlled values never overwrite text while an input method is composing (UL-16).




**Exit criteria**
- [ ] Component Definition of Done met.
- [ ] Composition tests pass for Chinese and Korean input.
- [ ] `0.2.0` published.




**Depends on:** UL-16, UL-20 · **Release:** `0.2.0`




#### UL-22 — Choice controls




**Goal:** Checkbox, radio, switch and toggle-group selection.




**Scope**
- Checkbox (including the indeterminate state) and Switch, built on visually hidden native inputs so they keep native form and accessibility behavior.
- RadioGroup: orientation, roving focus from UL-17, and custom item content such as color swatches or cards.
- ToggleGroup / segmented control with single or multiple selection, using the roving-focus manager (UL-17).
- Group labelling through the Field system.




**Exit criteria**
- [ ] Component Definition of Done met; `0.3.0` published.




**Depends on:** UL-17, UL-21 · **Release:** `0.3.0`




#### UL-23 — Display primitives




**Goal:** Static presentation components.




**Scope**
- Badge / Chip / Tag:
- tones;
- consumer-supplied colors (light/dark pairs via props or CSS variables), with documented contrast responsibility;
- an optional removable chip with an accessible remove button;
- a "+N" overflow helper.
- Card: media, header, body and footer slots, plus a documented pattern for interactive cards (no nested interactive elements inside a clickable card).
- Separator (semantic or decorative).
- Skeleton: reduced-motion aware, hidden from assistive technology, paired with a loading-announcement pattern.
- Avatar (charter scope change, 24 November 2026): an image with an initials or icon fallback, sizes, and an optional status indicator that is not conveyed by color alone.
- Layout primitives (charter scope change): Stack, Inline, Grid and Container with token-based gaps and alignment props. The props extend the UL-06 vocabulary and lint rules.




**Exit criteria**
- [ ] Component Definition of Done met; `0.4.0` published.




**Depends on:** UL-20 · **Release:** `0.4.0` · **Gates in TaoTale:** TAO-18–TAO-20




#### UL-23a — Accordion and Collapsible




**Goal:** Disclosure sections built on native HTML (charter scope change, 24 November 2026).




**Scope**
- Collapsible on native `<details>` and `<summary>`, styled, controlled or uncontrolled.
- Accordion: grouped Collapsibles with single or multiple open items. Single-open groups use the native `name` attribute where the browser policy allows it, and a small fallback otherwise.
- Heading levels for the triggers, the APG accordion keyboard behavior where it applies, reduced motion and find-in-page behavior.




**Exit criteria**
- [ ] Component Definition of Done met; a 0.x minor published.




**Depends on:** UL-23 · **Release:** 0.x minor




### Phase P6 — Overlay engine and overlays




The overlay engine is the core of the in-house behavior layer. UL-24 to UL-26 build it; UL-27 to UL-30 are the overlays built on top.




#### UL-24 — Layering and dismissal




**Goal:** The foundation every overlay shares: where it renders, how overlays stack, and how they close (08 §3.2).




**Scope**
- **Rendering:** the native top layer (`<dialog>`, Popover API), which UL-04 showed needs no portal or z-index stack. A Portal only for an overlay that the native-first ADR keeps out of the top layer. Either way, overlay content receives the nearest theme scope (UL-18).
- **Layer stack:** one registry that orders open overlays, with z-index tokens shared by tooltip, popover, select, dialog, menu and toast whenever the top layer isn't used.
- **Dismissable layer:**
- Escape closes only the topmost layer;
- outside-pointer and focus-outside detection treats nested layers as "inside", wherever they render;
- a veto hook;
- touch-safe outside clicks.
- No global listeners while nothing is open; full cleanup on disposal.




**Exit criteria**
- [ ] Primitive Definition of Done met.
- [ ] Tests in all three engines: nested dismissal order, outside clicks through nested layers, theme inheritance, zero listeners after close.
- [ ] Public parts documented; `0.5.0` published.




**Depends on:** UL-16, UL-18 · **Release:** `0.5.0`




#### UL-25 — Focus containment, modality, scroll lock and presence




**Goal:** Modal behavior and animated mounting that never lose the user's focus.




**Scope**
- **Focus scope:**
- native containment: focus never reaches the page behind a modal, though Tab may pass through the browser's own interface (UL-04);
- an initial-focus policy: first tabbable element, a chosen element, or the container;
- restore focus to the trigger, or a consumer-chosen element, on close;
- focus guards only for an overlay that the native-first ADR keeps out of the top layer.
- **Modality:** `showModal()` makes the background inert natively (UL-04); nested modals still need tests. Manual `inert`, restored exactly on close, only for an overlay that the native-first ADR keeps out of the top layer.
- **Scroll lock:** the CSS rule from UL-04, `html:has(.erx-dialog:modal) { overflow: hidden }`, which needs no counting for nested modals and held against touch on iPadOS. Still to check: the scrollbar gap with classic scrollbars.
- **Presence:**
- keep content mounted until CSS exit animations or transitions finish;
- handle "no animation" and interrupted transitions, ignore infinite animations, and cap the wait at the animation's length;
- skip animation under reduced motion;
- restore focus after the exit without a visible jump.




**Exit criteria**
- [ ] Primitive Definition of Done met.
- [ ] Focus never reaches the page behind an open modal and is never lost after close — tested in all three engines and checked manually with a screen reader.
- [ ] Page scroll position preserved after unlock; `0.6.0` published.




**Depends on:** UL-15, UL-16, UL-24 · **Release:** `0.6.0`




#### UL-26 — Positioning engine




**Goal:** In-house anchored positioning for tooltips, popovers, menus, selects and comboboxes.




**Scope**
- **Placement:**
- top/right/bottom/left, aligned start/center/end, with logical start/end for RTL;
- offset; flip and shift to stay inside a collision boundary with padding;
- size: the available width/height for long lists;
- arrow placement; hide when the anchor scrolls out of view.
- **Anchors:** elements and virtual rectangles, e.g. a text selection.
- **Auto-update:** when any scrollable ancestor scrolls, on resize, and when the anchor or the content changes size (ResizeObserver). Batched per animation frame and stopped when closed.
- **Correctness:** CSS transforms, fixed vs absolute strategies, and browser zoom. Exposes the final placement and a transform origin for animations.
- Progressive enhancement with CSS anchor positioning, only if the native-first ADR approves it.




**Exit criteria**
- [ ] Primitive Definition of Done met.
- [ ] Geometry unit tests, plus visual tests across placements, RTL, nested scroll containers and 200% zoom, in all three engines.
- [ ] Cost per position update measured; `0.7.0` published.




**Depends on:** UL-16, UL-24 · **Release:** `0.7.0`




#### UL-27 — Tooltip




**Goal:** Accessible, well-timed tooltips (08 §4), built on UL-24 to UL-26.




**Scope**
- Opens on hover and on keyboard focus; configurable open/close delays and skip-delay groups; only one tooltip active at a time; Escape; safe pointer movement (UL-16).
- Description vs label semantics. No interactive content — that's what Popover is for.
- Touch guidance: tooltips never carry essential information.
- Placement, collision handling and arrow; presence animations with reduced-motion support.




**Exit criteria**
- [ ] Component Definition of Done met; `0.8.0` published.




**Depends on:** UL-24, UL-25, UL-26 · **Release:** `0.8.0`




#### UL-28 — Popover




**Goal:** Non-modal and modal interactive overlays.




**Scope**
- Anchored to its trigger or to an external/virtual anchor (an element or a rectangle such as a text range).
- Modal and non-modal modes.
- Configurable initial focus, including "do not move focus".
- Close button, Escape and outside dismissal, and nested popovers.
- Theming and presence.
- Opening a popover programmatically must not disturb the consumer's text selection.




**Exit criteria**
- [ ] Component Definition of Done met; `0.9.0` published.




**Depends on:** UL-24, UL-25, UL-26 · **Release:** `0.9.0`




#### UL-29 — Dialog and AlertDialog




**Goal:** Modal dialogs with reliable focus handling (08 §4).




**Scope**
- Built on native `<dialog>` or the in-house engine, per the native-first ADR.
- Dialog behavior: modal semantics, focus containment, initial-focus policy, inert background, Escape/close, scroll lock, reliable focus restoration and nested dialogs.
- Anatomy: title, description, body, footer, close button; sizes.
- AlertDialog:
- `alertdialog` role and no outside dismissal;
- initial focus on the least destructive action;
- destructive tone;
- two- or three-action layouts (e.g. Save / Discard / Stay).
- The consumer can block dismissal while an action is pending.




**Exit criteria**
- [ ] Component Definition of Done met; `0.10.0` published.




**Depends on:** UL-20, UL-24, UL-25 · **Release:** `0.10.0`




#### UL-29a — Drawer




**Goal:** A side panel for navigation, filters and details (charter scope change, 24 November 2026).




**Scope**
- Built as a side-anchored Dialog on the UL-29 engine: modal by default, opening from the start, end, top or bottom, with start and end following the writing direction.
- Sizes; header, body and footer parts; a close button; presence animations with reduced-motion support.
- Touch gestures, safe areas and the full-screen dialog variant stay in UL-46.




**Exit criteria**
- [ ] Component Definition of Done met; a 0.x minor published.




**Depends on:** UL-29 · **Release:** 0.x minor




#### UL-30 — DropdownMenu




**Goal:** The WAI-ARIA menu pattern, built on roving focus and typeahead (UL-17), positioning (UL-26) and dismissal (UL-24).




**Scope**
- Items, groups with labels, separators, checkbox and radio items.
- Submenus, with a pointer "safe triangle" so moving toward a submenu doesn't close it.
- Typeahead and disabled items.
- Destructive tone, icons and shortcut hints, link items, and control over close-on-select.
- Presence and placement.




**Exit criteria**
- [ ] Component Definition of Done met; `0.11.0` published.




**Depends on:** UL-17, UL-24, UL-25, UL-26 · **Release:** `0.11.0`




#### UL-31 — Integration-readiness release




**Goal:** Meet 08 §9.1 so the first application can integrate (08 §9.3 step 4).




**Scope**
- Run the 08 §9.1 checklist against the **published** package:
- clean install; ESM, types and CSS resolve; one Solid runtime;
- keyboard and focus behavior of Button, inputs, Tooltip, Dialog, Menu and Popover;
- a consumer re-theme and a multi-part restyle;
- transitions and reduced motion with no stray focus or dangling overlays.
- Every in-house primitive passes the conformance harness in all three engines. Tooltip, Popover, Dialog and DropdownMenu pass a manual screen-reader check.
- Cross-component overlay tests: a tooltip inside a dialog, a menu inside a dialog, nested portals with nested themes.
- Record bundle-size baselines. Review all shipped APIs for consistency. Publish a known-issues list and an integration guide for the design partner.




**Exit criteria**
- [ ] Every 08 §9.1 item verified.
- [ ] `0.12.0` published.




**Depends on:** UL-20 to UL-30 · **Release:** `0.12.0` · **Gates in TaoTale:** TAO-10 (hard)




#### UL-31a — Agent Skill and Solid guidance




**Goal:** Give coding agents the workflow knowledge that reference pages do not carry (product strategy, agent kit).




**Scope**
- A small Agent Skill, `eroxo-ui`, for setup, theming, forms, overlays and accessibility checks. It lives in the repository and installs with `npx skills add`.
- Solid 2 guidance by reference: the AGENTS.md section points to the Agent Skills inside `solid-js` and to Solid's `llms.txt`. The Eroxo skill adds only UI patterns, such as forwarding props with `omit` and `merge`, refs and controlled state.
- Updated with each later component milestone, and reviewed against the mistakes agents make in real use.




**Exit criteria**
- [ ] The skill covers every component published so far, and its examples type-check in CI.




**Depends on:** UL-31




### Phase P7 — Application-driven components




These are ordered by the design partner's needs, then by commercial completeness.




#### UL-32 — Select




**Goal:** Single-value selection from a list, built on the collection primitives (UL-17) and the positioning engine (UL-26).




**Scope**
- Single-select listbox with groups, disabled options, a placeholder and custom option rendering (e.g. two-line labels).
- Keyboard and typeahead.
- Native form integration, plus Field integration for label, description and error.
- Sizes; positioning and dismissal from the overlay engine.
- Data-first (product strategy Q4): `items` is the source of truth. With no parts, `Select.Root` renders the default parts; parts customize how the same items render. The data source also lets a closed Select show its selected label during SSR.




**Exit criteria**
- [ ] Component Definition of Done met; `0.13.0` published.




**Depends on:** UL-17, UL-21, UL-31 · **Release:** `0.13.0`




#### UL-33 — Feedback: Alert, Progress and EmptyState




**Goal:** Generic feedback surfaces.




**Scope**
- Alert/Callout: tones; title, description and actions; guidance on `role="alert"` vs `status`; optional dismiss.
- Progress: linear, determinate or indeterminate; label and value text; reduced motion.
- EmptyState: illustration/icon slot, title, description and actions. Generic only — no application copy.




**Exit criteria**
- [ ] Component Definition of Done met; `0.14.0` published.




**Depends on:** UL-20, UL-23 · **Release:** `0.14.0` · **Gates in TaoTale:** TAO-21 (hard)




#### UL-34 — Pagination




**Goal:** Accessible page navigation.




**Scope**
- Page list with ellipsis; previous/next (first/last optional); controlled page and total page count.
- `aria-current="page"`, localisable labels and a compact mode.
- A link mode for URL-driven pagination.




**Exit criteria**
- [ ] Component Definition of Done met; `0.15.0` published.




**Depends on:** UL-20 · **Release:** `0.15.0` · **Gates in TaoTale:** TAO-22 (hard)




#### UL-35 — Slider




**Goal:** A single-value range control that stays fast under constant updates.




**Scope**
- One thumb; min, max and step.
- Keyboard: arrows, Page Up/Down, Home/End. Pointer and touch dragging, using the pointer-capture helper (UL-16).
- An `aria-valuetext` formatter, e.g. for times.
- Two callbacks: continuous `onValueChange` and a commit callback when interaction ends.
- High-frequency controlled updates re-render nothing beyond the thumb and track — proven by a performance test.
- RTL support.




**Exit criteria**
- [ ] Component Definition of Done met; `0.16.0` published.




**Depends on:** UL-14, UL-15, UL-16 · **Release:** `0.16.0` · **Gates in TaoTale:** TAO-23, TAO-26 (hard); TAO-24, TAO-25, TAO-27




#### UL-36 — Combobox / Autocomplete




**Goal:** Filterable single and multiple selection.




**Scope**
- Single and multiple selection, with chips for multiple values.
- Virtual focus via `aria-activedescendant` (UL-17), so focus stays in the input.
- Filtering, built-in or consumer-controlled. **Filtering and selection wait until IME composition ends** (UL-16) — essential for Chinese and Korean input.
- An async loading state and a localisable empty state.
- Data-first, like Select (product strategy Q4): `items` is the source of truth, with default parts and optional custom parts.
- A "create option" affordance and a maximum number of selections.
- WAI-ARIA combobox keyboard pattern, removing chips by keyboard, and announced result counts.
- Form integration.




**Exit criteria**
- [ ] Component Definition of Done met, including composition tests with Chinese and Korean input.
- [ ] `0.17.0` published.




**Depends on:** UL-16, UL-17, UL-21, UL-23, UL-32 · **Release:** `0.17.0` · **Gates in TaoTale:** TAO-28, TAO-29 (hard)




#### UL-37 — FileDropzone




**Goal:** Accessible file selection by drag-and-drop or keyboard.




**Scope**
- Drag-and-drop, plus click and keyboard activation of a native file input.
- `accept` and `multiple`.
- A consumer validation hook. No business rules are built in; a size limit may appear only as an optional hint.
- Idle, drag-over, disabled and invalid states; preview and file-list slots; accessible instructions.
- No upload logic.




**Exit criteria**
- [ ] Component Definition of Done met; `0.18.0` published.




**Depends on:** UL-20, UL-21 · **Release:** `0.18.0` · **Gates in TaoTale:** TAO-31 (hard); TAO-30, TAO-32–TAO-35




#### UL-38 — Table primitives




**Goal:** Styled semantic tables with row selection. It is **not** a data grid — no virtualization; see UL-49.




**Scope**
- Table parts: caption, head, body, row, cell. Density options and a sticky header.
- A sortable header button with `aria-sort`.
- Row selection: a select-all checkbox with the indeterminate state, plus a selection-state helper.
- A row-actions slot, and truncation that keeps the full text accessible.
- A keyboard-scrollable overflow container; empty and loading rows.




**Exit criteria**
- [ ] Component Definition of Done met; `0.19.0` published.




**Depends on:** UL-22, UL-23 · **Release:** `0.19.0`




#### UL-39 — Toast




**Goal:** Non-blocking notifications.




**Scope**
- An imperative API: show, update, dismiss.
- A region whose live-region politeness follows the toast's tone.
- Queue limits; timeouts that pause on hover or focus; an action button.
- Positions; presence with reduced motion; correct layering with dialogs; localisable labels.




**Exit criteria**
- [ ] Component Definition of Done met; `0.20.0` published.




**Depends on:** UL-20, UL-24, UL-25 · **Release:** `0.20.0` · **Gates in TaoTale:** TAO-39 (hard, with UL-38); TAO-36–TAO-38, TAO-40, TAO-41




#### UL-40 — Tabs




**Goal:** Complete the 08 §4.1 "selection and navigation" set. Tabs are not on the design partner's MVP path.




**Scope**
- Roving focus from UL-17; automatic or manual activation; orientation; lazy panels; the keyboard pattern.




**Exit criteria**
- [ ] Component Definition of Done met; `0.21.0` published.




**Depends on:** UL-17 · **Release:** `0.21.0`




### Phase P8 — 1.0 hardening and commercial launch




#### UL-41 — Documentation completion




**Goal:** Every public export is documented to the standard of a commercial product.




**Scope**
- Every component documented to the template.
- Guides: getting started; CSS delivery; theming; custom themes; dark mode and first paint; customization and overrides; accessibility responsibilities (what the library guarantees vs what the consumer must do); SSR; router integration; localisation/RTL; browser support; upgrade and migration policy.
- A maintainer section for the internal primitives: architecture, invariants, test strategy.
- Examples gallery and a generated API reference.




**Exit criteria**
- [ ] Docs review checklist complete; no public export is undocumented.




**Depends on:** UL-40 · **Gates in TaoTale:** TAO-42–TAO-46




#### UL-42 — Accessibility audit and conformance report




**Goal:** Evidence-based accessibility claims, as commercial buyers expect.




**Scope**
- Audit each component and primitive:
- keyboard;
- screen readers: NVDA with Firefox/Chrome, VoiceOver on macOS and iOS, TalkBack on Android (JAWS optional);
- contrast and forced colors;
- 200% zoom and 320 px reflow;
- reduced motion, target sizes, touch and IME input.
- Fix all critical and serious findings.
- An external expert audit is strongly recommended, because the behavior layer is in-house.
- Publish an Accessibility Conformance Report (VPAT® WCAG edition or equivalent) listing known limitations.




**Exit criteria**
- [ ] No open critical or serious findings.
- [ ] Conformance report published; `0.22.0` published.




**Depends on:** UL-40 · **Release:** `0.22.0` · **Gates in TaoTale:** TAO-47 (hard)




#### UL-43 — Performance, bundle budgets and compatibility




**Goal:** Measured performance and verified compatibility (08 §5).




**Scope**
- Per-entry JS/CSS budgets, based on the recorded baselines, enforced in CI.
- Compatibility checks:
- tree-shaking verified across bundlers (Vite/Rollup, esbuild, and the webpack family if UL-05 says so);
- SSR hydration tests;
- the `solid-js` peer-range and browser matrix.
- Leak and stress checks:
- memory and listener leak tests (mount/unmount loops);
- stress tests: continuous Slider updates, Select/Combobox with 1,000 options, positioning cost while scrolling.




**Exit criteria**
- [ ] Budgets enforced in CI; compatibility matrix green.
- [ ] `0.23.0` published.




**Depends on:** UL-40 · **Release:** `0.23.0` · **Gates in TaoTale:** TAO-48 (hard); TAO-49, TAO-50




#### UL-44 — API freeze and 1.0 release candidate




**Goal:** A stable 1.0 API that has been validated in real applications.




**Scope**
- API review of names, props, events, slots, CSS variables and state attributes. Mark each export stable or experimental. Remove APIs deprecated during 0.x. Write the 0.x → 1.0 migration guide.
- Publish `1.0.0-rc.N`. The design partner (TaoTale) and the fixtures must run the RC with their end-to-end tests green.
- Bug bash, then a freeze window with fixes only.




**Exit criteria**
- [ ] RC published and validated by at least one real application plus the fixtures.
- [ ] No open release-blocking issues.




**Depends on:** UL-41, UL-42, UL-43 · **Release:** `1.0.0-rc.N` · **Gates in TaoTale:** TAO-51 (hard)




#### UL-44a — Launch kit




**Goal:** Everything the one public launch at 1.0 needs besides the components (product strategy Q2, Q3, Q9 and Q10).




**Scope**
- Theme builder on the docs site: accent, neutral, radius, density and font on real components, exporting CSS variables, with three to five distinct presets.
- SaaS starter built on Start mode, deployed as a live demo, with a client-only variant.
- Copy-and-own blocks, including the application shell and the command menu, published in the shadcn registry format (universal items with explicit targets) and copyable from the docs. Blocks are tested like fixtures against every release.
- Consumer lint rules for Eroxo misuse and Solid 2 pitfalls.
- Landing page. The showcase is the starter's live demo and the blocks gallery; it does not feature TaoTale.




**Exit criteria**
- [ ] Every item is live, and the blocks install with `npx shadcn add` into a fresh Start-mode app.




**Depends on:** UL-44




#### UL-45 — 1.0 GA and commercial launch




**Goal:** Ship 1.0 as a supported commercial product.




**Scope**
- Final legal review, including the counsel review moved from UL-03 and the clean-room record; LICENSE and third-party NOTICE files.
- Publish `1.0.0`, with versioned docs.
- Product website, support channels and support policy.
- Maintenance/LTS policy, e.g. security fixes for the previous major for a stated period.
- Trademark status.
- If UL-03 chose a paid tier: pricing, checkout and licence delivery.
- The one public launch (product strategy Q2): the announcement on every channel, together with the UL-44a launch kit. The 0.x releases before it were published but not announced.
- No telemetry or licence checks in components.




**Exit criteria**
- [ ] `1.0.0` published on the `latest` channel.
- [ ] Legal review closed; support and LTS policies published.




**Depends on:** UL-03, UL-44, UL-44a · **Release:** `1.0.0` · **Gates in TaoTale:** TAO-52, TAO-53, TAO-55, TAO-56, TAO-57, TAO-60




### Phase P9 — Post-1.0




Each milestone ships as a 1.x minor unless noted. It gets a full Goal/Scope/Exit section when it is scheduled.




| ID | Milestone | Content | Gates in TaoTale |
|---|---|---|---|
| UL-46 | Responsive and touch hardening | Small-screen audit of every component; overlays that survive the on-screen keyboard; safe-area insets; touch gestures for the Drawer from UL-29a; a full-screen dialog variant. | part of TAO-59 |
| UL-47 | Navigation and menus | NavigationMenu, Breadcrumbs, ContextMenu. | TAO-59 (hard) |
| UL-48 | HoverCard | HoverCard. Accordion and Collapsible moved to UL-23a on 24 November 2026. | TAO-54, TAO-58 (hard) |
| UL-49 | Data components | DataTable (sorting/filtering state, column visibility) and a virtualized list. | — |
| UL-50 | Date and number inputs | NumberField, Calendar/DatePicker (Intl-aware). | — |
| UL-51 | Design-token interchange and design kit | Token export in the W3C Design Tokens Community Group format; a design-tool kit. The theme builder moved to UL-44a. | — |
| UL-52 | Public headless package (evaluate) | Offer the in-house primitives as a separately versioned headless package for teams that bring their own styles — only if the UL-05 boundary has held up and there is demand. Needs its own API review, docs and stability commitment. | — |
| UL-53 | Commercial expansion (conditional on UL-03) | Paid components, templates and theme presets; licence delivery; customer-support processes. | — |




---




## 5. Release and versioning plan




| Stage | Versions | Rule |
|---|---|---|
| Pipeline, tokens, behavior layer, theming (UL-10–UL-19) | `0.0.0-canary.*` | Internal validation only; never a TaoTale gate artifact. |
| Components and overlay engine (UL-20–UL-40) | `0.1.0` … `0.21.0` | One 0.x minor per milestone; patches for fixes. 0.x minors may break (semver 0.x), and every break gets a migration note. |
| Hardening (UL-42–UL-43) | `0.22.0`, `0.23.0` | Accessibility and performance fixes. |
| Release candidate (UL-44) | `1.0.0-rc.N` | API frozen; fixes only. |
| GA and later (UL-45+) | `1.0.0`, then 1.x | Strict semver. Public API = props, exports, CSS variables, slots, state attributes and documented class names. |




Consumers pin exact versions before 1.0. The planned version numbers are a guide; the actual version that completes each milestone is recorded when the milestone is Done.




**Public launch (product strategy Q2).** The 0.x releases are published but not announced; they serve TaoTale and early validation. The one public launch is 1.0 (UL-45). Milestones with a letter suffix publish a 0.x minor like their neighbours, so later planned version numbers shift.




## 6. Open decisions and where they close




| Open decision (08 §10, 02 OPEN-10/11) | Closed in |
|---|---|
| Public package name, repository ownership | UL-02, UL-05 |
| Licence, clean-room policy and publication workflow | UL-03, UL-10 |
| Token prefix, slot/selector naming, variant contract | UL-02, UL-06 |
| CSS import strategy, internal styling/build implementation | UL-04, UL-05 |
| Docs/examples site | UL-05, UL-11 |
| Behavior-layer architecture (internal module vs public headless package) | UL-05, UL-52 |
| Native-first overlay choices (`<dialog>`, Popover API, `inert`, CSS anchor positioning) | UL-04, UL-05 |
| Collection model (data props vs registered children) | Product strategy Q4, 24 November 2026; UL-17 implements |
| Animation/presence implementation | UL-05, UL-25 |
| Icon library, motion library | UL-05 |
| Theming-helper scope, `unstyled` mode | UL-06, UL-18 |
| Which components are in the v1 stability commitment | UL-44 |




## 7. Risks




| Risk | Mitigation |
|---|---|
| The in-house behavior layer is the largest technical scope and the main accessibility risk | The WAI-ARIA APG as the specification; executable keyboard tables; tests in three browser engines from UL-09; a manual screen-reader check per primitive; an external audit in UL-42; primitives built just before the components that need them. |
| Positioning edge cases: nested scroll containers, transforms, zoom, RTL, on-screen keyboards | A dedicated engine milestone (UL-26) with geometry and visual tests; CSS anchor positioning evaluated as an enhancement. |
| Keyboard handling or controlled inputs break IME (Chinese/Japanese/Korean) input | The composition guard (UL-16), composition tests in UL-21 and UL-36, and manual checks with Chinese and Korean input methods. |
| Copied third-party code undermines the commercial licence | The clean-room policy (UL-03, 08 §2.3); attribution recorded whenever code is adapted. |
| The larger 1.0 scope delays the design partner | Primitives are built only when the next component needs them; TaoTale's backend work continues in sequencing-gated blocks. |
| The Solid 2 ecosystem lags, or another Solid major lands during 0.x. The Solid 2.0 announcement retired SolidStart | Explicit peer range; test matrix; SSR verified with a plain `@solidjs/web` app and, from UL-09b, Start mode in `@solidjs/vite-plugin`; consider TanStack Solid Start once it is stable; revisit ADR 08 when the platform changes. |
| CSS silently dropped by bundlers (`sideEffects`) or broken under SSR | Proven in real fixtures from UL-08; per-bundler checks in UL-43. |
| Name or trademark conflict discovered after launch | Knockout search and reservation in UL-02; counsel review in UL-03 and UL-45. |
| The licence model hurts adoption or revenue | Decided early, with counsel; open-core leaves room for UL-53. |
| Speculative components delay the design partner | P7 ordered by real needs; 1.0 scope frozen in UL-01. |
| Design-partner styling leaks into the generic defaults | Default theme designed separately (UL-12); TaoTale's Quiet Study stays in TaoTale. |
| Single-maintainer bus factor | ADRs, CI automation and maintainer docs for the primitives from day one. |









