import './tokens.css'
import './button.css'
import type { JSX } from '@solidjs/web'
import { omit } from 'solid-js'
import { Spinner } from './spinner.jsx'
import { composeEventHandlers, type ButtonOrAnchorProps } from './internal/dom.js'
import {
  createPartClasses,
  createStateAttributes,
  createStyleAttributes,
  defineStyleAxes,
  type Size,
  type Variant,
  type Tone,
  type PartClasses,
} from './internal/styling.js'
import { warnInDevelopment } from './internal/warnings.js'

export interface ButtonOptions {
  /** Visual treatment.
   * @defaultValue solid (Button), ghost (IconButton)
   * @example variant="outline"
   */
  variant?: Variant
  /** Semantic color palette.
   * @defaultValue primary (Button), neutral (IconButton)
   * @example tone="danger"
   */
  tone?: Tone
  /** Control height and padding.
   * @defaultValue nearest density
   * @example size="lg"
   */
  size?: Size
  /** Corner treatment.
   * @defaultValue default
   * @example shape="pill"
   */
  shape?: 'default' | 'pill'
  /** Shows a spinner and suppresses activation while keeping focus and the accessible name.
   * @defaultValue false
   * @example loading={saving()}
   */
  loading?: boolean
  /** Disables activation.
   * @defaultValue false
   * @example disabled={locked()}
   */
  disabled?: boolean
  /** Keeps a disabled control in the tab order.
   * @defaultValue false
   * @example focusableWhenDisabled
   */
  focusableWhenDisabled?: boolean
  /** Fills available inline space.
   * @defaultValue false
   * @example fullWidth
   */
  fullWidth?: boolean
  /** Decorative content before the label.
   * @defaultValue none
   * @example startIcon={<SaveIcon />}
   */
  startIcon?: JSX.Element
  /** Decorative content after the label.
   * @defaultValue none
   * @example endIcon={<NextIcon />}
   */
  endIcon?: JSX.Element
  /** Adds classes to individual parts.
   * @defaultValue none
   * @example classes={{ label: "caption" }}
   */
  classes?: PartClasses<'label' | 'start-icon' | 'end-icon' | 'spinner'>
}
export type ButtonProps = ButtonOrAnchorProps<ButtonOptions>
export type IconButtonProps = ButtonProps &
  (
    | {
        /** Short accessible name, required unless aria-labelledby identifies a label.
         * @defaultValue none
         * @example aria-label="Close"
         */
        'aria-label': string
      }
    | {
        /** ID of the visible label, required unless aria-label supplies a name.
         * @defaultValue none
         * @example aria-labelledby="close-label"
         */
        'aria-labelledby': string
      }
  )

const axes = defineStyleAxes({
  component: 'Button',
  variants: ['solid', 'soft', 'outline', 'ghost', 'text'],
  defaultVariant: 'solid',
  tones: ['primary', 'neutral', 'danger', 'success', 'warning', 'info'],
  defaultTone: 'primary',
  sized: true,
})
const iconAxes = {
  ...axes,
  component: 'IconButton',
  defaultVariant: 'ghost',
  defaultTone: 'neutral',
} as const

function control(props: ButtonProps, iconOnly: boolean): JSX.Element {
  const part = createPartClasses(iconOnly ? 'icon-button' : 'button', props)
  const blocked = () => !!(props.disabled || props.loading || props['aria-disabled'] === 'true')
  const state = createStateAttributes({
    get disabled() {
      return blocked()
    },
    get loading() {
      return props.loading
    },
  })
  const appearance = createStyleAttributes(iconOnly ? iconAxes : axes, props)
  const rest = omit(
    props,
    'as',
    'href',
    'type',
    'disabled',
    'class',
    'variant',
    'tone',
    'size',
    'shape',
    'loading',
    'focusableWhenDisabled',
    'fullWidth',
    'startIcon',
    'endIcon',
    'classes',
    'children',
    'onClick',
    'ref',
  )
  const forwardClick = composeEventHandlers<MouseEvent>(
    () => props.onClick as ((event: MouseEvent) => void) | undefined,
  )
  function click(event: MouseEvent) {
    if (blocked()) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    forwardClick(event)
  }
  const common = {
    get class() {
      return [part(), 'erx-focus-ring']
    },
    get 'data-erx-shape'() {
      return props.shape
    },
    get 'data-erx-full-width'() {
      return props.fullWidth ? '' : undefined
    },
    get 'aria-busy'() {
      return props.loading ? ('true' as const) : props['aria-busy']
    },
    onClick: click,
  }
  const contents = () => (
    <>
      {props.loading && (
        <span aria-hidden="true" class={part('spinner')}>
          <Spinner decorative />
        </span>
      )}
      {props.startIcon && (
        <span aria-hidden="true" class={part('start-icon')}>
          {props.startIcon}
        </span>
      )}
      <span class={part('label')}>{props.children}</span>
      {props.endIcon && (
        <span aria-hidden="true" class={part('end-icon')}>
          {props.endIcon}
        </span>
      )}
    </>
  )
  if (props.as === 'a')
    return (
      <a
        {...(rest as JSX.IntrinsicElements['a'])}
        {...appearance}
        {...state}
        {...common}
        ref={props.ref}
        href={blocked() ? undefined : props.href}
        role={blocked() ? 'link' : props.role}
        aria-disabled={blocked() ? 'true' : undefined}
        tabindex={
          blocked() ? (props.focusableWhenDisabled || props.loading ? 0 : -1) : props.tabindex
        }
      >
        {contents()}
      </a>
    )
  return (
    <button
      {...(rest as JSX.IntrinsicElements['button'])}
      {...appearance}
      {...state}
      {...common}
      type={props.type ?? 'button'}
      ref={props.ref}
      disabled={props.disabled && !props.focusableWhenDisabled && !props.loading}
      aria-disabled={blocked() ? 'true' : undefined}
    >
      {contents()}
    </button>
  )
}

export function Button(props: ButtonProps) {
  return control(props, false)
}
export function IconButton(props: IconButtonProps) {
  if (!String(props['aria-label'] || '').trim() && !String(props['aria-labelledby'] || '').trim())
    warnInDevelopment(
      'IconButton',
      'missing an accessible name',
      'Supply aria-label or aria-labelledby',
    )
  return control(props, true)
}
