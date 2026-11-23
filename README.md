# eroxo-ui

Eroxo UI is a SolidJS 2 component library. The free `eroxo-ui` core is MIT licensed. The [product charter](docs/ul-01-charter.md) defines the planned 1.0 catalog. Everything ships free for the initial release. The owner will review the business model afterward.

## Local development

Use the Node version in [.node-version](.node-version) to reproduce CI and pnpm 12.21.0 from the root manifest. Supported contributor runtimes are listed in `engines.node`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The playground runs at `http://localhost:3000`. Run `pnpm lint` for linting, strict type checks and the runtime dependency policy. Run `pnpm test` for the policy, component and SSR tests. Use `pnpm build` for the library and `pnpm build:docs` for the playground.

## Workspace

The root is the public `eroxo-ui` package. The private Vite docs app in `dev/` resolves public imports to live library source during development. `fixtures/spa/` and `fixtures/ssr/` reserve independent consumer projects for the packed-package checks in UL-08. The private `scripts/` workspace holds repository checks. All projects share one pnpm lockfile.

The [library roadmap](docs/ui-library-roadmap.md) is maintained here and supplies the milestone status used by TaoTale.

## Using the library

Consumers need both `solid-js` and `@solidjs/web` at compatible 2.x versions (2.0.3 or later). Once the library is installed, import its named exports.

```tsx
import { Hello } from 'eroxo-ui'

export function App() {
  return <Hello to="Solid" />
}
```
