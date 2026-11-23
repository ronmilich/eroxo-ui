import assert from 'node:assert/strict'
import {
  checkAccessibility,
  checkComposition,
  checkGreeting,
  runKeyboardTable,
} from './harness.mjs'

const update = page => page.getByRole('button', { name: 'Update' })
const buttonRows = ['Enter', 'Space'].map(key => ({
  name: 'Update activates and keeps focus',
  keys: [key],
  arrange: page => update(page).focus(),
  async verify(page) {
    assert.equal(await page.locator('.erx-hello').textContent(), 'Hello updated!')
    assert.ok(await update(page).evaluate(button => button === document.activeElement))
  },
}))

export async function checkInputPatterns(browser, url) {
  const page = await browser.newPage({ hasTouch: true })
  try {
    await runKeyboardTable(page, url, buttonRows)
    await page.goto(url)
    const button = update(page)
    await button.evaluate(element =>
      element.addEventListener(
        'pointerdown',
        event => {
          element.dataset.pointer = event.pointerType
        },
        { once: true },
      ),
    )
    await button.tap()
    assert.equal(await button.getAttribute('data-pointer'), 'touch')
    assert.equal(await page.locator('.erx-hello').textContent(), 'Hello updated!')

    await page.goto(url + '/conformance/conformance.html')
    await checkComposition(page, 'Name')
    await checkComposition(page, 'City')
    await checkAccessibility(page)

    // Prove the gates catch a real defect. Positive fixtures run without a catch.
    await page.setContent(
      '<html lang="en"><title>Negative control</title><main><button></button></main></html>',
    )
    await assert.rejects(() => checkAccessibility(page), /button-name/)
    await page.setContent('<main><div class="erx-hello">Broken fixture</div></main>')
    await assert.rejects(() => checkGreeting(page, 'Hello fixture!'), /Packed fixture greeting/)
    const brokenRow = {
      ...buttonRows[0],
      async arrange(page) {
        await update(page).evaluate(button =>
          button.addEventListener('click', event => event.stopImmediatePropagation(), true),
        )
        await update(page).focus()
      },
    }
    await assert.rejects(
      () => runKeyboardTable(page, url, [brokenRow]),
      error => error.cause?.code === 'ERR_ASSERTION' && error.cause.actual === 'Hello fixture!',
    )
  } finally {
    await page.close()
  }
}
