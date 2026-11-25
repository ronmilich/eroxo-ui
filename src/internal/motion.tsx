import { createContext, type Accessor, type ParentProps, useContext } from 'solid-js'
import { createMediaQuery } from './media-query.js'

const MotionContext = createContext<Accessor<boolean> | null>(null)
const query = '(prefers-reduced-motion: reduce)'

export function MotionScope(props: ParentProps<{ reduce?: boolean }>) {
  const inherited = useContext(MotionContext) ?? createMediaQuery(query)
  const reduced = () => props.reduce === true || inherited()
  return (
    <MotionContext value={reduced}>
      <div data-erx-motion={props.reduce ? 'reduce' : undefined}>{props.children}</div>
    </MotionContext>
  )
}

export function useReducedMotion(): Accessor<boolean> {
  return useContext(MotionContext) ?? createMediaQuery(query)
}
