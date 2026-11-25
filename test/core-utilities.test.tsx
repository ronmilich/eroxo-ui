import { isServer, render } from '@solidjs/web'
import { createRoot, createSignal, flush, merge, omit } from 'solid-js'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createControllableState } from '../src/internal/create-controllable-state.js'
import {
  type ButtonOrAnchorProps,
  composeEventHandlers,
  composeRefs,
  createElementId,
} from '../src/internal/dom.js'
import { warnInDevelopment } from '../src/internal/warnings.js'

afterEach(() => vi.restoreAllMocks())

describe('createControllableState', () => {
  it('snapshots the default and reports distinct uncontrolled requests', () => {
    const [initial, setInitial] = createSignal('initial')
    const onChange = vi.fn()
    const { value, request, dispose } = createRoot(dispose => {
      const [value, request] = createControllableState({
        component: 'Field',
        prop: 'value',
        fallback: 'fallback',
        get defaultValue() {
          return initial()
        },
        onChange,
      })
      return { value, request, dispose }
    })
    expect(value()).toBe('initial')
    setInitial('ignored')
    flush()
    expect(value()).toBe('initial')
    expect(onChange).not.toHaveBeenCalled()
    request('next')
    request('next')
    flush()
    expect(value()).toBe('next')
    expect(onChange.mock.calls).toEqual([['next']])
    dispose()
  })

  it('leaves acceptance to the parent, including a nullable controlled value', () => {
    const [external, setExternal] = createSignal<string | null>(null)
    const first = vi.fn()
    const [callback, setCallback] = createSignal({ run: first })
    const { value, request, dispose } = createRoot(dispose => {
      const [value, request] = createControllableState({
        component: 'Field',
        prop: 'value',
        fallback: 'fallback',
        get value() {
          return external()
        },
        get onChange() {
          return callback().run
        },
      })
      return { value, request, dispose }
    })
    request(null)
    expect(first).not.toHaveBeenCalled()
    request('rejected')
    expect(first.mock.calls).toEqual([['rejected']])
    expect(value()).toBeNull()

    const accept = vi.fn(setExternal)
    setCallback({ run: accept })
    flush()
    request('accepted')
    flush()
    expect(value()).toBe('accepted')
    setExternal('external update')
    flush()
    expect(value()).toBe('external update')
    expect(accept.mock.calls).toEqual([['accepted']])
    dispose()
  })

  it('stores function-valued defaults and updates without invoking them', () => {
    const initial = vi.fn()
    const next = vi.fn()
    const { value, request, dispose } = createRoot(dispose => {
      const [value, request] = createControllableState({
        component: 'Field',
        prop: 'value',
        fallback: initial,
      })
      return { value, request, dispose }
    })
    expect(value()).toBe(initial)
    request(next)
    flush()
    expect(value()).toBe(next)
    expect(initial).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    dispose()
  })

  it('warns for competing defaults and each observed ownership change until disposal', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const [external, setExternal] = createSignal<boolean | undefined>(false)
    const dispose = createRoot(dispose => {
      createControllableState({
        component: 'Toggle',
        prop: 'checked',
        fallback: false,
        defaultValue: true,
        get value() {
          return external()
        },
      })
      return dispose
    })
    flush()
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      expect.stringMatching(
        /^\[eroxo-ui\] Toggle: Both checked and defaultChecked are set\. Pass only one of them\. https:\/\/.+\.md$/,
      ),
    )
    setExternal(true)
    flush()
    expect(warning).toHaveBeenCalledTimes(1)
    setExternal(undefined)
    flush()
    expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('controlled to uncontrolled'))
    setExternal(false)
    flush()
    expect(warning).toHaveBeenCalledTimes(3)
    expect(warning).toHaveBeenLastCalledWith(expect.stringContaining('uncontrolled to controlled'))
    dispose()
    setExternal(undefined)
    flush()
    expect(warning).toHaveBeenCalledTimes(3)
  })
})

describe('DOM utilities', () => {
  it('preserves IDs and reactive overrides without colliding', () => {
    expect(isServer).toBe(false)
    const [provided, setProvided] = createSignal<string | undefined>('explicit')
    const { first, second, dispose } = createRoot(dispose => ({
      first: createElementId(provided),
      second: createElementId(),
      dispose,
    }))
    expect(first()).toBe('explicit')
    setProvided(undefined)
    flush()
    const generated = first()
    expect(generated).toMatch(/^erx-/)
    expect(generated).not.toBe(second())
    setProvided('updated')
    flush()
    expect(first()).toBe('updated')
    setProvided(undefined)
    flush()
    expect(first()).toBe(generated)
    dispose()
  })

  it('forwards reactive native props and composes Solid callback and assignment refs', () => {
    const ref = vi.fn<(element: HTMLButtonElement) => void>()
    let assigned: HTMLButtonElement | undefined
    const [title, setTitle] = createSignal('custom')
    const root = document.createElement('main')
    function Button(props: { title?: string; local: boolean; ref?: HTMLButtonElement }) {
      const forwarded = merge(
        { type: 'button' as const, title: 'default' },
        omit(props, 'local', 'ref'),
      )
      return <button {...forwarded} ref={composeRefs(ref, [undefined, props.ref])} />
    }
    const dispose = render(() => <Button ref={assigned} title={title()} local />, root)
    const button = root.querySelector('button')!
    expect(assigned).toBe(button)
    expect(ref).toHaveBeenCalledExactlyOnceWith(button)
    expect(button.type).toBe('button')
    expect(button.hasAttribute('local')).toBe(false)
    expect(button.title).toBe('custom')
    setTitle('updated')
    flush()
    expect(button.title).toBe('updated')
    dispose()
  })

  it('reads the latest event handler, supports bound data and honors native cancellation', () => {
    const button = document.createElement('button')
    const action = vi.fn<(event: Event) => void>()
    const plain = vi.fn(() => false)
    const bound = vi.fn((data: string | undefined, event: Event) => {
      expect(event.currentTarget).toBe(button)
      if (data === undefined) event.preventDefault()
    })
    const [getHandler, setHandler] = createSignal<{
      handler?: typeof plain | [typeof bound, string | undefined]
    }>({})
    const onClick = composeEventHandlers(() => getHandler().handler, action)
    button.addEventListener('click', onClick)
    button.click()
    expect(action).toHaveBeenCalledTimes(1)
    setHandler({ handler: plain })
    flush()
    button.click()
    expect(plain).toHaveBeenCalledTimes(1)
    expect(plain.mock.contexts[0]).toBe(button)
    expect(action).toHaveBeenCalledTimes(2)
    setHandler({ handler: [bound, undefined] })
    flush()
    button.click()
    expect(bound.mock.calls[0]?.[0]).toBeUndefined()
    expect(bound.mock.contexts[0]).toBe(button)
    expect(action).toHaveBeenCalledTimes(2)
    button.dispatchEvent(new Event('click'))
    expect(action).toHaveBeenCalledTimes(3)
  })

  it('uses the same development warning format for component-specific diagnostics', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    warnInDevelopment(
      'IconButton',
      'An accessible name is required',
      'Pass aria-label',
      'https://example.com/icon-button.md',
    )
    expect(warning).toHaveBeenCalledExactlyOnceWith(
      '[eroxo-ui] IconButton: An accessible name is required. Pass aria-label. https://example.com/icon-button.md',
    )
  })

  it('restricts polymorphic props to the selected native element', () => {
    type Props = ButtonOrAnchorProps<{ tone: 'primary' }>
    type Anchor = Extract<Props, { as: 'a' }>
    type Button = Exclude<Props, Anchor>
    expectTypeOf<Anchor['href']>().toEqualTypeOf<string>()
    expectTypeOf<Anchor['type']>().toEqualTypeOf<undefined>()
    expectTypeOf<Button['href']>().toEqualTypeOf<undefined>()
    expectTypeOf<Button['type']>().toEqualTypeOf<'button' | 'submit' | 'reset' | undefined>()
    expectTypeOf<HTMLAnchorElement>().toExtend<Anchor['ref']>()
    expectTypeOf<HTMLAnchorElement>().not.toExtend<Button['ref']>()
    expectTypeOf<HTMLButtonElement>().toExtend<Button['ref']>()
    expectTypeOf<HTMLButtonElement>().not.toExtend<Anchor['ref']>()
    type CurrentTarget<T> = T extends (event: infer E) => void
      ? E extends { currentTarget: infer Target }
        ? Target
        : never
      : never
    expectTypeOf<CurrentTarget<Anchor['onClick']>>().toExtend<HTMLAnchorElement>()
    expectTypeOf<HTMLAnchorElement>().toExtend<CurrentTarget<Anchor['onClick']>>()
    expectTypeOf<CurrentTarget<Button['onClick']>>().toExtend<HTMLButtonElement>()
    expectTypeOf<HTMLButtonElement>().toExtend<CurrentTarget<Button['onClick']>>()
  })
})
