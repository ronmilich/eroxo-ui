import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import {
  createCompositionGuard,
  horizontalStep,
  normalizedKey,
  widgetKey,
} from '../src/internal/keyboard.js'
import {
  createHover,
  createInputModality,
  createPress,
  capturePointer,
} from '../src/internal/pointer.js'
import {
  focusFirst,
  focusLast,
  focusNext,
  getFocusable,
  getTabbable,
  isInsideLayerTree,
} from '../src/internal/focus-query.js'

function owned<T>(create: () => T) {
  return createRoot(dispose => ({ value: create(), dispose }))
}
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

it('normalizes widget keys while preserving modified, edited and composing input', () => {
  vi.useFakeTimers()
  const { value: guard, dispose } = owned(createCompositionGuard)
  const key = (value: string, init: KeyboardEventInit = {}) =>
    new KeyboardEvent('keydown', { key: value, ...init })
  expect(normalizedKey(key('Esc'))).toBe('Escape')
  expect(widgetKey(key('Enter'))).toBe('Enter')
  for (const init of [
    { metaKey: true },
    { altKey: true },
    { shiftKey: true },
    { ctrlKey: true },
    { isComposing: true },
    { keyCode: 229 },
  ])
    expect(widgetKey(key('Enter', init))).toBeUndefined()
  expect(widgetKey(key('Process'))).toBeUndefined()
  guard.onCompositionStart()
  expect(guard.isComposing()).toBe(true)
  expect(widgetKey(key('Spacebar'), guard)).toBeUndefined()
  guard.onCompositionEnd()
  expect(guard.isComposing()).toBe(false)
  expect(guard.isComposing(new InputEvent('input', { isComposing: true }))).toBe(true)
  expect(guard.blocksKey(key('Enter'))).toBe(true)
  vi.runAllTimers()
  expect(widgetKey(key('Left'), guard)).toBe('ArrowLeft')
  expect(guard.blocksKey(key('Process'))).toBe(true)
  expect(guard.blocksKey(key('Enter', { keyCode: 229 }))).toBe(true)
  const text = document.createElement('input')
  text.addEventListener('keydown', event => expect(widgetKey(event)).toBeUndefined())
  text.dispatchEvent(key('ArrowDown'))
  document.body.style.direction = 'rtl'
  expect(horizontalStep('ArrowRight', document.body)).toBe(-1)
  expect(horizontalStep('ArrowLeft', document.body)).toBe(1)
  expect(horizontalStep('ArrowDown', document.body)).toBeUndefined()
  document.body.style.direction = 'ltr'
  expect(horizontalStep('ArrowRight', document.body)).toBe(1)
  guard.onCompositionEnd()
  dispose()
  expect(vi.getTimerCount()).toBe(0)
})

it('tracks document modality and pointer hover only for the mounted owner', () => {
  const { value: modality, dispose } = owned(createInputModality)
  flush()
  document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
  flush()
  expect(modality()).toBe('touch')
  document.dispatchEvent(new KeyboardEvent('keydown', { altKey: true }))
  flush()
  expect(modality()).toBe('touch')
  document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'pen' }))
  flush()
  expect(modality()).toBe('pointer')
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
  flush()
  expect(modality()).toBe('keyboard')
  dispose()
  document.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch' }))
  flush()
  expect(modality()).toBe('keyboard')
  const { value: hover, dispose: stop } = owned(createHover)
  const matchMedia = vi.fn(() => ({ matches: true }))
  vi.stubGlobal('matchMedia', matchMedia)
  try {
    const enter = (pointerType: string) => {
      const event = new PointerEvent('pointerenter', { pointerType })
      Object.defineProperty(event, 'currentTarget', { value: document.body })
      hover.onPointerEnter(event)
      flush()
    }
    enter('mouse')
    expect(hover.hovered()).toBe(true)
    hover.onPointerLeave()
    flush()
    expect(hover.hovered()).toBe(false)
    enter('touch')
    expect(hover.hovered()).toBe(false)
    enter('pen')
    hover.onPointerCancel()
    flush()
    expect(hover.hovered()).toBe(false)
    matchMedia.mockReturnValue({ matches: false })
    enter('mouse')
    expect(hover.hovered()).toBe(false)
  } finally {
    vi.unstubAllGlobals()
    stop()
  }
})

it('cancels a captured press on movement, cancellation, capture loss, disable, blur or disposal', () => {
  vi.useFakeTimers()
  const host = document.createElement('div')
  document.body.append(host)
  const ids = new Set<number>()
  host.setPointerCapture = id => {
    ids.add(id)
  }
  host.hasPointerCapture = id => ids.has(id)
  host.releasePointerCapture = id => {
    ids.delete(id)
  }
  host.getBoundingClientRect = () => new DOMRect(0, 0, 100, 50)
  const onPress = vi.fn(),
    onLongPress = vi.fn()
  const [disabled, setDisabled] = createSignal(false)
  const { value: press, dispose } = owned(() =>
    createPress({
      get disabled() {
        return disabled()
      },
      onPress,
      onLongPress,
    }),
  )
  flush()
  function pointer(id = 2, x = 5, button = 0) {
    const event = new PointerEvent('pointer', {
      isPrimary: true,
      pointerId: id,
      clientX: x,
      clientY: 5,
      button,
    })
    Object.defineProperty(event, 'currentTarget', { value: host })
    return event
  }
  press.onPointerDown(pointer(3, 5, 2))
  expect(ids.size).toBe(0)
  press.onPointerDown(pointer())
  press.onPointerDown(pointer(3))
  press.onPointerCancel(pointer(3))
  press.onPointerUp(pointer(3))
  expect(ids.size).toBe(1)
  press.onPointerMove(pointer(3))
  press.onPointerMove(pointer(2, 7))
  press.onPointerUp(pointer())
  expect(onPress).toHaveBeenCalledTimes(1)
  expect(ids.size).toBe(0)
  for (const stop of [
    () => press.onPointerCancel(pointer()),
    () => press.onLostPointerCapture(pointer()),
    () => press.onPointerLeave(pointer()),
    () => press.onBlur(),
    () => press.onPointerMove(pointer(2, 30)),
    () => press.onPointerUp(pointer(2, 120)),
    () => {
      setDisabled(true)
      flush()
      setDisabled(false)
      flush()
    },
  ]) {
    press.onPointerDown(pointer())
    stop()
    press.onPointerUp(pointer())
    expect(ids.size).toBe(0)
  }
  expect(onPress).toHaveBeenCalledTimes(1)
  press.onPointerDown(pointer())
  vi.runAllTimers()
  press.onPointerUp(pointer())
  expect(onLongPress).toHaveBeenCalledTimes(1)
  expect(onPress).toHaveBeenCalledTimes(1)
  press.onPointerDown(pointer())
  dispose()
  expect(ids.size).toBe(0)
  expect(vi.getTimerCount()).toBe(0)
  host.setPointerCapture = () => {
    throw new DOMException('gone', 'NotFoundError')
  }
  expect(() => capturePointer(host, 3)()).not.toThrow()
  host.setPointerCapture = () => {
    throw new Error('unexpected')
  }
  expect(() => capturePointer(host, 3)).toThrow('unexpected')
})

it('owns only custom button activation keys and virtual clicks', () => {
  const onPress = vi.fn()
  const { value: press, dispose } = owned(() => createPress({ onPress }))
  const key = (key: string, repeat = false) =>
    new KeyboardEvent('keydown', { key, repeat, cancelable: true })
  press.onKeyDown(key('Escape'))
  press.onKeyDown(key('Enter', true))
  press.onKeyDown(key('Enter'))
  expect(onPress).toHaveBeenCalledTimes(1)
  press.onKeyDown(key(' '))
  press.onKeyUp(key('x'))
  press.onKeyDown(key(' ', true))
  press.onKeyUp(key(' '))
  expect(onPress).toHaveBeenCalledTimes(2)
  press.onKeyDown(key(' '))
  press.onBlur()
  press.onKeyUp(key(' '))
  press.onClick(new MouseEvent('click', { detail: 1 }))
  press.onClick(new MouseEvent('click', { detail: 0 }))
  expect(onPress).toHaveBeenCalledTimes(3)
  dispose()
})

it('queries focus in tab order across open shadow roots, slots and explicit portal roots', () => {
  const root = document.createElement('main')
  document.body.append(root)
  root.innerHTML =
    '<button id="first">A</button><button id="neg" tabindex="-1">B</button><div inert><button></button></div><button disabled></button><button hidden></button><input type="hidden"><button style="visibility:hidden"></button><button tabindex="2" id="early"></button><input type="radio" name="g"><input id="radio" type="radio" name="g" checked><div id="host"><button slot="item" id="slotbtn"></button></div>'
  const shadow = root.querySelector('#host')!.attachShadow({ mode: 'open' })
  shadow.innerHTML = '<slot name="item"></slot><button id="inner">C</button>'
  for (const el of [...root.querySelectorAll('*'), ...shadow.querySelectorAll('*')]) {
    Object.defineProperty(el, 'getClientRects', { value: () => [new DOMRect(0, 0, 1, 1)] })
    Object.defineProperty(el, 'checkVisibility', { value: () => true })
  }
  const ids = (elements: Element[]) => elements.map(el => el.id)
  expect(ids(getTabbable(root))).toEqual(['early', 'first', 'radio', 'slotbtn', 'inner'])
  expect(ids(getFocusable(root))).toContain('neg')
  expect(focusFirst(root)).toBe(true)
  expect(document.activeElement?.id).toBe('early')
  expect(focusLast(root)).toBe(true)
  expect(shadow.activeElement?.id).toBe('inner')
  expect(focusNext(root, shadow.activeElement!)).toBe(false)
  expect(focusNext(root, shadow.activeElement!, true)).toBe(true)
  expect(focusNext(root, root.querySelector('#neg')!)).toBe(true)
  expect(document.activeElement?.id).toBe('early')
  expect(focusNext(root, document.body)).toBe(true)
  expect(isInsideLayerTree(shadow.firstElementChild, [root])).toBe(true)
  expect(isInsideLayerTree(root.querySelector('#slotbtn'), [shadow])).toBe(true)
  const portal = document.createElement('aside')
  document.body.append(portal)
  expect(isInsideLayerTree(portal, [root])).toBe(false)
  expect(isInsideLayerTree(portal, [root, portal])).toBe(true)
  expect(isInsideLayerTree(null, [root])).toBe(false)
  const outside = document.createElement('input')
  outside.type = 'radio'
  outside.name = 'g'
  document.body.append(outside)
  outside.checked = true
  expect(getTabbable(root).some(el => el.matches('input[type=radio]'))).toBe(false)
})
