import './tokens.css'
import './spinner.css'
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
export interface SpinnerOptions {
  /** Text announced while work is pending.
   * @defaultValue Loading
   * @example label="Saving"
   */
  label?: string
  /** Hides the spinner from assistive technology when the parent conveys progress.
   * @defaultValue false
   * @example decorative
   */
  decorative?: boolean
}
export type SpinnerProps = SpinnerOptions & Omit<JSX.IntrinsicElements['span'], 'children'>
export function Spinner(props: SpinnerProps) {
  const rest = omit(props, 'label', 'decorative', 'class')
  return (
    <span
      {...rest}
      class={['erx-spinner', props.class]}
      role={props.decorative ? undefined : 'status'}
      aria-hidden={props.decorative ? 'true' : undefined}
    >
      {!props.decorative && <span class="erx-visually-hidden">{props.label ?? 'Loading'}</span>}
    </span>
  )
}
