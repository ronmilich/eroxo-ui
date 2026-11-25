import assert from 'node:assert/strict'
import { checkAccessibility, runKeyboardTable } from './harness.mjs'
import { buildPrimitiveFixture } from './primitive-fixture.mjs'

export function buildAccessibilityUtilitiesFixture(dir) {
  return buildPrimitiveFixture(dir, 'accessibility-utilities', {
    styles: true,
    head: `<style>
      @layer erx.tokens {
        button, input {
          min-block-size: 44px;
          min-inline-size: 44px;
          color: var(--erx-color-text);
          background-color: var(--erx-color-surface);
          border: 1px solid var(--erx-color-input-border);
        }
      }
    </style>`,
  })
}

export async function checkAccessibilityUtilities(browser, base) {
  const url = base + '/accessibility-utilities/'
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  try {
    await staticPage.goto(url)
    const regions = staticPage.locator('[aria-live]')
    assert.deepEqual(await regions.allTextContents(), ['', ''])
    assert.equal(await staticPage.getByRole('button', { name: 'Close', exact: true }).count(), 1)
  } finally {
    await staticPage.close()
  }

  const page = await browser.newPage({ reducedMotion: 'no-preference' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) errors.push(message.text())
  })
  const draft = page.getByRole('textbox', { name: 'Draft' })
  const move = page.getByRole('button', { name: 'Move focus' })
  const polite = page.locator('[aria-live=polite]')
  const assertive = page.locator('[aria-live=assertive]')
  const motion = page.locator('#motion')
  const motionDuration = () =>
    motion.evaluate(el =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue('--erx-motion-duration-fast')),
    )
  try {
    await runKeyboardTable(
      page,
      url,
      ['Enter', 'Space'].map(key => ({
        name: 'Programmatic focus keeps a visible keyboard indicator',
        keys: [key],
        async arrange() {
          await page.locator('main[data-hydrated=true]').waitFor()
          await move.focus()
        },
        async verify() {
          assert.ok(
            await draft.evaluate(
              el => el === document.activeElement && el.matches(':focus-visible'),
            ),
          )
          assert.equal(await draft.evaluate(el => getComputedStyle(el).outlineWidth), '2px')
        },
      })),
    )
    const close = page.getByRole('button', { name: 'Close', exact: true })
    const hidden = close.locator('.erx-visually-hidden')
    assert.ok(
      await hidden.evaluate(el => {
        const style = getComputedStyle(el)
        return style.clipPath === 'inset(50%)' && el.getBoundingClientRect().width === 1
      }),
    )
    for (const region of [polite, assertive]) {
      assert.equal(await region.getAttribute('aria-atomic'), 'true')
      assert.equal(await region.textContent(), '')
    }
    await close.click()
    await polite.filter({ hasText: 'Saved' }).waitFor()
    await page.getByRole('button', { name: 'Clear' }).click()
    await assertive.filter({ hasText: 'Error' }).waitFor()
    assert.equal(await polite.textContent(), 'Saved')
    await checkAccessibility(page)

    await draft.fill('Keep this draft')
    const input = await draft.elementHandle()
    await page.getByRole('button', { name: 'Switch locale' }).click()
    await page.getByRole('button', { name: 'סגירה' }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Clear' }).count(), 1)
    assert.equal(await draft.inputValue(), 'Keep this draft')
    assert.ok(await draft.evaluate((el, original) => el === original, input))
    assert.deepEqual(
      await draft.evaluate(el => [el.closest('[lang]').lang, getComputedStyle(el).direction]),
      ['he', 'rtl'],
    )
    await input.dispose()

    assert.equal(await motion.textContent(), 'Full')
    assert.ok((await motionDuration()) > 0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await motion.filter({ hasText: 'Reduced' }).waitFor()
    assert.equal(await motionDuration(), 0)
    await page.getByRole('button', { name: 'Toggle scoped motion' }).click()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    assert.equal(await motion.textContent(), 'Reduced')
    assert.equal(await motionDuration(), 0)
    await page.getByRole('button', { name: 'Toggle scoped motion' }).click()
    await motion.filter({ hasText: 'Full' }).waitFor()
    assert.ok((await motionDuration()) > 0)

    await page.emulateMedia({ forcedColors: 'active' })
    const forcedColors = await page.evaluate(() => matchMedia('(forced-colors: active)').matches)
    if (browser.browserType().name() === 'chromium') assert.ok(forcedColors)
    if (forcedColors) {
      await move.focus()
      await page.keyboard.press('Enter')
      const colors = await draft.evaluate(el => {
        const system = document.createElement('input')
        system.style.cssText = 'border: 1px solid ButtonText; outline: 2px solid Highlight'
        el.after(system)
        const expected = getComputedStyle(system)
        const actual = getComputedStyle(el)
        const result = [
          actual.borderTopColor,
          actual.outlineColor,
          expected.borderTopColor,
          expected.outlineColor,
        ]
        system.remove()
        return result
      })
      assert.deepEqual(colors.slice(0, 2), colors.slice(2))
    }

    await page.getByRole('button', { name: 'Show portal' }).click()
    const portal = page.getByRole('button', { name: 'Portal announcement' })
    await portal.click()
    await polite.filter({ hasText: 'From portal' }).waitFor()
    assert.equal(
      await page.locator('main').getByRole('button', { name: 'Portal announcement' }).count(),
      0,
    )
    await page.getByRole('button', { name: 'Dispose' }).click()
    await polite.waitFor({ state: 'detached' })
    await assertive.waitFor({ state: 'detached' })
    await portal.waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}
