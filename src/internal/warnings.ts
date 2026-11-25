export function warnInDevelopment(
  component: string,
  problem: string,
  fix: string,
  docs = 'https://github.com/ronmilich/eroxo-ui/blob/main/docs/design-system/eroxo-iris-component-anatomy-api-spec.md',
): void {
  if (import.meta.env.DEV) {
    // oxlint-disable-next-line no-console -- This is the library's development diagnostic sink.
    console.warn(`[eroxo-ui] ${component}: ${problem}. ${fix}. ${docs}`)
  }
}
