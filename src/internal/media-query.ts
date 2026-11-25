import { isServer } from '@solidjs/web'
import { type Accessor, createSignal, isHydrating, onCleanup, onSettled } from 'solid-js'

interface MediaSource {
  readonly matches: Accessor<boolean>
  consumers: number
  listen(): void
  stop(): void
}

// All consumers of a query share one source and at most one media-query
// listener. Both exist only while at least one consumer does.
const sources = new Map<string, MediaSource>()

function createSource(query: string): MediaSource {
  // Read the query at once so a new component renders with the current value.
  // During hydration, start from the server's value and read the query after mount.
  let media = isServer || isHydrating() ? undefined : window.matchMedia(query)
  const [matches, setMatches] = createSignal(media?.matches ?? false)
  const update = () => setMatches(media!.matches)
  let listening = false
  return {
    matches,
    consumers: 0,
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

/**
 * Returns whether a media query matches. The server and hydration render
 * `false`; the value updates once the calling component settles.
 */
export function createMediaQuery(query: string): Accessor<boolean> {
  let source = sources.get(query)
  if (!source) sources.set(query, (source = createSource(query)))
  const shared = source
  shared.consumers++
  onCleanup(() => {
    if (--shared.consumers > 0) return
    shared.stop()
    sources.delete(query)
  })
  // Call onSettled once in each branch. The server reserves one hydration ID for it.
  if (!isHydrating()) {
    onSettled(() => shared.listen())
    return shared.matches
  }
  // Keep the server-rendered value until this hydrated component has settled.
  const [hydrated, setHydrated] = createSignal(false)
  onSettled(() => {
    setHydrated(true)
    shared.listen()
  })
  return () => hydrated() && shared.matches()
}
