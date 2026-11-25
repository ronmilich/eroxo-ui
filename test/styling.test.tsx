import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  createPartClasses,
  createStateAttributes,
  createStyleAttributes,
  defineStyleAxes,
  type PartClasses,
  type Size,
  type StyleAxisProps,
} from '../src/internal/styling.js'
import { Probe } from './browser/customization/prob.jsx'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

const button = defineStyleAxes({
  component: 'Button',
  variants: ['solid', 'ghost'],
  defaultVariant: 'solid',
  tones: ['primary', 'danger'],
  defaultTone: 'primary',
  sized: true,
})
const card = defineStyleAxes({ component: 'Card' })

describe('style axes', () => {
  it('renders resolved variant and tone, and size only when it is set', () => {
    const [props, setProps] = createSignal<StyleAxisProps<typeof button>>({})
    const attributes = createStyleAttributes(button, {
      get variant() {
        return props().variant
      },
      get tone() {
        return props().tone
      },
      get size() {
        return props().size
      },
    })
    expect({ ...attributes }).toEqual({
      'data-erx-variant': 'solid',
      'data-erx-tone': 'primary',
      'data-erx-size': undefined,
    })
    setProps({ variant: 'ghost', tone: 'danger', size: 'lg' })
    flush()
    expect({ ...attributes }).toEqual({
      'data-erx-variant': 'ghost',
      'data-erx-tone': 'danger',
      'data-erx-size': 'lg',
    })
    expect({ ...createStyleAttributes(card, {}) }).toEqual({
      'data-erx-variant': undefined,
      'data-erx-tone': undefined,
      'data-erx-size': undefined,
    })
  })

  it('warns about unsupported values and falls back to the defaults', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const attributes = createStyleAttributes(button, {
      variant: 'outline' as 'solid',
      tone: 'info' as 'primary',
      size: 'xl' as Size,
    })
    expect({ ...attributes }).toEqual({
      'data-erx-variant': 'solid',
      'data-erx-tone': 'primary',
      'data-erx-size': undefined,
    })
    expect(warning.mock.calls.map(([message]) => message)).toEqual([
      expect.stringMatching(
        /^\[eroxo-ui\] Button: variant "outline" is not supported\. Use solid, ghost\. /,
      ),
      expect.stringContaining('Button: tone "info" is not supported. Use primary, danger.'),
      expect.stringContaining('Button: size "xl" is not supported. Use sm, md, lg.'),
    ])
  })

  it('types only the axes and values a component supports', () => {
    expectTypeOf<StyleAxisProps<typeof button>>().toEqualTypeOf<
      { variant?: 'solid' | 'ghost' } & { tone?: 'primary' | 'danger' } & { size?: Size }
    >()
    expectTypeOf<StyleAxisProps<typeof card>>().toEqualTypeOf<unknown>()
    // @ts-expect-error Button does not support the outline variant.
    const unsupported: StyleAxisProps<typeof button> = { variant: 'outline' }
    expect(unsupported).toBeDefined()
  })
})

describe('state attributes and part classes', () => {
  it('normalizes flags to empty attributes and keeps them reactive', () => {
    const [disabled, setDisabled] = createSignal(false)
    const attributes = createStateAttributes({
      state: 'open',
      get disabled() {
        return disabled()
      },
      invalid: true,
    })
    expect({ ...attributes }).toEqual({
      'data-erx-state': 'open',
      'data-erx-disabled': undefined,
      'data-erx-invalid': '',
      'data-erx-loading': undefined,
    })
    setDisabled(true)
    flush()
    expect(attributes['data-erx-disabled']).toBe('')
  })

  it('builds stable root and part classes with the consumer classes', () => {
    const [classes, setClasses] = createSignal<PartClasses<'title'>>()
    const part = createPartClasses('dialog', {
      class: ['app-dialog', { open: true }],
      get classes() {
        return classes()
      },
    })
    expect(part()).toEqual(['erx-dialog', ['app-dialog', { open: true }]])
    expect(part('title')).toEqual(['erx-dialog__title', undefined])
    setClasses({ title: 'app-title' })
    flush()
    expect(part('title')).toEqual(['erx-dialog__title', 'app-title'])
  })

  it('renders a multi-part component that updates attributes without remounting', () => {
    const [disabled, setDisabled] = createSignal(false)
    const [size, setSize] = createSignal<Size>()
    const root = document.createElement('main')
    const dispose = render(
      () => (
        <Probe
          label="Probe"
          class="app-probe"
          classes={{ label: 'app-label' }}
          tone="danger"
          size={size()}
          disabled={disabled()}
          title="Native attribute"
        />
      ),
      root,
    )
    const probe = root.querySelector<HTMLElement>('.erx-probe')!
    expect(probe.className).toBe('erx-probe app-probe')
    expect(probe.title).toBe('Native attribute')
    expect(probe.querySelector('.erx-probe__label')!.className).toBe('erx-probe__label app-label')
    expect(probe.querySelector('.erx-probe__icon')!.getAttribute('aria-hidden')).toBe('true')
    expect({ ...probe.dataset }).toEqual({ erxVariant: 'solid', erxTone: 'danger' })
    setDisabled(true)
    setSize('sm')
    flush()
    expect(root.querySelector('.erx-probe')).toBe(probe)
    expect({ ...probe.dataset }).toEqual({
      erxVariant: 'solid',
      erxTone: 'danger',
      erxSize: 'sm',
      erxDisabled: '',
    })
    dispose()
  })
})
