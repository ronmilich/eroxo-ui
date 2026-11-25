import { onCleanup } from 'solid-js'

const aliases: Readonly<Record<string, string | undefined>> = {
  Esc: 'Escape',
  Spacebar: ' ',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
  Up: 'ArrowUp',
  Down: 'ArrowDown',
}

export function normalizedKey(event: KeyboardEvent): string {
  return Object.hasOwn(aliases, event.key) ? aliases[event.key]! : event.key
}

export function createCompositionGuard() {
  let composing = false
  let finishing = false
  let timer: ReturnType<typeof setTimeout> | undefined
  function reset() {
    clearTimeout(timer)
    composing = finishing = false
  }
  onCleanup(reset)
  return {
    onCompositionStart() {
      reset()
      composing = true
    },
    onCompositionEnd() {
      reset()
      // Some IMEs end composition before delivering the confirming keydown.
      finishing = true
      timer = setTimeout(() => {
        finishing = false
      }, 0)
    },
    reset,
    isComposing(event?: InputEvent | KeyboardEvent) {
      return composing || event?.isComposing === true
    },
    blocksKey(event: KeyboardEvent) {
      return (
        composing ||
        finishing ||
        event.isComposing ||
        event.keyCode === 229 ||
        event.key === 'Process'
      )
    },
  }
}

export function widgetKey(
  event: KeyboardEvent,
  composition?: ReturnType<typeof createCompositionGuard>,
): string | undefined {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.key === 'Process' ||
    composition?.blocksKey(event)
  )
    return
  const target = event.composedPath()[0] ?? event.target
  if (target && 'matches' in target) {
    const element = target as HTMLElement
    if (element.isContentEditable || element.closest('input, textarea, select, [role="textbox"]'))
      return
  }
  return normalizedKey(event)
}

export function horizontalStep(key: string, element: Element): -1 | 1 | undefined {
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return
  const rtl = element.ownerDocument.defaultView?.getComputedStyle(element).direction === 'rtl'
  return (key === 'ArrowRight') !== rtl ? 1 : -1
}
