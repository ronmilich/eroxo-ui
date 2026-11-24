import { Hello } from 'eroxo-ui/hello'
import { createSignal } from 'solid-js'
import 'eroxo-ui/styles.css'

export default function HelloExample() {
  const [name, setName] = createSignal('Iris')

  return (
    <>
      <label>
        Name
        <input value={name()} onInput={event => setName(event.currentTarget.value)} />
      </label>
      <Hello to={name() || 'World'} />
    </>
  )
}
