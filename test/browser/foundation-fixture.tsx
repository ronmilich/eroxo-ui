import { generateHydrationScript, hydrate, renderToString } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { Button, IconButton, Icon, Spinner } from 'eroxo-ui'
import { ContractScenarios, contractTheme } from './customization/contract.jsx'

function Fixture() {
  const [count, setCount] = createSignal(0)
  const increment = () => setCount(n => n + 1)
  return (
    <>
      <h1>Foundation components</h1>
      <Button id="save" size="lg" onClick={increment}>
        Save
      </Button>
      <IconButton id="add" aria-label="Add" onClick={increment}>
        <Icon>
          <path d="M0 0h10v10z" />
        </Icon>
      </IconButton>
      <Button as="a" href="#destination">
        Destination
      </Button>
      <Button
        as="a"
        href="#account"
        onClick={event => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
          )
            return
          event.preventDefault()
          history.pushState(null, '', event.currentTarget.href)
          increment()
        }}
      >
        Account
      </Button>
      <Button as="a" href="#forbidden" disabled focusableWhenDisabled onClick={increment}>
        Unavailable
      </Button>
      <Button loading onClick={increment}>
        Sending
      </Button>
      <Spinner label="Fetching" />
      <output id="count">{count()}</output>
      <ContractScenarios
        render={scenario => (
          <Button
            variant={scenario === 'variant' ? 'outline' : undefined}
            classes={scenario === 'slot' ? { label: 'contract-part' } : undefined}
          >
            Save changes
          </Button>
        )}
      />
    </>
  )
}
export const html = import.meta.env.SSR ? renderToString(() => <Fixture />) : ''
export const hydrationScript = import.meta.env.SSR ? generateHydrationScript() : ''
export const head = import.meta.env.SSR ? '<style>' + contractTheme.css + '</style>' : ''
if (!import.meta.env.SSR) {
  const root = document.querySelector('main')!
  const original = root.querySelector('#save')
  const dispose = hydrate(() => <Fixture />, root)
  flush()
  if (original !== root.querySelector('#save')) throw new Error('Hydration replaced Button')
  root.dataset.hydrated = 'true'
  document.querySelector('#dispose')!.addEventListener('click', dispose, { once: true })
}
