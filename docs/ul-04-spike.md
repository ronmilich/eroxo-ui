# UL-04 · Technical spike record


**Owner decision, 23 November 2026.** The owner approved four starting assumptions for the spike:


- Solid 2 only, with an SSR test app that does not use SolidStart.
- A provisional browser and screen-reader matrix.
- A 10-working-day cap with two CSS candidates.
- An unmerged branch for the throwaway code.


They are provisional. UL-05 ratifies or replaces them in its ADRs. The spike report will be added to this record when the spike ends.


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


The spike code lives on a `spike/ul-04` branch that is never merged and is tagged when the spike ends. Only this record, with the spike report, lands on `main`. Spike packages set `"private": true`, because `eroxo-ui` is not yet reserved on npm (UL-02) and the root `package.json` can be published. The alternatives were a separate scratch repository and a temporary `spike/` folder on `main`. No spike code moves into product milestones, and the spike's component APIs set no precedent for UL-06.


## Constraints that still apply


- No Kobalte, other headless UI library or positioning library, even in the spike (TT-032). Otherwise the effort estimate is meaningless.
- Public hooks use the `--erx-` and `data-erx-` prefixes (UL-02), so stable public selectors are tested with the real names.
- The clean-room rules and DCO sign-off apply ([UL-03](ul-03-commercial.md), [CONTRIBUTING](../CONTRIBUTING.md)).


## Left to the spike report


- CSS delivery: CSS imported by each component, a required global stylesheet, or both.
- Compiled DOM and SSR builds versus JSX under the `solid` export condition. The starter already ships `index.js`, `server.js` under `node` and `index.jsx` under `solid`. The spike checks which file each consumer actually loads.
- Native versus JavaScript for each primitive, using the rule in section 2.
- The effort estimate for UL-14 to UL-17 and UL-24 to UL-26.


## Spike report


Pending. It will be added here when the spike ends, with measurements, a recommendation per question and the behavior-layer effort estimate.



