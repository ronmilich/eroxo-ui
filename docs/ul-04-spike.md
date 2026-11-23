# UL-04 · Technical spike record




**Owner decision, 23 November 2026.** The owner approved four starting assumptions for the spike:




- Solid 2 only, with an SSR test app that does not use SolidStart.
- A provisional browser and screen-reader matrix.
- A 10-working-day cap with two CSS candidates.
- An unmerged branch for the throwaway code.




They are provisional. UL-05 ratifies or replaces them in its ADRs. The spike report is at the end of this record.




## 1 · Solid 2 only, with SSR tested outside SolidStart




Solid 2.0.0 was published on 17 November 2026. The charter, README and package peers already target `solid-js` and `@solidjs/web` 2.x. On 23 November the npm registry showed `@solidjs/router` 2.0.1 and `@solidjs/meta` 2.0.0 declaring Solid 2 peers. The latest SolidStart, 2.2.3, still declared `solid-js ^1.9.15`, so a SolidStart app cannot install a Solid 2-only library. [@solidjs/start](https://www.npmjs.com/package/@solidjs/start) · [@solidjs/router](https://www.npmjs.com/package/@solidjs/router) · [solid-js](https://www.npmjs.com/package/solid-js)




| Option | Assessment |
|---|---|
| **Solid 2 only (chosen)** | Matches the approved charter and the repository. SolidStart users wait until SolidStart moves to Solid 2. |
| Solid 2 and 1.9 | Opens the library to SolidStart now. The behavior layer, the largest 1.0 cost, would be built and verified against two runtimes. |
| Solid 1.9 first | Contradicts the charter and forces a breaking migration during 0.x. |




The spike's SSR consumer is a minimal Vite SSR app that renders and hydrates with `@solidjs/web` directly. SolidStart stays untested until a release supports Solid 2. TaoTale is unaffected: it is a Vite single-page app on `@solidjs/router`, which supports Solid 2. Recheck SolidStart before UL-05. Add a SolidStart fixture in UL-08, or later once one is possible.




## 2 · Provisional browser and screen-reader matrix




The native-first check runs against the intended browser matrix, but UL-05 sets that matrix after the spike. On 23 November 2026 `<dialog>`, the `inert` attribute and the Popover API were Baseline Widely available, meaning they had worked in every major engine for at least 30 months. The Popover API reached that status in October 2026. CSS anchor positioning reached every engine with Firefox 147 in January 2026, and caniuse still rates Firefox's support as partial. [Firefox 147 release notes](https://developer.mozilla.org/en-US/Firefox/Releases/147) · [caniuse: CSS anchor positioning](https://caniuse.com/css-anchor-positioning) · [web.dev, January 2026](https://web.dev/blog/web-platform-01-2026)




| Question | Decision | Alternatives considered |
|---|---|---|
| Which platform features may primitives rely on? | Baseline Widely available on the day of testing. | Baseline Newly available, or the last two versions of each browser: anchor positioning becomes usable natively, but Firefox gaps remain and older iPads drop out. Explicit version floors: precise, but need upkeep. |
| Where does the spike test? | Current desktop Chrome/Edge, Firefox and Safari, plus iPadOS Safari. | Desktop only. Rejected because TaoTale supports tablets (TT-019), and scroll lock and touch-versus-hover behave differently on iPadOS. |
| Which screen reader? | VoiceOver with Safari. NVDA joins in UL-09. | NVDA now, which needs a Windows machine. |
| When does a native feature win? | When it meets the APG and 08 §4 requirement in every browser on the list, with at most a small, documented patch. Otherwise use JavaScript. | Decide case by case in the report. |




Under this policy CSS anchor positioning is only an optional enhancement, and the Tooltip uses JavaScript positioning. Anchors on text ranges (08 §2.3) need JavaScript geometry in any case. This choice changes the size of UL-26, not the need for it.




## 3 · Ten-working-day cap and two CSS candidates




As written, UL-04 covers:




- three components and two or three CSS approaches;
- two build outputs and four native features;
- two consumer apps and four browsers;
- an effort estimate for seven milestones.




The roadmap sizes milestones at one to two weeks of one developer.




The spike is capped at 10 working days. CSS approaches are compared on Button and Dialog styling only, and the Dialog and Tooltip behavior is built once. The two candidates are:




- plain CSS with cascade layers, processed by Lightning CSS;
- CSS Modules.




Zero-runtime vanilla-extract joins only if the owner asks for TypeScript-typed tokens.




The alternatives were comparing all three candidates, or splitting the milestone into UL-04a (CSS, build and packaging) and UL-04b (behavior and native-first). When the cap is reached, the spike stops and the report lists what it did not cover.




## 4 · Throwaway code on an unmerged branch




The spike code was planned to live on a `spike/ul-04` branch that is never merged and is tagged when the spike ends. On 23 November 2026 the owner decided not to archive it on GitHub; see the exit criteria at the end of this record. Only this record, with the spike report, lands on `main`. Spike packages set `"private": true`, because `eroxo-ui` is not yet reserved on npm (UL-02) and the root `package.json` can be published. The alternatives were a separate scratch repository and a temporary `spike/` folder on `main`. No spike code moves into product milestones, and the spike's component APIs set no precedent for UL-06.




## Constraints that still apply




- No Kobalte, other headless UI library or positioning library, even in the spike (TT-032). Otherwise the effort estimate is meaningless.
- Public hooks use the `--erx-` and `data-erx-` prefixes (UL-02), so stable public selectors are tested with the real names.
- The clean-room rules and DCO sign-off apply ([UL-03](ul-03-commercial.md), [CONTRIBUTING](../CONTRIBUTING.md)).




## Left to the spike report




- CSS delivery: CSS imported by each component, a required global stylesheet, or both.
- Compiled DOM and SSR builds versus JSX under the `solid` export condition. The starter already ships `index.js`, `server.js` under `node` and `index.jsx` under `solid`. The spike checks which file each consumer actually loads.
- Native versus JavaScript for each primitive, using the rule in section 2.
- The effort estimate for UL-14 to UL-17 and UL-24 to UL-26.




## Spike report · 23 November 2026




The spike built the three planned components, packed them as a private tarball and installed them in a single-page app and an SSR app:
- a Button in both CSS candidates;
- a native Dialog, styled in both candidates;
- a Tooltip with our own positioning code.




A Playwright suite ran the same 27 checks in Chromium 151, Firefox 153 and WebKit 26.5. iPadOS 26.1 Safari was checked with real touch in the iOS Simulator. The code, tests and day-by-day notes are not on GitHub; a copy stays in the owner's local clone, including `spike/README.md` and `spike/conformance/RESULTS.md`.




### Recommendations




| Question | Recommendation | Evidence |
|---|---|---|
| CSS approach | Candidate A: plain CSS with cascade layers, processed by Lightning CSS. | Both candidates themed and accepted overrides identically in all three engines. A's class names are stable and can be documented. B's depend on who compiles them (`erx-6sfvKa-root` from the library, `_root_1r6ea_5` from the consumer), and under the `solid` condition B needs CSS Modules support in the consumer's bundler. Sizes differ by less than 0.1 kB. |
| CSS delivery | Both: each component imports its own stylesheet, and `tokens.css` and a full stylesheet are also exported. UL-05 decides whether components import the tokens themselves. | Per-component imports worked in Vite for preserved JSX and, after a 20-line build plugin, for compiled output. Vite kept the CSS even with `sideEffects: false`; keep the `**/*.css` setting for other bundlers. |
| Build outputs | Ship preserved JSX under the `solid` condition, plus compiled DOM and SSR builds compiled as hydratable. | Vite consumers always used the JSX. Non-hydratable compiled builds rendered but never hydrated, with no warning. Hydratable ones worked for both SPA and SSR, for 0.5 kB more gzip. |
| Browser policy | Keep Baseline Widely available. | Everything the components rely on is Widely available. All three engines also expose `closedby` and CSS anchor positioning, but neither is Widely available yet. |
| SSR | Support SSR through `@solidjs/web`. Recheck SolidStart before UL-05. | Server rendering and hydration worked in all three engines with no console errors. |




### Native or JavaScript, per primitive




| Primitive | Recommendation | Our code in the spike |
|---|---|---|
| Modal dialog, inert background, stacking | Native `<dialog>` with `showModal()`. | None. |
| Initial focus | Native: `autofocus`, or the first focusable element. | None. |
| Focus containment | Native. Past the last element focus may reach the browser's own interface, but it never reached the page behind the dialog. | None. |
| Escape | Native `cancel` event, reported through `onOpenChange`. | A few lines. |
| Focus restoration | Native, plus a fallback for WebKit and Safari, which don't focus a clicked button and so have nothing to restore. | 3 lines. They need the trigger element: a Trigger part or a `returnFocus` option, to settle in UL-06. |
| Outside click | JavaScript until `closedby` is Widely available. | About 10 lines. |
| Scroll lock | CSS: `html:has(.erx-dialog:modal) { overflow: hidden }`. | None. It held against mouse-wheel input in all three engines and against real touch on iPadOS. |
| Presence (exit animation) | JavaScript. | About 25 lines. They must ignore infinite animations and cap the wait at the animation's length. |
| Portals and a z-index stack | Not needed for top-layer overlays. Theme inheritance works in place, including `::backdrop`. | None. |
| Non-modal overlays | Popover API: `popover="manual"` for tooltips. | None. |
| Positioning | Our own engine. CSS anchor positioning only as a later fast path. | About 100 lines. WebKit 26.5 placed a flipped anchor-positioned tooltip about 2,860 px off screen, and anchor positioning offers no arrow, edge margin or text-range anchor. |
| Tooltip interaction | JavaScript on top of `:focus-visible` and `pointerType`. | About 110 lines. |




### Measurements




| Bundle, gzip | JavaScript | CSS |
|---|---|---|
| Solid runtime alone | 9.92 kB | none |
| Button (A) | 12.19 kB | 1.10 kB |
| Button (B) | 12.27 kB | 1.10 kB |
| Button and Dialog | 13.31 kB | 1.54 kB |
| Button and Tooltip | 14.30 kB | 1.50 kB |
| All three | 15.23 kB | 1.88 kB |




A Button-only import leaves the overlay code out, as the charter requires. The dialog's exit animation took 130–137 ms in the three engines, and 3 ms with reduced motion requested. The tooltip appeared 406–410 ms after hover, against a configured 400 ms.




### Effort estimate for the behavior layer




The unit is weeks of focused work for one developer, the roadmap's own unit, including each milestone's Definition of Done.




| Milestone | Roadmap size | Estimate | Basis | Confidence |
|---|---|---|---|---|
| UL-14 Core component utilities | 1–2 | 1.5 | Not exercised. `createUniqueId` is SSR-safe and Solid 2 has `omit` and `merge`. Polymorphic typing is the main risk. | Low |
| UL-15 Accessibility, motion and localisation | 1–2 | 1 | Reduced motion is plain CSS. The live region and locale provider were not exercised. | Low |
| UL-16 Interaction primitives | 1–2 | 1.5 | `:focus-visible` and `pointerType` replaced custom modality tracking in the tooltip. The IME guard and its manual CJK checks remain. | Medium |
| UL-17 Collection and navigation | 1–2 | 2.5–3 | Not exercised, and the platform offers no shortcut. | Low |
| UL-24 Layering and dismissal | 1–2 | 1 | The top layer replaced portals, the z-index stack and theme plumbing for dialog and tooltip. Escape ordering across non-modal layers remains. | Medium-high |
| UL-25 Focus, modality, scroll lock, presence | 1–2 | 1 | Native containment and inert background, CSS scroll lock including iPadOS, about 25 lines of presence logic and the focus fallback. | Medium-high |
| UL-26 Positioning engine | 1–2 | 1.5 | The core took about 100 lines. Still missing: the size option, clipping ancestors, ResizeObserver updates, transforms and zoom, the on-screen keyboard and visual tests. | Medium |
| Total | 7–14 | 10–10.5 | | |




The total stays near the roadmap's midpoint, but the work moves from overlays to collections. Split UL-17 before starting it: roving tabindex, typeahead and the collection model first; virtual focus and selection second. UL-24 and UL-25 could merge into one milestone of about two weeks, since the top layer covers much of both.




### Still open




- **VoiceOver:** moved to UL-09's manual screen-reader check. The checklist below is its starting point.
- **Desktop Firefox:** the suite used Playwright's Firefox build. A manual pass needs Firefox installed.
- **Classic scrollbars:** layout shift on lock couldn't be measured on this Mac, which uses overlay scrollbars. Check on Windows and consider `scrollbar-gutter: stable`.
- **Safari keyboard access:** Safari's Tab skips buttons unless the user turns on keyboard navigation for all controls. Documentation and tests should use Option+Tab.
- **Server bundles:** compiled SSR output carries the tooltip's client-only code (3.0 kB gzip). For UL-08.
- **The `node` export condition:** it may point Node-based test runners at the server build. For UL-08.
- **Trigger API:** the tooltip's description and the dialog's focus fallback both need the trigger element. For UL-06.




### VoiceOver checklist




UL-09's manual screen-reader check starts from these steps. Turn VoiceOver on (Cmd+F5), open a page with these components in Safari, and record the results in UL-09.




1. Move to "Open A" and press VO+Space. VoiceOver announces the dialog's title, its role and its description.
2. Inside the dialog, VO+Right past the last control doesn't reach the page behind.
3. Escape closes the dialog, and VoiceOver returns to "Open A".
4. Open "Open nested", then "Open inner". Each dialog is announced, and Escape closes the inner one first.
5. Press Option+Tab to the tooltip's "Save" button. VoiceOver reads "Saves the draft" as its description.
6. The pending "Saving" button is announced as busy.




### Exit criteria




**Owner approval, 23 November 2026.** The owner approved this report and its recommendations, so the report and estimate criteria are met. **Owner decision, 23 November 2026.** The spike code is not archived on GitHub: the report replaces it, and a copy stays in the owner's local clone as a reference. The VoiceOver checklist moves to UL-09's manual screen-reader check. UL-04 is done.



