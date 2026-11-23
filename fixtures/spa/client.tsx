import { render } from '@solidjs/web'
import { createSignal } from 'solid-js'
import { Hello } from 'eroxo-ui'
import { Hello as SubpathHello } from 'eroxo-ui/hello'

if (Hello !== SubpathHello) throw new Error('Root and subpath resolved different components')
function App() {
  const [to, setTo] = createSignal('fixture')
  return (
    <>
      <Hello to={to()} />
      <button onClick={() => setTo('updated')}>Update</button>
    </>
  )
}
render(() => <App />, document.querySelector('main')!)
