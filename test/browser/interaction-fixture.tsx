import { generateHydrationScript, hydrate, Portal, renderToString } from '@solidjs/web'
import { createSignal, flush, Show } from 'solid-js'
import {
  createCompositionGuard,
  normalizedKey,
  widgetKey,
  horizontalStep,
} from '../../src/internal/keyboard.js'
import { createPress, createHover, createInputModality } from '../../src/internal/pointer.js'
import { getTabbable, focusNext, isInsideLayerTree } from '../../src/internal/focus-query.js'

function Fixture() {
  const modality = createInputModality()
  const [presses, setPresses] = createSignal(0)
  const [holds, setHolds] = createSignal(0)
  const [step, setStep] = createSignal(0)
  const [filtered, setFiltered] = createSignal('')
  const [committed, setCommitted] = createSignal('')
  const [open, setOpen] = createSignal(false)
  const [inside, setInside] = createSignal(false)
  const [tabs, setTabs] = createSignal('')
  const press = createPress({
    onPress: () => setPresses(n => n + 1),
    onLongPress: () => setHolds(n => n + 1),
  })
  const hover = createHover()
  const composition = createCompositionGuard()
  let scope!: HTMLElement
  let portal!: HTMLButtonElement
  return (
    <section ref={scope} data-erx-theme="dark">
      <h1>Interaction primitives</h1>
      <div
        tabindex="0"
        role="button"
        class="erx-focus-ring"
        data-erx-focus-visible={modality() === 'keyboard' ? '' : undefined}
        {...press}
        onPointerEnter={hover.onPointerEnter}
        onPointerLeave={event => {
          hover.onPointerLeave()
          press.onPointerLeave(event)
        }}
        onPointerCancel={event => {
          hover.onPointerCancel()
          press.onPointerCancel(event)
        }}
      >
        Activate
      </div>
      <output id="presses">{presses()}</output>
      <output id="holds">{holds()}</output>
      <output id="modality">{modality()}</output>
      <output id="hover">{String(hover.hovered())}</output>
      <div
        dir="rtl"
        onKeyDown={event => {
          const key = widgetKey(event, composition)
          const direction = key && horizontalStep(key, event.currentTarget)
          if (direction) {
            event.preventDefault()
            setStep(n => n + direction)
          }
        }}
      >
        <button id="navigate">Navigate</button>
        <output id="steps">{step()}</output>
        <label>
          Compose
          <input
            onCompositionStart={composition.onCompositionStart}
            onCompositionEnd={composition.onCompositionEnd}
            onBlur={composition.reset}
            onInput={event => {
              if (!composition.isComposing(event)) setFiltered(event.currentTarget.value)
            }}
            onKeyDown={event => {
              if (
                !event.repeat &&
                !event.defaultPrevented &&
                !event.altKey &&
                !event.metaKey &&
                !event.shiftKey &&
                !event.ctrlKey &&
                !composition.blocksKey(event) &&
                normalizedKey(event) === 'Enter'
              )
                setCommitted(event.currentTarget.value)
            }}
          />
        </label>
        <p>
          Filtered text <output id="filtered">{filtered()}</output>
        </p>
        <p>
          Committed selection <output id="committed">{committed()}</output>
        </p>
      </div>
      <div inert>
        <button>Inert</button>
      </div>
      <button disabled>Disabled</button>
      <div hidden>
        <button>Hidden</button>
      </div>
      <button
        onClick={event => {
          focusNext(scope, event.currentTarget)
        }}
      >
        Move next
      </button>
      <button
        onClick={() => {
          setTabs(
            getTabbable(scope)
              .map(el => el.textContent.trim() || el.localName)
              .join('|'),
          )
          setOpen(true)
        }}
      >
        Open portal
      </button>
      <output id="tabs">{tabs()}</output>
      <Show when={open()}>
        <Portal>
          <button
            ref={portal}
            onClick={event => setInside(isInsideLayerTree(event.target, [scope, portal]))}
          >
            Portal action
          </button>
        </Portal>
      </Show>
      <output id="inside">{String(inside())}</output>
    </section>
  )
}
export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''
if (!import.meta.env.SSR) {
  const root = document.querySelector('main')!
  const original = root.firstElementChild
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (root.firstElementChild !== original) throw new Error('Interaction fixture failed to hydrate')
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
