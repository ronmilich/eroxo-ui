# Eroxo UI · Product strategy

**Status:** Approved by the owner on 24 November 2026. Section 11 records each decision; Q12 (interviews) is deferred until before the launch. The decisions are applied to the [UL-01 charter](ul-01-charter.md), the [roadmap](ui-library-roadmap.md), [ADR 08](adr/08-support.md) and the [component rulebook](design-system/eroxo-iris-component-anatomy-api-spec.md).

**Inputs:** the owner's market-research draft (24 November 2026, not in the repository), the approved charter, ADRs, Iris specifications and roadmap, and a scan of the Solid ecosystem and of leading libraries' agent tooling on 24 November 2026 ([sources](#sources)).

## 1. The proposal in brief

Eroxo UI should aim to become **the default way to build polished Solid 2 applications, for developers and for the coding agents they work with.** The charter's quality bar stays: in-house accessible behavior, plain CSS with tokens, SSR and tests in three browser engines. This proposal changes who we build for, what we build around the components, and when we tell the world.

The timing favours it. Solid 2 shipped on 17 November 2026, no styled component package supports it yet, and a complete styled kit is what Solid developers most often say they miss (3.1).

| ID | Proposal |
|---|---|
| S1 | Target **curious developers first and startups second**: curious developers are the launch audience and startups the adoption audience, with the tie-break rules in section 4. Treat **coding agents** as a first-class consumer of every API. Enterprises are not a target before 1.0, but the cheap enterprise-friendly engineering already decided stays. |
| S2 | Position Eroxo UI as **the polished, accessible, agent-ready component library for Solid 2**, built on the modern web platform. |
| S3 | Make the **agent kit** the main differentiator. Build it in order of evidence: agent-friendly APIs and types, version-matched docs inside the npm package with an AGENTS.md index, web Markdown and `llms.txt`, a focused Agent Skill, consumer lint rules, and a block registry that existing MCP clients can already read. Build our own MCP server only if real use shows a gap. |
| S4 | **Keep the agent kit complete without AI test runs:** deterministic CI checks guard it on every change, and agent convenience is judged from real use and user reports (Q7). |
| S5 | **Launch publicly once, at 1.0**: complete, audited and stable at first contact, with the theme builder, a starter template, the first blocks and the agent kit. The 0.x releases are published but not announced, and serve TaoTale. |
| S6 | Close the **startup gaps** before 1.0: add Avatar, layout primitives, Drawer and Accordion/Collapsible to the catalog; ship an application shell and a command menu as blocks; style native date and time inputs, with DatePicker after 1.0; and move the theme builder from UL-51 into the 1.0 launch. |
| S7 | **Own the composition, rent the behavior:** ship blocks and templates as copy-and-own source, and keep components and behavior in the versioned package. |
| S8 | **Interoperate without lock-in:** a Tailwind v4 token bridge, any icon set, form-library recipes and router links, with nothing new required. |
| S9 | **Consider validating before the launch** with 10–15 interviews and usability tests; the owner decides before the launch (Q12). |
| S10 | Record an explicit **not-now list**, so the plan stays sized for one maintainer working with agents. |

Section 7 maps these onto the roadmap. Section 11 lists the questions for the next round.

## 2. What changes from the approved charter

| Topic | Charter today | Proposed |
|---|---|---|
| Who we serve | "A SolidJS team" | Curious developers and startups on Solid 2, plus the coding agents they use |
| Gap we fill | A versioned, styled Solid package with plain CSS, five customization layers and first-party behavior | The same, plus the best agent experience in the Solid ecosystem and copy-and-own blocks |
| 1.0 catalog | Frozen list | Adds Avatar, layout primitives, Drawer and Accordion/Collapsible (Q3), recorded under the charter's change rule |
| Success measures | Accessibility, bundle size, design-partner adoption | The same, plus activation time, agent-kit completeness and adoption signals (section 8) |
| First public release | `0.1.0` at UL-20 (Button) | 0.x releases are published but not announced, and serve TaoTale; the public launch is 1.0 (UL-45) |
| Market scan | Five projects, checked 23 November | Add Vercel Labs' UI SDK and each project's Solid 2 status (3.1) |
| Framework-level SSR target | SolidStart, once it supports Solid 2 (ADR 08) | The Vite plugin's Start mode, because SolidStart is retired (3.1) |

## 3. Market reality check

### 3.1 Solid 2 and its UI ecosystem

Checked on 24 November 2026 against the npm registry and official announcements.

- **Solid 2 is one week old.** `solid-js` 2.0.0 was published on 17 November 2026; the latest is 2.0.3. In the week to 23 November, 2.x made up about 4% of `solid-js` downloads (519,000 of 12.5 million).
- **SolidStart is retired.** The Solid 2.0 announcement says "We retired our metaframework SolidStart". Its replacement is Start mode in `@solidjs/vite-plugin` 3 (`start: true`, plus `ssr: true` for streaming SSR), the plugin Eroxo already builds with. No SolidStart release supports Solid 2. TanStack Solid Start supports Solid 2 in its 2.0 release candidate.
- **Solid ships agent tooling itself.** `solid-js` 2.0.3 contains three Agent Skills (Solid 2.0, a cheatsheet and reactivity diagnostics), `docs.solidjs.com/llms.txt` covers 2.0, and the Vite plugin exposes a diagnostics endpoint for agents.

| Project | Kind | Solid 2 status | Weekly downloads |
|---|---|---|---|
| Kobalte | Headless | `2.0.0-alpha.5` (20 November) supports Solid 2; the stable 0.13 line is Solid 1 | 6.7 million, much of it through TanStack Query's devtools, which depend on it |
| Ark UI | Headless, on Zag | 5.40 imports `solid-js/web`, which Solid 2 removed; Zag's Solid adapter has a Solid 2 pre-release | 102,000 |
| UI SDK (Vercel Labs) | Headless, several frameworks | Built for Solid 2; beta since 12 November 2026; Apache-2.0; ships Markdown docs, `llms.txt` and an agents file in the package | 17,000 |
| corvu | Headless | Solid 1; its Solid 2 branch has stalled since February 2025 | About 355,000 each for dialog and drawer, mostly as dependencies |
| solid-ui | Styled copy-paste, Tailwind on Kobalte | A rewrite on Solid 2 and UI SDK is in an open pull request | 17,000 (CLI) |
| shadcn-solid | Styled copy-paste, Tailwind on Kobalte | Solid 1; last commit February 2026 | 2,300 (CLI) |
| Park UI | Styled copy-paste, Panda on Ark | Tied to Ark's Solid 1 build | 2,900 (CLI) |
| SUID, solid-bootstrap, Hope UI | Styled packages | Solid 1, stale or archived; a Hope UI rewrite waits for Solid 2 | 2,000–4,500 each |

**What this means**

- **No styled, Solid 2-native component package exists yet.** The headless layer is being contested (Kobalte's alpha, UI SDK, Zag), and the styled copy-paste kits are being rebuilt on top of it. The gap the charter describes is real and open now. How long it stays open is unknown; the solid-ui rewrite and Kobalte's alpha suggest months rather than years.
- **What Solid developers say they miss** (forum opinion on GitHub and Hacker News): a complete styled kit like MUI or Mantine; libraries that will not be abandoned, since one-person projects feel risky; copy-paste CLIs and registries that do not break; dependencies that let them move to Solid 2; and fewer, better options instead of many small shadcn ports.
- These complaints favour the charter's choices: a versioned package rather than copy-paste for components, complete coverage and visible maintenance. They also warn that blocks (6.4) must be tested against every release.
- **UI SDK is new since the charter's market scan.** It is the first well-resourced headless engine for Solid 2. TT-032 keeps behavior in-house, and this proposal does not change that: UI SDK is a twelve-day-old beta, and the in-house layer is Eroxo's quality differentiator. The owner decided not to review it (Q13); it joins the market scan for completeness.

### 3.2 Agent tooling is now standard among leading libraries

Checked on 24 November 2026:

| Library | Docs in the npm package | `llms.txt` or page Markdown | Agent Skills | Official MCP server | Copy-and-own |
|---|---|---|---|---|---|
| shadcn/ui | n/a (no package) | Yes | Yes | Yes, and it reads any compatible registry | Registry and CLI |
| Mantine | No | Yes | Yes | Yes | Copy-paste examples |
| MUI | Yes, not announced | Yes | Yes | Yes | No |
| Chakra UI | No | Yes | Yes | Yes | Snippets CLI; blocks need Pro |
| Base UI | Yes, not announced | Yes | No | No | No |
| Radix | No | Page Markdown only | No | No | No |
| Ark UI / Park UI | No | Yes (Ark) | No | Yes (Ark) | Park CLI |
| Nuxt UI | No | Yes | Yes | Yes, hosted | Starter templates |
| HeroUI | Yes, plus an `agents-md` command that indexes them | Yes | Yes | Yes | CLI |
| daisyUI | No | Yes | Yes | Paid only (Blueprint) | No |

- `llms.txt`, page Markdown, skills and MCP servers are now table stakes. Having them is expected; having them is not a differentiator.
- Version-matched docs inside the package are still rare among the large libraries, and only HeroUI also writes an index into the user's AGENTS.md. In the Solid 2 ecosystem they are already the norm: `solid-js` ships Agent Skills and UI SDK ships Markdown docs (3.1). For Eroxo they are the baseline. The differentiators are agent-friendly API conventions, styled completeness and the blocks.
- shadcn's registry format works with any framework. "Universal" items install into any project without React, Tailwind or a `components.json`, and shadcn's MCP server browses any compatible registry; the public index lists 593. A shadcn-compatible Eroxo registry would give agents an installer and MCP access without building either.

### 3.3 What actually helps agents

- **Vercel's Next.js evaluation (January 2026, vendor-run, sample size and models not published):** no docs 53%; an Agent Skill 53%, because agents never invoked it in 56% of cases; the skill plus an explicit instruction 79%; a compressed docs index in AGENTS.md 100%.
- **What Next.js did next:** since 16.2 (March 2026) the docs ship as Markdown inside the `next` package, and `create-next-app` writes AGENTS.md. Since 16.3, `next dev` keeps a marked AGENTS.md block current, and Vercel retired its knowledge skills and MCP knowledge tools. On its public leaderboard (October 2026), frontier models pass either way once the docs are installed, and other models gain 7–18 points from the AGENTS.md pointer.
- **Independent studies are more cautious.** Repository context files do not generally raise success and add over 20% cost, except where a project departs from common practice (Gloaguen et al.). Most public skills have no significant effect (92 of 98 in SWE-Skills-Bench), while focused, curated skills do help (33.9% to 50.5% in SkillsBench).
- **Post-training libraries benefit most.** Context7's vendor benchmark cut invented APIs from 10 to 0 on libraries newer than the model.
- **`llms.txt` is rarely fetched:** 97% of 137,000 sites saw no requests, though Claude Code was the second-largest AI fetcher.

**Conclusion for Eroxo UI.** Solid 2 and Eroxo are exactly the "post-training, non-standard" case where shipped docs help most. Ship version-matched docs in the package and an always-loaded AGENTS.md index first. Keep the skill small and focused on workflows. Generate `llms.txt` because it costs almost nothing. Do not build our own MCP server at first; publish a shadcn-compatible registry and let existing MCP clients use it. The evidence is mixed and mostly vendor-run, so start with the strongest pattern and adjust from real use.

### 3.4 Market size

- **State of JS 2025:** 10% of respondents have used Solid, with 89% retention and 55% interest.
- **Stack Overflow 2026:** 1.5% used Solid, against 41.5% for React; 55.5% of Solid users admire it.
- **npm, week to 23 November:** `@solidjs/web`, Solid 2's renderer, had 412,000 downloads; `react` had 275 million.

The audience is small, loyal and curious, which is exactly who this proposal targets. Eroxo UI cannot win on React's scale, but it can become the default styled library for Solid 2. Measure adoption as a share of Solid 2 installs (section 8), not in absolute numbers.

## 4. Who we build for

**Owner decision (Q1), 24 November 2026.** Curious developers are the launch audience and startups are the adoption audience. When their needs differ:

- Curious developers decide first-impression choices: the look, setup, docs, playground and launch content.
- Startups decide product choices: coverage, stability, upgrades, forms and data.
- In a real conflict, stability in the package wins. Novelty belongs in demos, blocks and docs.
- Every API choice must also pass the agent conventions (6.2).

### 4.1 Curious developers (launch audience)

Early adopters who try Solid 2 because it is new and fast: side projects, indie products, open-source tools, people who write and stream about what they build. They decide in minutes and tell others what they liked.

- **They want:** a beautiful first screen in minutes, idiomatic Solid 2, modern platform features, readable code, small bundles and nothing to unlearn.
- **They leave when:** setup takes more than a couple of steps, the demo looks generic, an example is broken, or the project looks abandoned.
- **We give them:** imports that work without a provider or an extra build plugin, a live playground and theme builder, StackBlitz starters, honest engineering write-ups, and the public roadmap and ADRs that already exist.

### 4.2 Startups (adoption audience)

Small teams of 1–10 engineers building B2B SaaS, internal tools or AI products, usually with coding agents in the loop.

- **They want:** the screens every product needs (forms, tables, dialogs, menus, toasts, settings, sign-in, an application shell), their own brand in an afternoon, and upgrades that do not break them.
- **They leave when:** a missing component forces a second library, a release breaks their app, or the product cannot look like theirs.
- **We give them:** startup-complete coverage (S6), blocks and a SaaS starter (S7), a theme builder, a migration note for every break, and an agent kit that lets their agents build screens correctly.

### 4.3 Coding agents (a consumer, not a buyer)

Claude Code, Codex, Cursor, Copilot and similar tools write more and more of the code that imports a UI library, and they increasingly suggest which library to use. They know little or nothing about Solid 2 or Eroxo UI, and they fall back on React or Solid 1 habits.

- **They need:** documentation that matches the installed version and sits where they look, names they already know, types that reject wrong usage, errors that say how to fix the problem, and examples that compile.
- **They fail when:** the docs exist only on a website, the API differs from familiar libraries without a reason, or a mistake fails silently.

### 4.4 Not targeted before 1.0

Enterprises. Solid 2 is too young for most enterprise platform decisions, and enterprise programs (LTS contracts, commercial support, multi-version micro-frontend testing, design-tool libraries) would consume the time that curious developers and startups need. We keep the cheap foundations already decided: cascade layers, the `erx` prefix, scoped themes, accessibility evidence, semver, and no network requests or telemetry.

TaoTale stays the design partner and the first real application, but Eroxo's marketing does not feature it (Q10). The SaaS starter, deployed as a live demo, and the blocks gallery are the showcase.

## 5. Positioning and principles

**Positioning:** Eroxo UI is the polished, accessible component library for Solid 2, built on the modern web platform and ready for your coding agent.

**Tagline candidates:** "Beautiful Solid apps, built by you and your agent." · "Polished by default. Yours by design. Ready for agents."

The research draft lists 20 principles. Twenty principles cannot settle a trade-off, so this proposal keeps eight, in priority order:

1. **Correct before complete.** Accessibility and behavior quality outrank component count.
2. **Agent-native.** Every public API is typed, documented in Markdown and versioned with the code, and CI checks that the agent kit is complete.
3. **Beautiful by default, yours by design.** Strong defaults, and every visual decision reachable through tokens and documented hooks without forking.
4. **One obvious way.** Shared vocabulary across components, familiar names, one pattern per task in the docs.
5. **Platform-first and Solid-native.** Native HTML and CSS where they meet the contract; fine-grained reactivity and no React habits.
6. **Zero-config start, progressive depth.** One import renders a styled component, and complexity appears only when the task needs it.
7. **Own the composition, rent the behavior.** Applications own their screens; the library maintains the hard behavior.
8. **Honest and visible.** Measured size, published limitations, a public roadmap and predictable releases.

## 6. The plan

### 6.1 Core library

The roadmap's quality bar stays. It is what lets agents produce accessible interfaces: an agent cannot be trusted to get focus management right, so the library has to.

- **Agent-ready definition of done.** Add to roadmap §2.5: complete JSDoc on every public prop (description, default, short example), an entry in the component metadata, a Markdown page shipped in the package, and development warnings in the standard format (6.2).
- **Catalog additions before 1.0 (S6, decided in Q3).** Each needs a charter change record with its consumer evidence, cost, affected releases and owner approval. Until interviews exist (Q12), the evidence is the research in section 3:
  - Avatar, with the display primitives in UL-23;
  - layout primitives (`Stack`, `Inline`, `Grid`, `Container`) with token-based gaps, also in UL-23. They give agents a layout vocabulary instead of ad-hoc CSS, and their props extend the UL-06 vocabulary and lint rules;
  - Drawer, built as a side-anchored Dialog in UL-29a. Touch gestures, safe areas and the full-screen dialog variant stay in UL-46;
  - Accordion and Collapsible on native `<details>`, in UL-23a. UL-48 keeps HoverCard.
- **Blocks, not components:** the application shell and the command menu ship in the launch kit (6.4), so the catalog does not grow.
- **Dates:** UL-21 styles TextField's native `date`, `time` and `datetime-local` inputs. DatePicker stays in UL-50, after 1.0.
- **Collections (decided in Q4).** Select and Combobox take `items` as their source of truth. With no parts, `Root` renders the default parts, as in `<Select.Root items={countries} />`; parts customize how the same items render. DropdownMenu, Tabs, RadioGroup and ToggleGroup keep JSX children.
  - This amends UL-06's rule for interactive compositions and closes the roadmap's open collection-model decision: UL-17 builds one keyboard and typeahead core, fed either by a data collection or by registered children.
  - UL-32 (Select) and UL-36 (Combobox) add the default rendering.
  - The short form saves code and agent mistakes, and a data source lets a closed Select show its selected label during SSR.

### 6.2 Agent kit

**Goal:** an agent with no prior knowledge of Eroxo UI produces correct, accessible, on-theme code for common product tasks on the first attempt, against the installed version.

**API conventions for agents**, added to the UL-06 rulebook:

- **Familiar names.** Prefer the vocabulary agents already know from Radix, Base UI, Ark and Kobalte: `Root`, `Trigger`, `Content`, `open`/`onOpenChange`, `value`/`onValueChange`. UL-06 already does this. Make it a rule and publish a "coming from shadcn, Radix or Kobalte" mapping.
- **Types first.** Literal unions, no `any`, JSDoc with defaults and examples, and type-level enforcement of required accessible names where possible, so an IconButton without a label fails to type-check.
- **Errors that teach.** Development warnings use one format: `[eroxo-ui] IconButton: missing accessible name. Pass label="…". <docs URL>.md`.
- **Inspectable runtime.** Stable `erx-*` classes and `data-erx-*` state attributes let agents check their results with browser tools.
- **Tokens for styling.** Guidance and examples style through `--erx-*` tokens and documented hooks, never hard-coded values. In Tailwind projects, the AGENTS.md index points agents to the bridge's theme-aware utilities (6.5).

**Deliverables**, generated from one metadata source so they cannot drift apart:

| # | Deliverable | Where it lives | Why |
|---|---|---|---|
| A1 | Component metadata: props and defaults from TypeScript; parts, state attributes, CSS variables, keyboard tables and examples from the docs source | Package and docs site | One source for every channel below |
| A2 | Markdown docs, one file per component and guide | Inside the npm package (for example `eroxo-ui/docs/`), matching the installed version | Agents read the project before the web, and models know nothing of post-training APIs (3.3) |
| A3 | An AGENTS.md index: a compact, marked block with the components, key rules and paths to A2, written and refreshed by `npx eroxo-ui agents-md`, a zero-dependency script inside the package that runs only when called (Q8); it also creates a CLAUDE.md that imports AGENTS.md when none exists | The consumer's AGENTS.md | The pattern that scored 100% in Vercel's evaluation; passive context is read on every task, while skills and tools are invoked only sometimes |
| A4 | A Markdown twin of every docs page, `llms.txt` and `llms-full.txt` | Docs site | Nearly free to generate; serves agents that browse or fetch |
| A5 | A small Agent Skill `eroxo-ui` for workflows: set up, theme, build a form, compose overlays, check accessibility | Repository, installable with `npx skills add` | Workflow knowledge that reference pages do not carry; kept small, and reviewed against what agents get wrong in real use |
| A6 | Solid 2 guidance by reference: the index points agents to the Agent Skills inside `solid-js` and to Solid's `llms.txt`; our skill adds only UI patterns such as forwarding props with `omit` and `merge`, refs and controlled state | Inside A3 and A5 | Models default to React and Solid 1 habits, and Solid already maintains the general guidance (3.1) |
| A7 | Consumer lint rules for Eroxo misuse and Solid 2 pitfalls | A separate package | Agents fix what a linter reports |
| A8 | Block registry in the shadcn registry format, using universal items with explicit targets so they install into Solid projects; listed in the public registry index | Docs site | Agents install blocks with `npx shadcn add`, and the shadcn MCP server can browse them, with nothing for us to build (3.2) |
| A9 | Our own MCP server | Only if real use shows a gap that A2–A8 do not close | Vercel retired its MCP knowledge tools for Next.js; the always-loaded index did better |

**Agent-readiness checks (S4, decided in Q6 and Q7):**

- Every CI run blocks on deterministic checks: docs examples compile and render, every public prop is documented, the metadata and package docs are complete, and the `agents-md` output is valid. They involve no AI and cost nothing extra.
- There are no automated AI test runs. Agent convenience is judged from real use: building TaoTale, the blocks and the starter with coding agents, and reports from users.
- When agents keep making the same mistake, fix the docs or the API, and add the case to the component page's "Common mistakes" section.

### 6.3 Docs, examples and playground

ADR 11 stays: a Vite app with Markdown compiled at build time and Solid islands. Extend UL-11 so the agent channels exist from the first page:

- every page is also emitted as Markdown, together with `llms.txt`, `llms-full.txt` and the A1 metadata;
- examples are real `.tsx` files that are compiled, type-checked and tested, and the same files feed the docs site, the package docs and the skill;
- each component page adds "When to use", "When not to use" and "Common mistakes" to the roadmap's template;
- every example and starter opens in StackBlitz.

Move the **theme builder** from UL-51 into the 1.0 launch. It edits accent, neutral, radius, density and font on real components and exports CSS variables, with DTCG tokens later. Ship three to five presets that look nothing alike, to prove an app does not have to look like Eroxo.

### 6.4 Blocks and templates

Blocks are application code: sign-in and sign-up, settings, a data-table page with filters and bulk actions, an application shell (sidebar navigation, header, breadcrumbs and a mobile Drawer), a command menu (Dialog and Combobox), empty and error states, a destructive-confirmation flow and onboarding. The application shell and the command menu are required for the launch (Q3). Consider an AI chat set (thread, streaming message, prompt input), since many startups now build AI products; interviews, if they happen (Q12), can test it.

- Blocks use only public Eroxo exports and tokens. Applications copy them and own them, and package upgrades still reach the behavior inside.
- Blocks are tested like fixtures (type check, axe, browser smoke test). Agents imitate the code already in a project, so good blocks also improve agent output.
- One **SaaS starter** built on the Vite plugin's Start mode, Solid's official replacement for SolidStart, with a client-only variant.
- Distribution (decided in Q9): install with `npx shadcn add <url>` from the Eroxo registry (A8), or copy the code from the block's docs page. Both come from the same block source files.
- The core package and its dependency policy do not change. Blocks may show optional recipes with form or table libraries.

### 6.5 Theming and interoperability

- **Tailwind v4 bridge (decided in Q5).** An opt-in stylesheet, `eroxo-ui/tailwind.css`, maps `--erx-*` tokens into Tailwind v4's theme, so utilities such as `bg-erx-surface` follow light, dark and custom Eroxo themes.
  - A documented, fixture-tested layer order puts Tailwind's preflight below Eroxo components and Tailwind utilities above them. The application's unlayered CSS still wins.
  - It is built with UL-19. Library CSS never uses Tailwind, the package gains no dependency, and Tailwind appears only in a private fixture.
  - The file needs exemptions from two library CSS lint rules (the `erx` layer statement and the `--erx-` prefix), and the style build must pass Tailwind's `@theme` through unchanged.
  - The charter's rule stands: Tailwind is never required.
- **Icons:** the `Icon` wrapper accepts any SVG component; document `lucide-solid` and similar sets next to the vendored subset.
- **Forms:** recipes for TanStack Form and Modular Forms with schema validation.
- **Routing:** link polymorphism (UL-20) with Solid Router and TanStack Router examples.

### 6.6 Community and launch

- **Before the launch:** reserve the npm name, organisation and domain (still open in UL-02), a landing page, a README with a 30-second start, and GitHub Discussions.
- **Channels:** the Solid Discord, r/solidjs, Solid ecosystem listings, Solid community streams and podcasts, X and Bluesky, Hacker News at the 1.0 launch, and technical articles.
- **Stories for curious developers:** native-first overlays (`<dialog>` and the Popover API) in Solid 2, designing a component library for coding agents, and keyboard tables as executable tests.
- **Showcase:** the SaaS starter, deployed as a live demo, and the blocks gallery. TaoTale is not featured (Q10).
- **Trust:** monthly progress notes, a public changelog, a migration note for every 0.x break, and quick issue responses.

## 7. Roadmap mapping

| Phase | Anchor | Outcome | Proposed additions |
|---|---|---|---|
| A · Foundations | Now to UL-19 | Pipeline, docs site, tokens, primitives | Amend the charter (S1, S2, principles, market scan); reserve names (UL-09a); a Start-mode fixture and the ADR 08 update (UL-09b); UL-11 emits Markdown, `llms.txt` and metadata; agent conventions and the Q4 collection rule in UL-06; warning format in UL-14; the Tailwind bridge with UL-19; the deterministic agent-kit checks |
| B · Quiet releases | UL-20 to UL-40 | 0.x releases for TaoTale, published but not announced | Agent-ready definition of done; package docs and the AGENTS.md command from UL-20; the Q3 additions (Avatar and layout primitives in UL-23, Accordion and Collapsible in UL-23a, Drawer in UL-29a); the Agent Skill from UL-31a, updated with each later component |
| C · Launch readiness | UL-41 to UL-44 | Complete docs, accessibility audit, performance budgets, release candidate | The UL-44a launch kit: theme builder, SaaS starter and live demo, first blocks in the shadcn-compatible registry (including the application shell and the command menu), consumer lint rules; a decision on our own MCP server from real use; landing page |
| D · 1.0 launch | UL-45 | Public launch | Published conformance results; the launch campaign on every channel in 6.6 |
| E · After 1.0 | UL-46 onward | Ecosystem | More blocks and templates, community themes, business-model review (UL-53) |

**New milestones (numbered in Q11).** Each takes the number of the milestone it follows plus a letter, so existing numbers, and TaoTale's references to them, never change.

| ID | Milestone | Placed after |
|---|---|---|
| UL-09a | Reserve the npm name, GitHub organisation and domain, moved out of UL-02 so that UL-02 can close | UL-09 |
| UL-09b | Start-mode consumer fixture and the ADR 08 update | UL-09a |
| UL-23a | Accordion and Collapsible (Q3) | UL-23 |
| UL-29a | Drawer (Q3) | UL-29 |
| UL-31a | Agent Skill and Solid guidance (A5, A6), then updated with each component | UL-31 |
| UL-44a | Launch kit: theme builder, SaaS starter and live demo, blocks and registry, consumer lint rules (A7) | UL-44 |

**Folded into existing milestones:** the Tailwind bridge into UL-19; the deterministic agent-kit checks into UL-11 and UL-20; the `agents-md` command into UL-20; Avatar and layout primitives into UL-23; and the counsel review into UL-45, which already holds the final legal review, so that UL-03 can close.

Corrections:

- **ADR 08, UL-08 and the roadmap's risk table wait for a SolidStart release that will not come.** Replace that plan with a consumer fixture in the Vite plugin's Start mode now (UL-09b), and consider TanStack Solid Start once it is stable.
- The 24 November review found UL-10 and UL-11 formally blocked by open UL-02 and UL-03 items. Moving the deferred reservations into UL-09a and the counsel review into UL-45 lets both close, which unblocks UL-10 and UL-11. Reserving the npm name before UL-10 publishes canaries also removes a squatting risk.

## 8. Metrics

| Metric | Why | Proposed first target |
|---|---|---|
| Time to first styled component | Activation friction | 2 minutes or less, timed on the quick start |
| Time to first application screen | Practical productivity | 30 minutes or less for a developer |
| Agent-kit completeness | Agent convenience | Every public prop documented and every docs example compiling, enforced in CI |
| Agent mistakes found in real use | Docs and API clarity | Each one fixed in the docs, the API or "Common mistakes" by the next minor release |
| Share of Solid 2 installs | Adoption measured fairly for a small framework | Weekly downloads as a share of `@solidjs/web`; set the target from the first months after 1.0 |
| GitHub dependents and showcase submissions | Real use, the research draft's north star | Track from 1.0 |
| First response to issues | Trust | 2 working days or less |
| Critical accessibility defects | Quality | None open |

## 9. Not now

- Ports to React or other frameworks. Keep tokens and specifications framework-neutral; Iris stays the name of the design language.
- Enterprise programs: LTS contracts, commercial support, multi-version micro-frontend testing, and a design-tool library before 1.0.
- Advanced components such as a data grid, scheduler, rich-text editor, charts or kanban. Integrating a third-party engine, as the research draft suggests, would also need an ADR under the dependency policy.
- A custom DatePicker before 1.0. TextField styles the native date and time inputs instead (Q3).
- Paid tiers, per the UL-03 decision.
- A race for component count.
- Our own MCP server, unless real use shows a gap that the shipped docs, the index, the skill and the shadcn-compatible registry leave open.
- Automated AI agent test runs (Q7).

## 10. Risks

| Risk | Mitigation |
|---|---|
| Solid 2 adoption is slow: 4% of `solid-js` downloads in its first week | Target the developers who move first; support Vite SPA, SSR and Start mode now; measure adoption as a share of Solid 2 installs |
| A styled Solid 2 kit ships first, such as the solid-ui rewrite on UI SDK or ports on Kobalte's alpha. Launching at 1.0 (Q2) accepts this risk | Compete on completeness, accessibility evidence, agent-ready docs and Tailwind-free theming, not on being first; keep additions before 1.0 small (Q3) so they do not delay the launch further |
| Agent formats keep changing | Generate every channel from one metadata source, and keep the channels that real use shows are worth it |
| Blocks, templates, a CLI and MCP delay the core | Each sits behind a phase; agent-kit layers come in order of evidence |
| Developers distrust one-person libraries, the most common complaint in 3.1 | A visible release cadence, published conformance results, a live demo of the SaaS starter, a stated maintenance policy, and the existing gates and ADRs |
| The default look is not compelling | A visual design source (UL-12), an outside design review, and distinct presets |
| Curious developers try it and leave | Treat the first five minutes as a product: quick start, playground, starters |

## 11. Open questions for the next round

- **Q1 · Decided 24 November 2026.** Curious developers first and startups second, with the decision rule at the start of section 4.
- **Q2 · Decided 24 November 2026.** One public launch, at 1.0 (UL-45). The 0.x releases are published but not announced.
- **Q3 · Decided 24 November 2026.** Before 1.0: Avatar, layout primitives, Drawer, and Accordion/Collapsible as catalog additions; the application shell and command menu as launch blocks. DatePicker waits for UL-50, and TextField styles the native date and time inputs meanwhile (6.1).
- **Q4 · Decided 24 November 2026.** Select and Combobox are data-first, with `items` as the source of truth, default parts and optional custom parts. DropdownMenu, Tabs, RadioGroup and ToggleGroup keep JSX children (6.1).
- **Q5 · Decided 24 November 2026.** Ship an opt-in Tailwind v4 bridge, `eroxo-ui/tailwind.css`, with a tested layer order, built with UL-19. Tailwind is never required (6.5).
- **Q6 · Decided 24 November 2026, revised by Q7.** Deterministic agent-kit checks block every CI run. The pass-rate gate on agent runs was dropped with Q7.
- **Q7 · Decided 24 November 2026.** No automated AI test runs and no evaluation budget. Agent convenience is judged from real use and user reports (6.2).
- **Q8 · Decided 24 November 2026.** `npx eroxo-ui agents-md` ships as a zero-dependency script inside `eroxo-ui`. It always matches the installed version and runs only when called; the package gains no install scripts. UL-20 adds it, with a check in the packed-consumer fixtures.
- **Q9 · Decided 24 November 2026.** Blocks are published in the shadcn registry format and installed with `npx shadcn add <url>`; every block page also offers its code to copy (A8, 6.4).
- **Q10 · Decided 24 November 2026.** Eroxo's marketing does not feature TaoTale. It stays the design partner; the SaaS starter, deployed as a live demo, and the blocks gallery are the showcase (4.4, 6.6).
- **Q11 · Decided 24 November 2026.** New milestones take the number of the milestone they follow plus a letter: UL-09a, UL-09b, UL-23a, UL-29a, UL-31a and UL-44a. Existing numbers never change (section 7).
- **Q12 · Deferred 24 November 2026.** The owner decides before the launch whether to run interviews and usability tests. Deciding before UL-23 lets the answers still shape the catalog additions; later, they can still shape the blocks and the launch kit.
- **Q13 · Decided 24 November 2026.** Vercel Labs' UI SDK joins the charter's market scan for completeness, without a review. TT-032 stands: Eroxo builds its behavior layer in-house.

## 12. The research draft, section by section

| Section | Verdict | Note |
|---|---|---|
| 1 · Market signals | Keep as context | The survey figures are directional, and the MUI and State of React surveys describe React audiences |
| 2 · Three customer groups | Adapt | Developers and startups; enterprises are out of target (4.4) |
| 3 · Competitive analysis | Adapt | Adds Solid 2 status and agent tooling (section 3) |
| 4 · Twelve problems | Keep most | Design-to-code (4.11) waits for token export; automated migrations (4.10) wait for 1.0 |
| 5 · Developer experience | Keep | Progressive complexity through one implementation (6.1); the onboarding targets become metrics (section 8) |
| 6 · Styling and playground | Keep, move earlier | CSS-native is already decided; the theme builder moves into the 1.0 launch; the Tailwind bridge is new |
| 7 · Foundations to templates | Adapt | The package holds foundations and components; patterns, blocks and templates are copy-and-own (6.4) |
| 8 · AI-native | Keep and raise to the main differentiator | Ordered by evidence: passive docs before MCP |
| 9 · Documentation contract | Keep | Merged with the UL-11 and UL-41 page template |
| 10 · Component priorities | Adapt | The charter catalog plus S6; the P3 advanced components wait |
| 11 · Enterprise readiness | Defer | Keep only what is cheap and already decided |
| 12 · Solid focus and other frameworks | Keep the focus | "Iris" stays the design-language name, not the Solid implementation's; no ports |
| 13 · Popularity | Keep | With Solid-specific channels (6.6) |
| 14 · Business model | Defer | UL-03 keeps everything free; nothing here blocks later options |
| 15 · Twenty principles | Condense | Eight, ranked (section 5) |
| 16 · Weighted priorities | Re-weight | With developers 55, startups 45 and enterprises 0, customization, documentation, coverage and visual quality lead, followed by source ownership, API consistency, AI integration, the theme playground and blocks; Figma, micro-frontends and commercial support fall to the bottom |
| 17 · Validation | Deferred | The owner decides on interviews before the launch (Q12); real use continues, without automated agent runs |
| 18 · Roadmap | Replace | Mapped onto the UL milestones (section 7) |
| 19 · Positioning | Adapt | Written for developers and startups (section 5) |
| 20 · Next specifications | Adapt | This proposal, a charter amendment and an agent-kit specification instead of 13 new documents |

## Sources

All checked on 24 November 2026.

**Solid ecosystem**

- [Solid 2.0 announcement](https://www.solidjs.com/blog/solid-2-0-the-long-hold/) · [solid-js on npm](https://registry.npmjs.org/solid-js) · [@solidjs/start on npm](https://registry.npmjs.org/@solidjs%2Fstart) · [@solidjs/vite-plugin](https://www.npmjs.com/package/@solidjs/vite-plugin) · [SolidStart v2 announcement](https://github.com/solidjs/solid-start/discussions/2281) · [Solid 2 release-candidate post](https://github.com/solidjs/solid/discussions/2995) · [Solid `llms.txt`](https://docs.solidjs.com/llms.txt)
- [Kobalte's Solid 2 issue](https://github.com/kobaltedev/kobalte/issues/653) · [UI SDK for Solid](https://ui-sdk.dev/docs/solid) · [Hope UI rewrite](https://github.com/hope-ui/hope-ui) · [npm download counts](https://api.npmjs.org/downloads/point/last-week/solid-js)
- Developer sentiment: [Solid discussion #2550](https://github.com/solidjs/solid/discussions/2550) · [Hacker News](https://news.ycombinator.com/item?id=50536387) · [solid-ui #233](https://github.com/stefan-karger/solid-ui/issues/233) · [solid-ui #227](https://github.com/stefan-karger/solid-ui/issues/227) · [shadcn-solid #180](https://github.com/hngngn/shadcn-solid/issues/180)
- Surveys: [State of JS 2025](https://2025.stateofjs.com/en-US/libraries/front-end-frameworks/) · [Stack Overflow 2026](https://survey.stackoverflow.co/2026/technology/data/web-framework)

**Agent tooling in other libraries**

- shadcn/ui: [MCP](https://ui.shadcn.com/docs/mcp) · [skills](https://ui.shadcn.com/docs/skills) · [registry](https://ui.shadcn.com/docs/registry) · [universal items](https://ui.shadcn.com/docs/changelog/2025-07-universal-registry) · [registry and MCP](https://ui.shadcn.com/docs/registry/mcp) · [registry index](https://ui.shadcn.com/docs/registry/registry-index)
- [Mantine LLM guide](https://mantine.dev/guides/llms) · [Mantine skills](https://github.com/mantinedev/skills) · [MUI MCP](https://github.com/mui/mui-x/blob/HEAD/packages/mcp/README.md) · [MUI skills](https://github.com/mui/material-ui/tree/HEAD/skills) · [Chakra UI LLM docs](https://chakra-ui.com/docs/get-started/ai/llms) · [Ark UI MCP](https://ark-ui.com/docs/ai/mcp-server) · [Nuxt UI MCP](https://ui.nuxt.com/docs/getting-started/ai/mcp) · [HeroUI MCP](https://heroui.com/docs/react/getting-started/mcp-server) · [HeroUI agents-md](https://heroui.com/docs/react/getting-started/agents-md) · [daisyUI skill](https://daisyui.com/docs/skill/) · [daisyUI Blueprint](https://daisyui.com/blueprint/)

**Evidence on agent context**

- [Vercel: AGENTS.md outperforms skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) · [Next.js 16.2](https://nextjs.org/blog/next-16-2-ai) · [Next.js 16.3](https://nextjs.org/blog/next-16-3-ai-improvements) · [Next.js agent guide](https://nextjs.org/docs/app/guides/ai-agents) · [Next.js evals](https://nextjs.org/evals)
- [Agent Skills standard](https://agentskills.io) · [supporting clients](https://agentskills.io/clients) · [skills CLI](https://github.com/vercel-labs/skills)
- [Gloaguen et al.](https://arxiv.org/abs/2602.11988) · [SkillsBench](https://arxiv.org/abs/2602.12670) · [SWE-Skills-Bench](https://arxiv.org/abs/2603.15401) · [Ahrefs `llms.txt` study](https://ahrefs.com/blog/llmstxt-study/) · [Upstash Context7 benchmark](https://upstash.com/blog/context7-vs-static-llm-knowledge-benchmarking-coding-assistants)
