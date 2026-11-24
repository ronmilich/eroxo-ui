# eroxo-ui

Eroxo UI is a SolidJS 2 component library. The free `eroxo-ui` core is MIT licensed. The [product charter](docs/ul-01-charter.md) defines the planned 1.0 catalog. Everything ships free for the initial release. The owner will review the business model afterward.

## Local development

Use the Node version in [.node-version](.node-version) to reproduce CI and pnpm 12.21.0 from the root manifest. Supported contributor runtimes are listed in `engines.node`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The docs and playground run at `http://localhost:3000`. Run `pnpm lint` for linting, strict type checks and the runtime dependency policy. Run `pnpm test` for the policy, component and SSR tests. Use `pnpm build` for the library and `pnpm build:docs` for the static site. After installing Chromium with `pnpm exec playwright install --only-shell chromium`, run `pnpm test:docs` to verify the built site and reference files.

## Workspace

The root is the public `eroxo-ui` package. The private Vite docs app in `dev/` resolves public imports to live library source during development. The private `scripts/` workspace holds repository checks. The workspace uses one pnpm lockfile.

### Verify the distribution

```sh
pnpm exec playwright install --only-shell chromium firefox webkit
pnpm build
pnpm test:package
```

The check runs `npm pack`, installs the tarball in two temporary projects outside the workspace and type-checks their imports. The SPA fixture uses the preserved JSX. The SSR fixture renders in Node and hydrates with the compiled browser entry. Chromium, Firefox and WebKit check server-rendered styling with JavaScript disabled, DOM reuse during hydration, a click-driven update and a local CSS override. They also run axe, keyboard-table, touch-pointer and IME composition checks.

The default consumer install tests the minimum Solid peers. Set `SOLID_PEER_TIER=latest` in your shell to test the newest versions npm resolves within the public peer ranges. CI runs both installs and logs the resolved versions. Run `pnpm test:coverage` for the source-level V8 report in `artifacts/coverage/`. See the [screen-reader protocol](docs/screen-reader-protocol.md) for device checks and how to add keyboard rows.

The build workflow attaches `artifacts/size-report.md`. It lists the shipped entries and browser bundles in raw and gzip bytes. The Button and Dialog rows use a separately packed private benchmark under `fixtures/size/`. Their production implementations belong to later component milestones.

The [library roadmap](docs/ui-library-roadmap.md) is maintained here and supplies the milestone status used by TaoTale.

## Using the library

Consumers need both `solid-js` and `@solidjs/web` at compatible 2.x versions (2.0.3 or later). Once the library is installed, import its named exports.

`eroxo-ui/hello` and the root export share the same component. A client import brings in its styles and tokens. For server-rendered pages, include `eroxo-ui/styles.css` in the document's first-paint stylesheet. The individual stylesheets are `eroxo-ui/tokens.css` and `eroxo-ui/hello.css`.

```tsx
import { Hello } from 'eroxo-ui'

export function App() {
  return <Hello to="Solid" />
}
```
