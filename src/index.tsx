import { type Accessor, type Component, createMemo, createSignal } from 'solid-js'

export function createHello(): [Accessor<string>, (to: string) => void] {
  const [hello, setHello] = createSignal('Hello World!')

  return [hello, (to: string) => setHello(`Hello ${to}!`)]
}

export const Hello: Component<{ to?: string }> = props => {
  const to = createMemo<string>(previous => props.to ?? previous ?? 'World')
  return <div>{`Hello ${to()}!`}</div>
}
