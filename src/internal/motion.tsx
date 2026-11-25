import {
  createContext,
  createSignal,
  onSettled,
  type Accessor,
  type ParentProps,
  useContext,
} from 'solid-js'

const MotionContext = createContext<Accessor<boolean> | null>(null)

function createSystemMotion(): Accessor<boolean> {
  const [reduced, setReduced] = createSignal(false)
  onSettled(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  })
  return reduced
}

export function MotionScope(props: ParentProps<{ reduce?: boolean }>) {
  const inherited = useContext(MotionContext) ?? createSystemMotion()
  const reduced = () => props.reduce === true || inherited()
  return (
    <MotionContext value={reduced}>
      <div data-erx-motion={props.reduce ? 'reduce' : undefined}>{props.children}</div>
    </MotionContext>
  )
}

export function useReducedMotion(): Accessor<boolean> {
  return useContext(MotionContext) ?? createSystemMotion()
}
