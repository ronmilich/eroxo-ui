# Framework, browser and assistive technology support

## Context

The npm metadata recheck on 23 November 2026 found stable `@solidjs/start` 2.2.3 declaring `solid-js ^1.9.15`. The Solid 2 spike used `@solidjs/web` directly. [Registry metadata](https://registry.npmjs.org/@solidjs%2Fstart/2.2.3)

## Decision

Support Solid 2 and direct Vite 8 SPA/SSR consumers first. Claim SolidStart support only after a compatible stable peer range and passing packaged SSR/hydration fixture. Set TypeScript 7.0 as the initial declaration-test floor and pin 7.0.2 for development. Test the floor in UL-08. Evaluate other bundlers in UL-43. Require Baseline Widely available features or a tested fallback. Exercise current Chrome/Edge, Firefox, Safari and iPadOS Safari, with automated Chromium/Firefox/WebKit coverage.

## Alternatives and consequences

Dual Solid 1/2 support would double the behavior matrix. A last-two-versions policy would admit features unavailable on supported tablets. UL-09 establishes VoiceOver/Safari and NVDA/Firefox keyboard and announcement checks, plus TalkBack/Chrome for touch patterns. Include Android TalkBack in the UL-42 audit. Record actual browser, OS and reader versions with results.

## Update · 24 November 2026

`solid-js` 2.0.0 was published on 17 November 2026, and its announcement retired SolidStart. Start mode in `@solidjs/vite-plugin` (`start: true`, with `ssr: true` for streaming SSR) replaces it. The framework-level SSR target is therefore Start mode, verified by the UL-09b consumer fixture, alongside the direct Vite SPA and SSR consumers. Consider TanStack Solid Start, whose 2.0 release candidate supports Solid 2, once it is stable. The rest of this decision stands. [Solid 2.0 announcement](https://www.solidjs.com/blog/solid-2-0-the-long-hold/) · [Vite plugin](https://www.npmjs.com/package/@solidjs/vite-plugin)

[UL-05 status and evidence](README.md)
