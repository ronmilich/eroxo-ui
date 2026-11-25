# UL-15 Accessibility, motion and localisation utilities

These are internal primitives. They use native HTML focus and direction, CSS preference queries, and ARIA live-region semantics. The shared `eroxo-ui/styles.css` entry includes the utility styles.

## Visually hidden content and announcements

`VisuallyHidden` renders a `span` with native attributes, children, and a composed class. Use it for accessible labels and announcements that have a separate visible representation. The clipping styles preserve the text for accessible name computation and assistive technology.

Mount `AnnouncerProvider` once at an application root and call `useAnnounce()` inside the provider. It returns `announce(message, priority?)`. The default priority is `polite`. Use `assertive` for messages that justify interrupting speech. A nested provider shares the existing service, including when its descendants use Solid portals.

Both atomic channels render empty on the server and remain mounted during hydration. Each channel clears its previous text and inserts the newest pending message on a delayed task. Requests in the same 100 ms window coalesce per channel. A later request with the same text still produces a fresh DOM mutation. Blank messages are ignored. Disposing the owner removes the region, clears pending tasks, and makes retained callbacks inert. Place the provider where its regions stay exposed to assistive technology during the workflow. Use native semantics for state changes the browser already announces. [W3C ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19) · [W3C ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)

## Focus and forced colors

`focusElement(target, options?)` requests native focus and returns whether the target became active in its document or shadow root. Pass `{ preventScroll: true }` when automatic scrolling would disrupt the workflow. Use `erx-focus-ring` on interactive elements to apply Iris outline tokens when `:focus-visible` matches. The browser retains native modality heuristics.

Use `erx-forced-border` on controls with an essential border. The control supplies its width and style, and the utility uses the system `ButtonText` color in forced-colors mode. The focus ring uses `Highlight` in that mode. Both styles preserve the browser's system palette.

## Motion

`MotionScope` provides a DOM scope and shares a reactive `useReducedMotion()` accessor among its children. Its optional `reduce` flag can further reduce motion. A nested scope inherits reduction, and `false` leaves inherited and system preferences in effect. The CSS tokens follow the system preference before hydration. JavaScript observes the initial system preference and subsequent changes once mounted. Consumers using the hook outside a scope get an owner-managed system subscription. Disposal removes subscriptions.

Use motion tokens for transitions and the accessor for JavaScript-driven motion. A portal can read the logical scope's accessor and apply `data-erx-motion="reduce"` to its remote DOM root when the accessor is true.

## Locale and direction

`LocaleProvider` accepts `locale`, `dir`, and a partial `messages` dictionary. `useLocale()` exposes reactive getters for the nearest provided locale, direction, and each message. English supplies `close`, `clear`, `loading`, and `selectedCount(count)` whenever no scope overrides them. A missing `lang` or `dir` attribute inherits native document behavior. Set direction explicitly when the layout should change. Keep access reactive so updates preserve mounted state. Portaled content can forward the effective `lang` and `dir` to its remote root.

## Verification

The automated browser fixture exercises the existing regions before hydration, keyboard focus transfer, polite and assertive DOM mutations, portal announcements, disposal, motion preference changes, and a Hebrew label and direction override that preserves an edited input. Forced-colors checks run where the engine exposes that media mode. Unit tests also check timer and media-listener cleanup.

Manual speech verification is pending for the [screen-reader protocol](screen-reader-protocol.md). The fixture's **Close** button sends a polite “Saved” message, **Clear** sends an assertive “Error,” and the portal button sends a polite “From portal” message. Repeat the polite message and check speech, interruption, and stable focus with the supported pairings.

To open the fixture for manual testing, run the following commands and visit `/accessibility-utilities/` on the preview server.

```sh
pnpm build
node --input-type=module -e "import { buildAccessibilityUtilitiesFixture } from './test/browser/accessibility-utilities.mjs'; await buildAccessibilityUtilitiesFixture(process.cwd())"
pnpm exec vite preview --host 127.0.0.1
```
