import { createComponent, createSignal } from 'solid-js'
import { Hello } from 'eroxo-ui/hello'

export function view() {
  const [to, setTo] = createSignal('fixture')
  return {
    render: () =>
      createComponent(Hello, {
        get to() {
          return to()
        },
      }),
    update: () => setTo('updated'),
  }
}
