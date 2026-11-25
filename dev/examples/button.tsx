import { Button } from 'eroxo-ui'
import { createSignal } from 'solid-js'
export default function ButtonExample() {
  const [count, setCount] = createSignal(0)
  return (
    <Button variant="outline" onClick={() => setCount(n => n + 1)}>
      Saved {count()} times
    </Button>
  )
}
