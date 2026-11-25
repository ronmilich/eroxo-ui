export function focusElement(
  target: HTMLElement | SVGElement | null | undefined,
  options?: FocusOptions,
): boolean {
  if (!target?.isConnected) return false
  target.focus(options)
  const root = target.getRootNode()
  return 'activeElement' in root && root.activeElement === target
}
