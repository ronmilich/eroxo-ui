import { generateHydrationScript, hydrate, Portal, renderToString } from '@solidjs/web'
import { createSignal, flush, For, Show } from 'solid-js'
import { createTheme, ThemeScope, themeScript } from 'eroxo-ui'
import { ThemeScope as SubpathThemeScope, useTheme } from 'eroxo-ui/theme'

if (ThemeScope !== SubpathThemeScope) throw new Error('Root and subpath resolved different scopes')

const storageKey = 'erx-fixture-color-scheme'
const brand = createTheme('fixture-brand', {
  shared: { '--erx-radius-control': '4px' },
  light: { '--erx-color-primary': '#1c61bf', '--erx-color-canvas': '#f2f6fc' },
  dark: { '--erx-color-primary': '#8fb8ff' },
})

function Controls() {
  const theme = useTheme()
  return (
    <div role="group" aria-label="Color scheme">
      <For each={['light', 'dark', 'system'] as const}>
        {scheme => (
          <button
            aria-pressed={theme.colorScheme() === scheme ? 'true' : 'false'}
            onClick={() => theme.setColorScheme(scheme)}
          >
            {scheme}
          </button>
        )}
      </For>
      <output id="status">{`${theme.theme()} ${theme.colorScheme()} ${theme.resolvedColorScheme()}`}</output>
    </div>
  )
}

function Swatch(props: { id: string }) {
  return (
    <div id={props.id} class="swatch">
      {props.id}
    </div>
  )
}

function Fixture() {
  const [custom, setCustom] = createSignal(false)
  const [portal, setPortal] = createSignal(false)
  let dialog!: HTMLDialogElement
  return (
    <ThemeScope
      root
      theme={custom() ? brand : undefined}
      onColorSchemeChange={next => localStorage.setItem(storageKey, next)}
    >
      <h1>Theme scopes</h1>
      <Controls />
      <button
        aria-pressed={custom() ? 'true' : 'false'}
        onClick={() => setCustom(previous => !previous)}
      >
        Custom theme
      </button>
      <label>
        Draft <input />
      </label>
      <Swatch id="outer" />
      <section aria-label="Nested scope">
        <ThemeScope colorScheme="dark" density="compact">
          <Swatch id="nested" />
          <button onClick={() => dialog.showModal()}>Open dialog</button>
          <dialog ref={dialog} aria-label="Themed dialog">
            <Swatch id="dialog-swatch" />
            <button onClick={() => dialog.close()}>Close dialog</button>
          </dialog>
          <button onClick={() => setPortal(true)}>Open portal</button>
          <Show when={portal()}>
            <Portal>
              <ThemeScope id="portal-scope">
                <Swatch id="portaled" />
              </ThemeScope>
              <Swatch id="portal-plain" />
            </Portal>
          </Show>
        </ThemeScope>
      </section>
    </ThemeScope>
  )
}

export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''
// The first-paint script and the custom theme CSS go in <head>.
export const head = import.meta.env.SSR
  ? `<script>${themeScript({ storageKey })}</script><style>${brand.css}</style>`
  : ''

if (!import.meta.env.SSR) {
  const root = document.querySelector('main')!
  const scope = root.querySelector('.erx-theme-scope')
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (!scope || scope !== root.querySelector('.erx-theme-scope')) {
    throw new Error('Hydration replaced the server theme scope')
  }
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
