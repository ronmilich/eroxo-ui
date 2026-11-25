import type { JSX } from '@solidjs/web'
import { type Accessor, createUniqueId } from 'solid-js'

export function createElementId(provided?: Accessor<string | undefined>): Accessor<string> {
  const generated = `erx-${createUniqueId()}`
  return () => provided?.() ?? generated
}

export function composeRefs<T extends Element>(...refs: JSX.Ref<T>[]): (element: T) => void {
  return element => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(element)
      else if (Array.isArray(ref)) composeRefs(...ref)(element)
    }
  }
}

type EventHandler<E extends Event> = (event: E) => void

// The two indexed members match Solid's bound event handler type. The method
// signature lets an individual handler declare the type of its bound data.
interface BoundEventHandler<E extends Event> {
  0(data: unknown, event: E): void
  1: unknown
}

export function composeEventHandlers<E extends Event>(
  consumer: Accessor<EventHandler<E> | BoundEventHandler<E> | undefined>,
  action?: EventHandler<E>,
): EventHandler<E> {
  return event => {
    const handler = consumer()
    if (typeof handler === 'function') handler.call(event.currentTarget, event)
    else if (handler) handler[0].call(event.currentTarget, handler[1], event)
    if (!event.cancelable || !event.defaultPrevented) action?.(event)
  }
}

export type ButtonOrAnchorProps<OwnProps extends object> = OwnProps &
  (
    | ({
        /** Native root element. Keep this choice stable for the lifetime of the control.
         * @defaultValue button
         * @example as="a"
         */
        as?: 'button'
        /** Navigation destination, required when rendering an anchor.
         * @defaultValue none
         * @example href="/settings"
         */
        href?: never
        /** Native form behavior of a button.
         * @defaultValue button
         * @example type="submit"
         */
        type?: 'button' | 'submit' | 'reset'
      } & Omit<JSX.IntrinsicElements['button'], keyof OwnProps | 'type'>)
    | ({ as: 'a'; href: string; type?: never } & Omit<
        JSX.IntrinsicElements['a'],
        keyof OwnProps | 'href' | 'type'
      >)
  )
