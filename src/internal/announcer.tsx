import { isServer } from '@solidjs/web'
import { createContext, type ParentProps, onCleanup, onSettled, useContext } from 'solid-js'
import { VisuallyHidden } from './visually-hidden.jsx'

type Announce = (message: string, priority?: 'polite' | 'assertive') => void
const AnnouncerContext = createContext<Announce | null>(null)

function createChannel() {
  let region: HTMLSpanElement | undefined
  let active = false
  let disposed = false
  let pending: string | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  function schedule() {
    if (!active || !region || pending === undefined || timer !== undefined) return
    const node = region
    node.textContent = ''
    // Separate the removal and insertion so repeated messages are DOM changes.
    timer = setTimeout(() => {
      node.textContent = pending ?? ''
      pending = undefined
      timer = undefined
    }, 100)
  }

  onSettled(() => {
    active = true
    schedule()
  })
  onCleanup(() => {
    disposed = true
    region = undefined
    pending = undefined
    clearTimeout(timer)
  })

  return {
    ref(node: HTMLSpanElement) {
      region = node
      schedule()
    },
    announce(message: string) {
      if (isServer || disposed || !message.trim()) return
      pending = message
      schedule()
    },
  }
}

export function AnnouncerProvider(props: ParentProps) {
  if (useContext(AnnouncerContext)) return props.children

  const polite = createChannel()
  const assertive = createChannel()
  const announce: Announce = (message, priority = 'polite') => {
    const channel = priority === 'assertive' ? assertive : polite
    channel.announce(message)
  }
  return (
    <AnnouncerContext value={announce}>
      <VisuallyHidden ref={polite.ref} role="status" aria-live="polite" aria-atomic="true" />
      <VisuallyHidden ref={assertive.ref} aria-live="assertive" aria-atomic="true" />
      {props.children}
    </AnnouncerContext>
  )
}

export function useAnnounce(): Announce {
  const announce = useContext(AnnouncerContext)
  if (!announce) throw new Error('useAnnounce requires an AnnouncerProvider')
  return announce
}
