import { describe, expect, it, vi } from 'vitest'
import { isServer, renderToString } from '@solidjs/web'
import { Hello, createHello } from '../src'
import { createControllableState } from '../src/internal/create-controllable-state.js'
import { createElementId } from '../src/internal/dom.js'

describe('environment', () => {
  it('runs on server', () => {
    expect(typeof window).toBe('undefined')
    expect(isServer).toBe(true)
  })
})

describe('createHello', () => {
  it('Returns a Hello World signal', () => {
    const [hello] = createHello()
    expect(hello()).toBe('Hello World!')
  })

  it('Changes the hello target', () => {
    const [hello, setHello] = createHello()
    setHello('Solid')
    expect(hello()).toBe('Hello Solid!')
  })
})

describe('Hello', () => {
  it('renders a hello component', () => {
    const string = renderToString(() => <Hello />)
    expect(string).toBe('<div class="erx-hello">Hello World!</div>')
  })
})

it('renders stable ID relationships and initial state without a change request', () => {
  const onChange = vi.fn()
  function Field(props: { value?: string; defaultValue?: string }) {
    const id = createElementId()
    const [value] = createControllableState({
      component: 'Field',
      prop: 'value',
      fallback: '',
      get value() {
        return props.value
      },
      get defaultValue() {
        return props.defaultValue
      },
      onChange,
    })
    return (
      <div>
        <label for={id()}>{value()}</label>
        <input id={id()} />
      </div>
    )
  }
  const render = () =>
    renderToString(() => (
      <>
        <Field defaultValue="Initial" />
        <Field value="Controlled" />
      </>
    ))
  const html = render()
  expect(render()).toBe(html)
  expect(html).toMatch(/<label for="(erx-[^"]+)">Initial<\/label><input id="\1"/)
  expect(html).toMatch(/<label for="(erx-[^"]+)">Controlled<\/label><input id="\1"/)
  expect(new Set(Array.from(html.matchAll(/<input id="([^"]+)"/g), match => match[1])).size).toBe(2)
  expect(onChange).not.toHaveBeenCalled()
})
