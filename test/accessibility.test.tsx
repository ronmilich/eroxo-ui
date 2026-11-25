import { render } from '@solidjs/web'
import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it, vi } from 'vitest'
import { AnnouncerProvider, useAnnounce } from '../src/internal/announcer.jsx'
import { focusElement } from '../src/internal/focus.js'
import { LocaleProvider, useLocale } from '../src/internal/locale.jsx'
import { MotionScope, useReducedMotion } from '../src/internal/motion.jsx'
import { VisuallyHidden } from '../src/internal/visually-hidden.jsx'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
})

it('forwards native props and reactive class to visually hidden text', () => {
  const [className, setClass] = createSignal<string>()
  const root = document.createElement('main')
  const dispose = render(
    () => (
      <VisuallyHidden class={className()} id="label" lang="he">
        טקסט
      </VisuallyHidden>
    ),
    root,
  )
  const label = root.querySelector('#label')!
  expect(label.className).toBe('erx-visually-hidden')
  expect(label.textContent).toBe('טקסט')
  expect(label.getAttribute('lang')).toBe('he')
  setClass('custom')
  flush()
  expect(label.className).toBe('erx-visually-hidden custom')
  dispose()
})

it('shares one service, updates both channels, and cancels pending DOM writes on disposal', () => {
  vi.useFakeTimers()
  let announce!: ReturnType<typeof useAnnounce>
  function Emitter() {
    announce = useAnnounce()
    return null
  }
  const root = document.createElement('main')
  const dispose = render(
    () => (
      <AnnouncerProvider>
        <AnnouncerProvider>
          <Emitter />
        </AnnouncerProvider>
      </AnnouncerProvider>
    ),
    root,
  )
  flush()
  const polite = root.querySelector('[aria-live=polite]')!
  const assertive = root.querySelector('[aria-live=assertive]')!
  expect(root.querySelectorAll('[aria-live]')).toHaveLength(2)
  expect(polite.textContent).toBe('')
  expect(assertive.getAttribute('aria-atomic')).toBe('true')
  announce(' ')
  expect(vi.getTimerCount()).toBe(0)
  announce('First')
  announce('Latest')
  announce('Urgent', 'assertive')
  expect(vi.getTimerCount()).toBe(2)
  vi.runAllTimers()
  expect(polite.textContent).toBe('Latest')
  expect(assertive.textContent).toBe('Urgent')
  announce('Latest')
  expect(polite.textContent).toBe('')
  vi.runAllTimers()
  expect(polite.textContent).toBe('Latest')
  announce('Discard on dispose', 'assertive')
  dispose()
  expect(root.querySelector('[aria-live]')).toBeNull()
  announce('After dispose')
  expect(vi.getTimerCount()).toBe(0)
  expect(assertive.textContent).toBe('')
})

it('reports a missing announcement provider', () => {
  createRoot(dispose => {
    expect(useAnnounce).toThrow('AnnouncerProvider')
    dispose()
  })
})

it('checks actual focus in the target root, including shadow DOM and disabled controls', () => {
  const host = document.createElement('div')
  const button = document.createElement('button')
  expect(focusElement(undefined)).toBe(false)
  expect(focusElement(button)).toBe(false)
  document.body.append(host)
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.append(button)
  const focus = vi.spyOn(button, 'focus')
  expect(focusElement(button, { preventScroll: true })).toBe(true)
  expect(focus).toHaveBeenCalledExactlyOnceWith({ preventScroll: true })
  expect(shadow.activeElement).toBe(button)
  button.blur()
  button.disabled = true
  expect(focusElement(button)).toBe(false)
})

it('combines scoped and system motion preferences and removes its media listener', () => {
  let matches = true
  const query = Object.defineProperty(new EventTarget(), 'matches', { get: () => matches })
  const add = vi.spyOn(query, 'addEventListener')
  const remove = vi.spyOn(query, 'removeEventListener')
  const matchMedia = vi.fn(() => query)
  vi.stubGlobal('matchMedia', matchMedia)
  const [reduce, setReduce] = createSignal(false)
  function Reader() {
    const reduced = useReducedMotion()
    return <p>{reduced() ? 'reduced' : 'full'}</p>
  }
  const root = document.createElement('main')
  const dispose = render(
    () => (
      <MotionScope reduce={reduce()}>
        <MotionScope reduce={false}>
          <Reader />
        </MotionScope>
      </MotionScope>
    ),
    root,
  )
  flush()
  expect(matchMedia).toHaveBeenCalledExactlyOnceWith('(prefers-reduced-motion: reduce)')
  expect(root.textContent).toBe('reduced')
  matches = false
  query.dispatchEvent(new Event('change'))
  flush()
  expect(root.textContent).toBe('full')
  setReduce(true)
  flush()
  expect(root.textContent).toBe('reduced')
  expect(root.firstElementChild?.getAttribute('data-erx-motion')).toBe('reduce')
  dispose()
  expect(remove).toHaveBeenCalledExactlyOnceWith('change', add.mock.calls[0]?.[1])

  const disposeStandalone = render(() => <Reader />, root)
  flush()
  expect(root.textContent).toBe('full')
  expect(matchMedia).toHaveBeenCalledTimes(2)
  disposeStandalone()
})

it('inherits locale, direction, and each fallback message without remounting', () => {
  const [localised, setLocalised] = createSignal(false)
  function Reader() {
    const locale = useLocale()
    const messages = locale.messages
    return (
      <p>
        {locale.locale ?? 'default'} {locale.dir ?? 'inherited'} {messages.close}/{messages.clear}/
        {messages.loading}/{messages.selectedCount(3)}
      </p>
    )
  }
  const root = document.createElement('main')
  const dispose = render(
    () => (
      <LocaleProvider
        locale={localised() ? 'he' : undefined}
        dir={localised() ? 'rtl' : undefined}
        messages={
          localised()
            ? { close: 'סגירה', loading: 'טוען', selectedCount: count => `${count} נבחרו` }
            : undefined
        }
      >
        <LocaleProvider messages={{ clear: 'Override' }}>
          <Reader />
        </LocaleProvider>
      </LocaleProvider>
    ),
    root,
  )
  const reader = root.querySelector('p')!
  expect(reader.textContent).toBe('default inherited Close/Override/Loading/3 selected')
  setLocalised(true)
  flush()
  expect(root.querySelector('p')).toBe(reader)
  expect(reader.textContent).toBe('he rtl סגירה/Override/טוען/3 נבחרו')
  expect(reader.closest('[dir]')?.getAttribute('dir')).toBe('rtl')
  dispose()
})
