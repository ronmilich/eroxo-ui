import { isServer } from '@solidjs/web'
import {
  createContext,
  createSignal,
  isHydrating,
  onCleanup,
  onSettled,
  type Accessor,
  type ParentProps,
  useContext,
} from 'solid-js'

const MotionContext = createContext<Accessor<boolean> | null>(null)
const query = '(prefers-reduced-motion: reduce)'

interface SystemMotion {
  reduced: Accessor<boolean>
  listen(): void
  stop(): void
}

// Scopes and hooks share one system preference and at most one media-query
// listener. Both exist only while at least one consumer does.
let shared: SystemMotion | undefined
let consumers = 0

function createSystemMotionSource(): SystemMotion {
  // Read the preference at once so a new component renders with it. During
  // hydration, start from the server's value and read the preference after mount.
  let media = isServer || isHydrating() ? undefined : window.matchMedia(query)
  const [reduced, setReduced] = createSignal(media?.matches ?? false)
  const update = () => setReduced(media!.matches)
  let listening = false
  return {
    reduced,
    listen() {
      if (listening) return
      listening = true
      media ??= window.matchMedia(query)
      update()
      media.addEventListener('change', update)
    },
    stop() {
      if (listening) media!.removeEventListener('change', update)
      listening = false
    },
  }
}

function createSystemMotion(): Accessor<boolean> {
  if (consumers++ === 0) shared = createSystemMotionSource()
  const source = shared!
  onCleanup(() => {
    if (--consumers > 0) return
    source.stop()
    shared = undefined
  })
  // Call onSettled once in each branch. The server reserves one hydration ID for it.
  if (!isHydrating()) {
    onSettled(() => source.listen())
    return source.reduced
  }
  // Keep the server-rendered value until this hydrated component has settled.
  const [hydrated, setHydrated] = createSignal(false)
  onSettled(() => {
    setHydrated(true)
    source.listen()
  })
  return () => hydrated() && source.reduced()
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
