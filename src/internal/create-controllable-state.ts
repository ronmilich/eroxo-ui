import { type Accessor, createEffect, createSignal, untrack } from 'solid-js'
import { warnInDevelopment } from './warnings.js'

interface StateOptions<T> {
  component: string
  prop: 'value' | 'open' | 'checked'
  value?: T
  defaultValue?: T
  fallback: T
  onChange?: (next: T) => void
}

export function createControllableState<T>(
  options: StateOptions<T>,
): [Accessor<T>, (next: T) => void] {
  const initialDefault = untrack(() => options.defaultValue)
  const [local, setLocal] = createSignal({
    value: initialDefault === undefined ? untrack(() => options.fallback) : initialDefault,
  })
  const read = () => {
    const value = options.value
    return value === undefined ? local().value : value
  }

  if (import.meta.env.DEV) {
    const { component, prop } = options
    const controlledAtMount = untrack(() => options.value !== undefined)
    const defaultProp = `default${prop.charAt(0).toUpperCase()}${prop.slice(1)}`
    if (controlledAtMount && initialDefault !== undefined) {
      warnInDevelopment(
        component,
        `Both ${prop} and ${defaultProp} are set`,
        `Pass only one of them`,
      )
    }
    createEffect(
      () => options.value !== undefined,
      (controlled, previous = controlledAtMount) => {
        if (controlled !== previous) {
          warnInDevelopment(
            component,
            `${prop} changed from ${previous ? 'controlled' : 'uncontrolled'} to ${controlled ? 'controlled' : 'uncontrolled'}`,
            'Keep the same state ownership for the lifetime of this instance',
          )
        }
      },
    )
  }

  return [
    read,
    next => {
      const value = options.value
      if (value === undefined) {
        // Solid passes the latest queued value to the updater, even before a flush.
        const candidate = { value: next }
        const result = setLocal(previous =>
          Object.is(previous.value, next) ? previous : candidate,
        )
        if (result !== candidate) return
      } else if (Object.is(value, next)) return
      options.onChange?.(next)
    },
  ]
}
