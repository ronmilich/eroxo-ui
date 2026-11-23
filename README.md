# eroxo-ui

SolidJS 2 component library. The package uses the working name `eroxo-ui` while the public name is being selected.

## Local development

Use Node.js 22.22.2+ on the 22.x line, 24.15.0+ on the 24.x line, or 26+, with pnpm 12.21.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The playground runs at `http://localhost:3000`. Run `pnpm test` for the browser and SSR suites, `pnpm lint` for linting and type checks, and `pnpm build` to generate the package in `dist/`.

## Using the library

Consumers need both `solid-js` and `@solidjs/web` at compatible 2.x versions (2.0.3 or later). Once the library is installed, import its named exports.

```tsx
import { Hello } from 'eroxo-ui'

export function App() {
  return <Hello to="Solid" />
}
```
