import './tokens.css'
import './icon.css'
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
export interface IconOptions {
  /** Accessible name for a meaningful graphic.
   * @defaultValue decorative
   * @example label="Verified"
   */
  label?: string
  /** Token-based glyph size.
   * @defaultValue md
   * @example size="sm"
   */
  size?: 'sm' | 'md' | 'lg'
}
export type IconProps = IconOptions & Omit<JSX.IntrinsicElements['svg'], 'size'>
export function Icon(props: IconProps) {
  const rest = omit(props, 'size', 'label', 'class', 'children')
  const named = () => props.label || props['aria-label'] || props['aria-labelledby']
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...rest}
      class={['erx-icon', props.class]}
      data-erx-size={props.size}
      role={named() ? 'img' : undefined}
      aria-label={props.label ?? props['aria-label']}
      aria-hidden={named() ? undefined : 'true'}
      {...{ focusable: 'false' }}
    >
      {props.children}
    </svg>
  )
}
