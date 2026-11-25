import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'

export function VisuallyHidden(props: JSX.IntrinsicElements['span']) {
  return (
    <span
      {...omit(props, 'class')}
      class={props.class ? `erx-visually-hidden ${props.class}` : 'erx-visually-hidden'}
    />
  )
}
