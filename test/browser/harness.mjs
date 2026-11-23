import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const axeScript = require.resolve('axe-core/axe.min.js')

export async function checkGreeting(page, expected) {
  assert.equal(await page.locator('.erx-hello').textContent(), expected, 'Packed fixture greeting')
}

export async function checkAccessibility(page) {
  await page.addScriptTag({ path: axeScript })
  const violations = await page.evaluate(async () => {
    const results = await window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
      },
    })
    return results.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(node => node.target),
    }))
  })
  assert.deepEqual(violations, [], 'Accessibility violations: ' + JSON.stringify(violations))
}

// Each row starts from a fresh fixture. Patterns can provide any setup and
// assert focus, ARIA state, selection or a visible effect after the key sequence.
export async function runKeyboardTable(page, url, rows) {
  for (const row of rows) {
    try {
      await page.goto(url)
      await row.arrange(page)
      for (const key of row.keys) await page.keyboard.press(key)
      await row.verify(page)
    } catch (cause) {
      throw new Error(`Keyboard row "${row.name}" failed (${row.keys.join(', ')})`, { cause })
    }
  }
}

export async function checkComposition(page, label) {
  const field = page.getByLabel(label, { exact: true })
  const result = page.getByLabel(label + ' result')
  await field.focus()
  await field.evaluate(input => {
    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    input.value = '東京'
    input.dispatchEvent(
      new CompositionEvent('compositionupdate', { bubbles: true, data: input.value }),
    )
    input.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: input.value,
        isComposing: true,
        inputType: 'insertCompositionText',
      }),
    )
  })
  await field.press('Enter')
  assert.equal(await result.textContent(), 'Hello World!', label + ' committed during composition')
  await field.evaluate(input => {
    input.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: input.value }),
    )
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, data: input.value, inputType: 'insertText' }),
    )
  })
  await field.press('Enter')
  assert.equal(await result.textContent(), 'Hello 東京!', label + ' lost the committed text')
}
