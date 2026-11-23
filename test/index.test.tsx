import { createSignal, flush } from 'solid-js'
import { isServer, render } from '@solidjs/web'
import { describe, expect, it } from 'vitest'
import { Hello, createHello } from '../src'

describe('environment', () => {
  it('runs on client', () => {
    expect(typeof window).toBe('object')
    expect(isServer).toBe(false)
  })
})

describe('createHello', () => {
  it('returns a Hello World signal', () => {
    const [hello] = createHello()
    expect(hello()).toBe('Hello World!')
  })

  it('changes the hello target', () => {
    const [hello, setHello] = createHello()
    setHello('Solid')
    flush()
    expect(hello()).toBe('Hello Solid!')
  })
})

describe('Hello', () => {
  it('renders a hello component', () => {
    const container = document.createElement('main')
    const dispose = render(() => <Hello />, container)
    expect(container.innerHTML).toBe('<div class="erx-hello">Hello World!</div>')
    dispose()
  })

  it('changes the hello target', () => {
    const [to, setTo] = createSignal('Solid')
    const container = document.createElement('main')
    const dispose = render(() => <Hello to={to()} />, container)
    expect(container.innerHTML).toBe('<div class="erx-hello">Hello Solid!</div>')
    setTo('Tests')
    flush()
    expect(container.innerHTML).toBe('<div class="erx-hello">Hello Tests!</div>')
    dispose()
  })
})
