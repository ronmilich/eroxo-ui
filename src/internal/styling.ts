import type { JSX } from '@solidjs/web'
import { warnInDevelopment } from './warnings.js'

export type Size = 'sm' | 'md' | 'lg'
export type Variant = 'solid' | 'soft' | 'outline' | 'ghost' | 'text'
export type Tone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
export type DataState = 'open' | 'closed' | 'checked' | 'unchecked' | 'indeterminate' | 'active'

const sizes: readonly Size[] = ['sm', 'md', 'lg']

/** The variants, tones and sizes a component supports, and its defaults. */
export interface StyleAxes<V extends Variant, T extends Tone, S extends boolean> {
  readonly component: string
  readonly variants: readonly V[]
  readonly defaultVariant: V | undefined
  readonly tones: readonly T[]
  readonly defaultTone: T | undefined
  readonly sized: S
}

/**
 * Declares a component's style axes. An axis without values has no prop and
 * renders no attribute.
 * @example defineStyleAxes({ component: 'Button', variants: ['solid', 'ghost'], defaultVariant: 'solid', sized: true })
 */
export function defineStyleAxes<
  const V extends Variant = never,
  const T extends Tone = never,
  const S extends boolean = false,
>(axes: {
  component: string
  variants?: readonly V[]
  defaultVariant?: NoInfer<V>
  tones?: readonly T[]
  defaultTone?: NoInfer<T>
  sized?: S
}): StyleAxes<V, T, S> {
  return {
    component: axes.component,
    variants: axes.variants ?? [],
    defaultVariant: axes.defaultVariant,
    tones: axes.tones ?? [],
    defaultTone: axes.defaultTone,
    sized: (axes.sized ?? false) as S,
  }
}

/** The props for the axes a component supports. Unsupported axes and values fail to type-check. */
export type StyleAxisProps<A> =
  A extends StyleAxes<infer V, infer T, infer S>
    ? ([V] extends [never] ? unknown : { variant?: V }) &
        ([T] extends [never] ? unknown : { tone?: T }) &
        (S extends true ? { size?: Size } : unknown)
    : never

export interface StyleAttributes {
  readonly 'data-erx-variant': string | undefined
  readonly 'data-erx-tone': string | undefined
  readonly 'data-erx-size': Size | undefined
}

function choose<V extends string>(
  component: string,
  axis: string,
  value: unknown,
  allowed: readonly V[],
  fallback: V | undefined,
): V | undefined {
  if (value === undefined || allowed.includes(value as V))
    return (value as V | undefined) ?? fallback
  warnInDevelopment(
    component,
    `${axis} ${JSON.stringify(value)} is not supported`,
    `Use ${allowed.join(', ')}`,
  )
  return fallback
}

/**
 * Resolves a component's variant, tone and explicit size into `data-erx-*`
 * attributes. Spread the result on the root; its getters stay reactive.
 * Variant and tone always render their resolved value. Size renders only when
 * set, so an omitted size follows the nearest density scope.
 */
export function createStyleAttributes<V extends Variant, T extends Tone, S extends boolean>(
  axes: StyleAxes<V, T, S>,
  props: { readonly variant?: V; readonly tone?: T; readonly size?: Size },
): StyleAttributes {
  return {
    get 'data-erx-variant'() {
      if (axes.variants.length === 0) return undefined
      return choose(axes.component, 'variant', props.variant, axes.variants, axes.defaultVariant)
    },
    get 'data-erx-tone'() {
      if (axes.tones.length === 0) return undefined
      return choose(axes.component, 'tone', props.tone, axes.tones, axes.defaultTone)
    },
    get 'data-erx-size'() {
      return axes.sized ? choose(axes.component, 'size', props.size, sizes, undefined) : undefined
    },
  }
}

/** Logical state for `data-erx-state` and the boolean state flags. */
export interface StateOptions {
  readonly state?: DataState
  readonly disabled?: boolean
  readonly invalid?: boolean
  readonly loading?: boolean
}

export interface StateAttributes {
  readonly 'data-erx-state': DataState | undefined
  readonly 'data-erx-disabled': '' | undefined
  readonly 'data-erx-invalid': '' | undefined
  readonly 'data-erx-loading': '' | undefined
}

const flag = (on: boolean | undefined) => (on ? '' : undefined)

/**
 * Normalizes state into `data-erx-*` attributes: flags are present and empty
 * when true and absent otherwise. Pass an object with getters so that the
 * attributes stay reactive. They never replace native or ARIA state.
 */
export function createStateAttributes(state: StateOptions): StateAttributes {
  return {
    get 'data-erx-state'() {
      return state.state
    },
    get 'data-erx-disabled'() {
      return flag(state.disabled)
    },
    get 'data-erx-invalid'() {
      return flag(state.invalid)
    },
    get 'data-erx-loading'() {
      return flag(state.loading)
    },
  }
}

/** Extra classes for a multi-part component's parts, keyed by part name. */
export type PartClasses<P extends string> = Readonly<Partial<Record<P, JSX.ClassValue>>>

/**
 * Returns the stable class list for the root (`erx-<block>` plus `class`) or a
 * part (`erx-<block>__<part>` plus its `classes` entry).
 * @example const part = createPartClasses('dialog', props); <h2 class={part('title')} />
 */
export function createPartClasses<P extends string>(
  block: string,
  props: { readonly class?: JSX.ClassValue; readonly classes?: PartClasses<P> },
): (part?: P) => JSX.ClassValue[] {
  return part =>
    part === undefined
      ? [`erx-${block}`, props.class]
      : [`erx-${block}__${part}`, props.classes?.[part]]
}
