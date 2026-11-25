Eroxo UI provides styled components for Solid 2.

## Installation

Install the library and its Solid peers from the same compatible release line. During the local preview, replace the package name with the path to the packed tarball.

```sh
pnpm add eroxo-ui solid-js@^2.0.3 @solidjs/web@^2.0.3
```

Import components from `eroxo-ui` or a component subpath such as `eroxo-ui/button`. Import `eroxo-ui/styles.css` once for the full stylesheet, including server-rendered pages. Use `ThemeScope` to set light, dark or custom colors for a subtree. The Customization guide includes examples.

## Components

Use Button for a labeled action, IconButton for an icon-only action, Icon for SVG artwork and Spinner for pending work. [Hello](./components/hello/) is a minimal import example.

## Coding agent setup

Run `npx eroxo-ui agents-md` from an application's root to add version-matched documentation pointers to AGENTS.md. Re-running refreshes the marked section. A new CLAUDE.md imports AGENTS.md when needed.
