import { render } from '@solidjs/web'
import { createTheme, ThemeScope } from 'eroxo-ui'

const brand = createTheme('tailwind-brand', {
  shared: { '--erx-radius-control': '4px' },
  light: { '--erx-color-surface': '#f2f6fc' },
})
const style = document.createElement('style')
style.textContent = brand.css
document.head.append(style)

function App() {
  return (
    <ThemeScope root colorScheme="light">
      <h1 class="font-erx-sans text-erx-text">Tailwind bridge</h1>
      <ThemeScope id="component">Eroxo beats the base layer</ThemeScope>
      <ThemeScope id="utility" class="bg-erx-surface">
        Utilities beat Eroxo
      </ThemeScope>
      <ThemeScope id="application" class="bg-erx-surface application">
        Unlayered CSS beats utilities
      </ThemeScope>
      <div
        id="light"
        class="bg-erx-surface text-erx-text rounded-erx-control shadow-erx-popover p-erx-card-padding font-erx-mono"
      >
        Light
      </div>
      <ThemeScope colorScheme="dark">
        <div id="dark" class="bg-erx-surface text-erx-text">
          Dark
        </div>
      </ThemeScope>
      <ThemeScope theme={brand}>
        <div id="brand" class="bg-erx-surface rounded-erx-control">
          Custom theme
        </div>
      </ThemeScope>
      <ThemeScope density="compact">
        <div id="compact" class="p-erx-card-padding">
          Compact
        </div>
      </ThemeScope>
      <p id="stock" class="flex">
        Stock utility
      </p>
    </ThemeScope>
  )
}

render(() => <App />, document.querySelector('main')!)
