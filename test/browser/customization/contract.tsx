import type { JSX } from '@solidjs/web'
import { createTheme, ThemeScope } from 'eroxo-ui'

export type ContractScenario =
  'default' | 'custom' | 'outer' | 'nested' | 'slot' | 'variant' | 'fallback' | 'hook'

// It changes only the primary color, so every other token must fall back to Iris.
export const contractTheme = createTheme('contract', {
  light: { '--erx-color-primary': '#1c61bf' },
  dark: { '--erx-color-primary': '#8fb8ff' },
})

/**
 * Renders a component once in each customization scenario. A component
 * fixture passes `render`, puts `contractTheme.css` and `contractStyles()` in
 * its head, and runs `checkCustomizationContract` from `contract.mjs`.
 * - `slot`: pass `classes={{ [contract.classes]: 'contract-part' }}`.
 * - `variant`: pass `variant={contract.variant.value}`.
 */
export function ContractScenarios(props: { render: (scenario: ContractScenario) => JSX.Element }) {
  const instance = (scenario: ContractScenario) => (
    <div data-contract-instance={scenario}>{props.render(scenario)}</div>
  )
  return (
    <ThemeScope colorScheme="light" class="contract">
      <section data-contract="default">{instance('default')}</section>
      <section data-contract="custom">
        <ThemeScope theme={contractTheme}>{instance('custom')}</ThemeScope>
      </section>
      <section data-contract="nested">
        {instance('outer')}
        <ThemeScope colorScheme="dark">{instance('nested')}</ThemeScope>
      </section>
      <section data-contract="slot">{instance('slot')}</section>
      <section data-contract="variant">{instance('variant')}</section>
      <section data-contract="fallback">{instance('fallback')}</section>
      <section data-contract="hook">{instance('hook')}</section>
    </ThemeScope>
  )
}
