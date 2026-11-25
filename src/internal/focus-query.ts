import { focusElement } from './focus.js'

type Scope = Element | Document | ShadowRoot
type Target = HTMLElement | SVGElement

function composedParent(node: Node): Node | null {
  if ('assignedSlot' in node && node.assignedSlot) return node.assignedSlot as HTMLSlotElement
  if (node.parentNode) return node.parentNode
  return 'host' in node ? (node as ShadowRoot).host : null
}

export function isInsideLayerTree(target: Node | null, roots: readonly Scope[]): boolean {
  for (let node = target; node; node = composedParent(node)) {
    if (roots.some(root => root === node)) return true
  }
  return false
}

const candidates =
  'a[href],area[href],button,input,select,textarea,summary,iframe,audio[controls],video[controls],[contenteditable],[tabindex]'

function canFocus(element: Element): element is Target {
  if (
    !element.matches(candidates) ||
    element.matches(':disabled,input[type=hidden]') ||
    !('focus' in element)
  )
    return false
  if (element.localName === 'summary' && !element.hasAttribute('tabindex')) {
    const details = element.parentElement
    if (details?.localName !== 'details' || element !== details.querySelector(':scope > summary'))
      return false
  }
  if (
    element.matches('[contenteditable]') &&
    !element.hasAttribute('tabindex') &&
    (!(element as HTMLElement).isContentEditable || element.parentElement?.isContentEditable)
  )
    return false
  for (let ancestor: Node | null = element; ancestor; ancestor = composedParent(ancestor)) {
    if ('matches' in ancestor && (ancestor as Element).matches('[inert],[hidden]')) return false
  }
  const style = element.ownerDocument.defaultView?.getComputedStyle(element)
  return (
    !!element.getClientRects().length &&
    style?.visibility !== 'hidden' &&
    style?.visibility !== 'collapse' &&
    element.checkVisibility()
  )
}

function tabOrder(element: Target) {
  if (element.hasAttribute('tabindex')) return element.tabIndex
  // Editing hosts, media controls and summary can report -1 despite being tab stops.
  return Math.max(0, element.tabIndex)
}

function flatChildren(root: Scope) {
  if ('shadowRoot' in root && root.shadowRoot) return root.shadowRoot.children
  if ('localName' in root && root.localName === 'slot') {
    const slot = root as HTMLSlotElement
    // Assigned text also suppresses the fallback elements.
    if (slot.assignedNodes().length) return slot.assignedElements({ flatten: true })
  }
  return root.children
}

function collect(root: Scope, tabbable: boolean): Target[] {
  const groups: { order: number; elements: Target[] }[] = []
  function visit(element: Element) {
    const focusable = canFocus(element)
    const order = focusable ? tabOrder(element) : 0
    const own: Target[] = focusable && (!tabbable || order >= 0) ? [element] : []
    if (element.shadowRoot || element.localName === 'slot') {
      if (tabbable && element.hasAttribute('tabindex') && (element as HTMLElement).tabIndex < 0)
        return
      own.push(...collect(element.shadowRoot ?? element, tabbable))
    } else {
      if (own.length) groups.push({ order, elements: own })
      for (const child of element.children) visit(child)
      return
    }
    if (own.length) groups.push({ order, elements: own })
  }
  for (const child of flatChildren(root)) visit(child)
  if (tabbable) groups.sort((a, b) => (a.order || Infinity) - (b.order || Infinity))
  return groups.flatMap(group => group.elements)
}

export function getFocusable(root: Scope): Target[] {
  return collect(root, false)
}

export function getTabbable(root: Scope): Target[] {
  const elements = collect(root, true)
  const visited = new Set<Node>()
  const stops = new Map<Node, Map<string, HTMLInputElement>>()
  function group(radio: HTMLInputElement) {
    const owner = radio.form ?? radio.getRootNode()
    let names = stops.get(owner)
    if (!names) {
      names = new Map()
      stops.set(owner, names)
    }
    return names
  }
  return elements.filter(element => {
    if (!element.matches('input[type=radio]')) return true
    const radio = element as HTMLInputElement
    if (!radio.name) return true
    // A checked peer can own the tab stop outside the queried subtree.
    const tree = radio.getRootNode() as Document | ShadowRoot
    if (!visited.has(tree)) {
      visited.add(tree)
      for (const checked of tree.querySelectorAll<HTMLInputElement>('input[type=radio]:checked')) {
        group(checked).set(checked.name, checked)
      }
    }
    const names = group(radio)
    if (!names.has(radio.name)) names.set(radio.name, radio)
    return names.get(radio.name) === radio
  })
}

export function focusFirst(root: Scope): boolean {
  return focusElement(getTabbable(root)[0])
}
export function focusLast(root: Scope): boolean {
  return focusElement(getTabbable(root).at(-1))
}
export function focusNext(root: Scope, from: Element, backwards = false): boolean {
  const elements = getTabbable(root)
  if (backwards) elements.reverse()
  const index = elements.findIndex(element => element === from)
  if (index >= 0) return focusElement(elements[index + 1])
  const ordered = getFocusable(root)
  if (backwards) ordered.reverse()
  const position = ordered.findIndex(element => element === from)
  if (position < 0) return focusElement(elements[0])
  const stops = new Set(elements)
  return focusElement(ordered.slice(position + 1).find(element => stops.has(element)))
}
