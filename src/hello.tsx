import './tokens.css'
import './hello.css'
import { type Accessor, type Component, createMemo, createSignal } from 'solid-js'

export function createHello(): [Accessor<string>, (to: string) => void] {
  const [hello, setHello] = createSignal('Hello World!')

  return [hello, (to: string) => setHello(`Hello ${to}!`)]
}

interface HelloProps {
  /**
   * The name to greet.
   * @defaultValue "World"
   * @example <Hello to="Iris" />
   */
  to?: string
}

export const Hello: Component<HelloProps> = props => {
  const to = createMemo<string>(previous => props.to ?? previous ?? 'World')
  return <div class="erx-hello">{`Hello ${to()}!`}</div>
}
