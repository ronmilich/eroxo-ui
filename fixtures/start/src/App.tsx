import { createSignal } from 'solid-js'
import { Hello } from 'eroxo-ui/hello'
import 'eroxo-ui/styles.css'

export default function App() {
  const [to, setTo] = createSignal('fixture')
  return (
    <main>
      <Hello to={to()} />
      <button type="button" onClick={() => setTo('updated')}>
        Update
      </button>
    </main>
  )
}
