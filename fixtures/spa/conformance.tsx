import { render } from '@solidjs/web'
import { createHello } from 'eroxo-ui/hello'

// A private input fixture exercises composition before production fields ship.
function Entry(props: { name: string; suggestions?: string }) {
  const [greeting, commit] = createHello()
  let composing = false
  return (
    <section>
      <label>
        {props.name}
        <input
          list={props.suggestions}
          onCompositionStart={() => {
            composing = true
          }}
          onCompositionEnd={() => {
            composing = false
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' && !composing && !event.isComposing) {
              commit(event.currentTarget.value)
            }
          }}
        />
      </label>
      <output aria-label={props.name + ' result'}>{greeting()}</output>
    </section>
  )
}

render(
  () => (
    <>
      <h1>Input conformance</h1>
      <Entry name="Name" />
      <Entry name="City" suggestions="cities" />
      <datalist id="cities">
        <option value="東京" />
      </datalist>
    </>
  ),
  document.querySelector('main')!,
)
