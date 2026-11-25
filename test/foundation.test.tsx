import { render } from '@solidjs/web'
import { createSignal, flush } from 'solid-js'
import { it, expect, vi } from 'vitest'
import { Button, IconButton, Icon, Spinner } from '../src'

it('forwards native attributes and references, updates states and suppresses blocked handlers', () => {
  const host = document.createElement('div')
  const ref = vi.fn(),
    clicked = vi.fn()
  const [loading, setLoading] = createSignal(false)
  const dispose = render(
    () => (
      <Button
        type="submit"
        ref={ref}
        loading={loading()}
        onClick={[clicked, 'save']}
        startIcon="+"
        endIcon="."
        classes={{ label: 'caption' }}
      >
        Save
      </Button>
    ),
    host,
  )
  const button = host.querySelector('button')!
  expect(ref).toHaveBeenCalledWith(button)
  expect(button.type).toBe('submit')
  expect(button.querySelector('.caption')?.textContent).toBe('Save')
  button.click()
  expect(clicked).toHaveBeenCalledWith('save', expect.any(MouseEvent))
  setLoading(true)
  flush()
  expect(button.getAttribute('aria-busy')).toBe('true')
  expect(button.disabled).toBe(false)
  button.click()
  expect(clicked).toHaveBeenCalledTimes(1)
  setLoading(false)
  flush()
  expect(button.hasAttribute('data-erx-loading')).toBe(false)
  dispose()
})
it('uses native disabled and focusable states and restores a reactive link', () => {
  const host = document.createElement('div')
  const [locked, setLocked] = createSignal(true)
  const visit = vi.fn()
  const dispose = render(
    () => (
      <>
        <Button disabled>Disabled</Button>
        <Button
          as="a"
          href="/account"
          disabled={locked()}
          focusableWhenDisabled
          onClick={event => {
            event.preventDefault()
            visit()
          }}
        >
          Account
        </Button>
      </>
    ),
    host,
  )
  expect(host.querySelector('button')?.disabled).toBe(true)
  const link = host.querySelector('a')!
  expect(link.hasAttribute('href')).toBe(false)
  expect(link.tabIndex).toBe(0)
  link.click()
  expect(visit).not.toHaveBeenCalled()
  setLocked(false)
  flush()
  expect(link.getAttribute('href')).toBe('/account')
  link.click()
  expect(visit).toHaveBeenCalledOnce()
  dispose()
})
it('exposes names and hides decorative graphics', () => {
  const host = document.createElement('div')
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const dispose = render(
    () => (
      <>
        <IconButton aria-label="">+</IconButton>
        <IconButton aria-label="Add">+</IconButton>
        <Icon />
        <Icon label="Complete" />
        <Spinner />
        <Spinner decorative />
      </>
    ),
    host,
  )
  expect(warn).toHaveBeenCalledTimes(1)
  expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  expect(host.querySelector('[role=img]')?.getAttribute('aria-label')).toBe('Complete')
  expect(host.querySelector('[role=status]')?.textContent).toBe('Loading')
  expect(host.querySelectorAll('[role=status]')).toHaveLength(1)
  dispose()
  warn.mockRestore()
})
