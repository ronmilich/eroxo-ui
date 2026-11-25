import { generateHydrationScript, hydrate, renderToString } from '@solidjs/web'
import { flush } from 'solid-js'
import { Probe } from './customization/prob.jsx'
import { ContractScenarios, contractTheme } from './customization/contract.jsx'

function Fixture() {
  return (
    <>
      <h1>Customization contract</h1>
      <ContractScenarios
        render={scenario => (
          <Probe
            label={`Probe ${scenario}`}
            variant={scenario === 'variant' ? 'outline' : undefined}
            classes={scenario === 'slot' ? { label: 'contract-part' } : undefined}
          />
        )}
      />
      <section data-contract="restyle" aria-label="Restyled probes">
        <Probe id="restyled" label="Restyled" class="restyled" size="lg" />
        <Probe id="disabled" label="Disabled" tone="danger" disabled />
      </section>
    </>
  )
}

export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''
export const head = import.meta.env.SSR ? `<style>${contractTheme.css}</style>` : ''

if (!import.meta.env.SSR) {
  const root = document.querySelector('main')!
  const probe = root.querySelector('.erx-probe')
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (!probe || probe !== root.querySelector('.erx-probe')) {
    throw new Error('Hydration replaced the server-rendered probe')
  }
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
