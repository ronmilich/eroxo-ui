import { IconButton } from 'eroxo-ui'
import { createSignal } from 'solid-js'
export default function IconButtonExample() {
  const [count, setCount] = createSignal(0)
  return (
    <IconButton aria-label="Add one" onClick={() => setCount(n => n + 1)}>
      +{count()}
    </IconButton>
  )
}
