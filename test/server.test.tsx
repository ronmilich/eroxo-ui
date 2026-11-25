import { describe, expect, it, vi } from 'vitest'
import { isServer, renderToString } from '@solidjs/web'
import { Hello, createHello, createTheme, ThemeScope, themeScript, useTheme } from '../src'
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

function ThemeReader() {
  const theme = useTheme()
  return (
    <p>
      {theme.theme()} {theme.colorScheme()} {theme.resolvedColorScheme()}{' '}
      {theme.density() ?? 'inherited'}
    </p>
  )
}

it('renders nested theme scopes and theme helpers on the server', () => {
  const acme = createTheme('acme', { dark: { '--erx-color-primary': '#8fb8ff' } })
  const render = () =>
    renderToString(() => (
      <>
        <ThemeReader />
        <ThemeScope root>
          <ThemeReader />
          <ThemeScope theme={acme} colorScheme="dark" density="compact" class="panel">
            <ThemeReader />
            <ThemeScope colorScheme="system">
              <ThemeReader />
            </ThemeScope>
          </ThemeScope>
        </ThemeScope>
      </>
    ))
  const html = render()
  expect(render()).toBe(html)
  expect(html).toBe(
    '<p>iris system light inherited</p>' +
      '<div class="erx-theme-scope"><p>iris system light inherited</p>' +
      '<div class="erx-theme-scope panel" data-erx-theme="acme dark" data-erx-density="compact">' +
      '<p>acme dark dark compact</p>' +
      '<div class="erx-theme-scope" data-erx-theme="acme system" data-erx-density="compact">' +
      '<p>acme system light compact</p></div></div></div>',
  )
  expect(acme.css).toContain("[data-erx-theme~='acme']")
  expect(themeScript({ storageKey: 'scheme', theme: acme })).toContain('"acme "+s')
})
