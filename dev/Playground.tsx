import { render } from '@solidjs/web'
import { createSignal, Show } from 'solid-js'
import HelloExample from './examples/hello'

function Playground() {
  const [theme, setTheme] = createSignal('light')
  const [color, setColor] = createSignal('#5849c8')

  return (
    <div class="playground">
      <div class="playground-controls">
        <div class="theme-setting">
          <label for="playground-theme">Theme</label>
          <select
            id="playground-theme"
            value={theme()}
            onChange={event => setTheme(event.currentTarget.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <Show when={theme() === 'custom'}>
          <label>
            Greeting color
            <input
              type="color"
              value={color()}
              onInput={event => setColor(event.currentTarget.value)}
            />
          </label>
        </Show>
      </div>
      <div class="example" data-erx-theme={theme()} style={{ '--demo-color': color() }}>
        <HelloExample />
      </div>
    </div>
  )
}

export function mountPlayground(root: HTMLElement) {
  render(() => <Playground />, root)
}
