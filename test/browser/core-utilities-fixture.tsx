import { generateHydrationScript, hydrate, isServer, Portal, renderToString } from '@solidjs/web'
import { createSignal, flush, merge, omit, Show } from 'solid-js'
import { createControllableState } from '../../src/internal/create-controllable-state.js'
import {
  type ButtonOrAnchorProps,
  composeEventHandlers,
  composeRefs,
  createElementId,
} from '../../src/internal/dom.js'

function Action(props: ButtonOrAnchorProps<{ kind?: 'probe' }>) {
  if (props.as === 'a') return <a {...omit(props, 'as', 'kind')} />
  const native = merge({ type: 'button' as const }, omit(props, 'as', 'kind'))
  return <button {...native} />
}

function Probe(props: { label: string }) {
  const id = createElementId()
  const [veto, setVeto] = createSignal(false)
  const [controlled, setControlled] = createSignal<boolean | undefined>(undefined)
  const [checked, setChecked] = createControllableState({
    component: 'Probe',
    prop: 'checked',
    fallback: false,
    get value() {
      return controlled()
    },
  })
  const [requested, setRequested] = createSignal(0)
  const [details, setDetails] = createSignal('')
  let internalRef: HTMLButtonElement | undefined
  let outerRef: HTMLButtonElement | undefined
  const ref = composeRefs<HTMLButtonElement>(
    element => {
      internalRef = element
    },
    element => {
      outerRef = element
    },
  )
  const activate = composeEventHandlers<MouseEvent & { currentTarget: HTMLButtonElement }>(
    () => [
      (blocked: boolean, event) => {
        if (blocked) event.preventDefault()
        const matched = event.currentTarget === internalRef && internalRef === outerRef
        setDetails(`${id()} ${matched ? 'refs matched' : 'refs differed'}`)
      },
      veto(),
    ],
    () => {
      setRequested(count => count + 1)
      setChecked(!checked())
    },
  )
  return (
    <section aria-label={props.label} data-erx-theme="light">
      <Action ref={ref} onClick={activate} kind="probe" aria-describedby={id()}>
        Activate {props.label}
      </Action>
      <output id={id()}>
        {checked() ? 'On' : 'Off'} {requested()}
      </output>
      <output aria-label={`${props.label} details`}>{details()}</output>
      <Action onClick={() => setVeto(true)}>Veto {props.label}</Action>
      <Action onClick={() => setControlled(false)}>Control {props.label}</Action>
    </section>
  )
}

function Fixture() {
  const [showPortal, setShowPortal] = createSignal(false)
  return (
    <div data-erx-theme="dark">
      <Probe label="Inline" />
      <Action as="a" href="#target" kind="probe">
        Follow link
      </Action>
      <span id="target">Link target</span>
      <button onClick={() => setShowPortal(true)}>Show portal</button>
      <Show when={showPortal()}>
        <Portal>
          <Probe label="Portal" />
        </Portal>
      </Show>
    </div>
  )
}

export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''

if (!import.meta.env.SSR && !isServer) {
  const root = document.querySelector('main')!
  const original = root.querySelector('button')
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (!original || original !== root.querySelector('button')) {
    throw new Error('Hydration replaced the server button')
  }
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
