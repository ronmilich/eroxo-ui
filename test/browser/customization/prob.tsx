import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import {
  createPartClasses,
  createStateAttributes,
  createStyleAttributes,
  defineStyleAxes,
  type PartClasses,
  type StyleAxisProps,
} from '../../../src/internal/styling.js'
import './probe.css'

// A private multi-part component that exercises the UL-19 styling plumbing the
// way a production component would. It is never published.
const axes = defineStyleAxes({
  component: 'Probe',
  variants: ['solid', 'outline'],
  defaultVariant: 'solid',
  tones: ['primary', 'neutral', 'danger'],
  defaultTone: 'primary',
  sized: true,
})

export type ProbeProps = StyleAxisProps<typeof axes> &
  Omit<JSX.IntrinsicElements['div'], 'children'> & {
    label: string
    disabled?: boolean
    classes?: PartClasses<'icon' | 'label'>
  }

export function Probe(props: ProbeProps): JSX.Element {
  const part = createPartClasses('probe', props)
  const style = createStyleAttributes(axes, props)
  const state = createStateAttributes({
    get disabled() {
      return props.disabled
    },
  })
  const others = omit(props, 'label', 'disabled', 'classes', 'class', 'variant', 'tone', 'size')
  return (
    <div {...others} {...style} {...state} class={part()}>
      <span class={part('icon')} aria-hidden="true">
        ●
      </span>
      <span class={part('label')}>{props.label}</span>
    </div>
  )
}


