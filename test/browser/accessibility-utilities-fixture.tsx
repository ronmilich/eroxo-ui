import { generateHydrationScript, hydrate, Portal, renderToString } from '@solidjs/web'
import { createSignal, flush, Show } from 'solid-js'
import { AnnouncerProvider, useAnnounce } from '../../src/internal/announcer.jsx'
import { focusElement } from '../../src/internal/focus.js'
import { LocaleProvider, useLocale } from '../../src/internal/locale.jsx'
import { MotionScope, useReducedMotion } from '../../src/internal/motion.jsx'
import { VisuallyHidden } from '../../src/internal/visually-hidden.jsx'

function Controls() {
  const announce = useAnnounce()
  const reduced = useReducedMotion()
  const { messages } = useLocale()
  const [showPortal, setShowPortal] = createSignal(false)
  let target: HTMLInputElement | undefined
  return (
    <section data-erx-theme="dark">
      <button onClick={() => focusElement(target, { preventScroll: true })}>Move focus</button>
      <label>
        Draft <input ref={target} class="erx-focus-ring erx-forced-border" />
      </label>
      <button onClick={() => announce('Saved')}>
        <span aria-hidden="true">×</span>
        <VisuallyHidden>{messages.close}</VisuallyHidden>
      </button>
      <button onClick={() => announce('Error', 'assertive')}>{messages.clear}</button>
      <p id="motion">{reduced() ? 'Reduced' : 'Full'}</p>
      <button onClick={() => setShowPortal(true)}>Show portal</button>
      <Show when={showPortal()}>
        <Portal>
          <PortalControl />
        </Portal>
      </Show>
    </section>
  )
}

function PortalControl() {
  const announce = useAnnounce()
  return <button onClick={() => announce('From portal')}>Portal announcement</button>
}

function Fixture() {
  const [hebrew, setHebrew] = createSignal(false)
  const [reduce, setReduce] = createSignal(false)
  return (
    <>
      <h1>Accessibility utilities</h1>
      <button onClick={() => setHebrew(previous => !previous)}>Switch locale</button>
      <button onClick={() => setReduce(previous => !previous)}>Toggle scoped motion</button>
      <LocaleProvider
        locale={hebrew() ? 'he' : undefined}
        dir={hebrew() ? 'rtl' : undefined}
        messages={hebrew() ? { close: 'סגירה' } : undefined}
      >
        <MotionScope reduce={reduce()}>
          <MotionScope reduce={false}>
            <AnnouncerProvider>
              <AnnouncerProvider>
                <Controls />
              </AnnouncerProvider>
            </AnnouncerProvider>
          </MotionScope>
        </MotionScope>
      </LocaleProvider>
    </>
  )
}

export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''

if (!import.meta.env.SSR) {
  const root = document.querySelector('main')!
  const region = root.querySelector('[aria-live]')
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (!region || region !== root.querySelector('[aria-live]')) {
    throw new Error('Hydration replaced the server live region')
  }
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
