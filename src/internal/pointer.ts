import { createEffect, createSignal, onCleanup, onSettled } from 'solid-js'
import { createCompositionGuard, widgetKey } from './keyboard.js'

export function createInputModality(getDocument: () => Document = () => document) {
  const [modality, setModality] = createSignal<'keyboard' | 'pointer' | 'touch'>('keyboard')
  onSettled(() => {
    const doc = getDocument()
    const keyboard = (event: KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.isComposing)
        setModality('keyboard')
    }
    const pointer = (event: PointerEvent) =>
      setModality(event.pointerType === 'touch' ? 'touch' : 'pointer')
    doc.addEventListener('keydown', keyboard, true)
    doc.addEventListener('pointerdown', pointer, true)
    return () => {
      doc.removeEventListener('keydown', keyboard, true)
      doc.removeEventListener('pointerdown', pointer, true)
    }
  })
  return modality
}

export function capturePointer(element: Element, pointerId: number): () => void {
  try {
    element.setPointerCapture(pointerId)
  } catch (error) {
    // The pointer can already have ended or the capture target been removed.
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      (error.name === 'NotFoundError' || error.name === 'InvalidStateError')
    )
      return () => {}
    throw error
  }
  let released = false
  return () => {
    if (!released && element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
    released = true
  }
}

export function createHover() {
  const [hovered, setHovered] = createSignal(false)
  return {
    hovered,
    onPointerEnter(event: PointerEvent) {
      const element = event.currentTarget as Element
      setHovered(
        (event.pointerType === 'mouse' || (event.pointerType === 'pen' && event.buttons === 0)) &&
          !!element.ownerDocument.defaultView?.matchMedia('(any-hover: hover)').matches,
      )
    },
    onPointerLeave() {
      setHovered(false)
    },
    onPointerCancel() {
      setHovered(false)
    },
  }
}

interface PressOptions {
  disabled?: boolean
  onPress: () => void
  onLongPress?: () => void
  longPressMs?: number
}

export function createPress(options: PressOptions) {
  const guard = createCompositionGuard()
  let pointer:
    { id: number; x: number; y: number; element: HTMLElement; release: () => void } | undefined
  let space = false
  let timer: ReturnType<typeof setTimeout> | undefined
  function cancel() {
    clearTimeout(timer)
    space = false
    const previous = pointer
    pointer = undefined
    previous?.release()
  }
  onCleanup(cancel)
  createEffect(
    () => options.disabled === true,
    disabled => {
      if (disabled) cancel()
    },
  )
  function outside(event: PointerEvent, element: HTMLElement) {
    const box = element.getBoundingClientRect()
    return (
      event.clientX < box.left ||
      event.clientX >= box.right ||
      event.clientY < box.top ||
      event.clientY >= box.bottom
    )
  }
  function cancelPointer(event: PointerEvent) {
    if (pointer?.id === event.pointerId) cancel()
  }
  return {
    onCompositionStart() {
      cancel()
      guard.onCompositionStart()
    },
    onCompositionEnd: guard.onCompositionEnd,
    onPointerDown(event: PointerEvent) {
      if (
        pointer ||
        space ||
        options.disabled ||
        event.defaultPrevented ||
        !event.isPrimary ||
        event.button !== 0
      )
        return
      const element = event.currentTarget as HTMLElement
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        element,
        release: capturePointer(element, event.pointerId),
      }
      if (options.onLongPress) {
        timer = setTimeout(() => {
          cancel()
          if (!options.disabled && element.isConnected) options.onLongPress?.()
        }, options.longPressMs ?? 500)
      }
    },
    onPointerMove(event: PointerEvent) {
      if (!pointer || pointer.id !== event.pointerId) return
      if (
        outside(event, pointer.element) ||
        Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 10
      )
        cancel()
    },
    onPointerUp(event: PointerEvent) {
      if (!pointer || pointer.id !== event.pointerId) return
      const valid =
        pointer.element.isConnected &&
        !options.disabled &&
        !event.defaultPrevented &&
        !outside(event, pointer.element) &&
        Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) <= 10
      cancel()
      if (valid) options.onPress()
    },
    onPointerCancel: cancelPointer,
    onLostPointerCapture: cancelPointer,
    onPointerLeave: cancelPointer,
    onKeyDown(event: KeyboardEvent) {
      if (options.disabled || pointer || event.target !== event.currentTarget) return
      const key = widgetKey(event, guard)
      if (key !== 'Enter' && key !== ' ') return
      event.preventDefault()
      if (event.repeat || space) return
      if (key === ' ') space = true
      else options.onPress()
    },
    onKeyUp(event: KeyboardEvent) {
      if (!space || (event.key !== ' ' && event.key !== 'Spacebar')) return
      space = false
      if (
        !options.disabled &&
        widgetKey(event, guard) === ' ' &&
        event.target === event.currentTarget
      ) {
        event.preventDefault()
        options.onPress()
      }
    },
    onBlur() {
      cancel()
      guard.reset()
    },
    onClick(event: MouseEvent) {
      // AT and programmatic activation can deliver a click without a pointer sequence.
      if (
        event.detail === 0 &&
        !('pointerType' in event && event.pointerType) &&
        !options.disabled &&
        !event.defaultPrevented
      )
        options.onPress()
    },
  }
}
