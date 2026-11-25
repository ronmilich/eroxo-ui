import assert from 'node:assert/strict'
import { buildPrimitiveFixture } from './primitive-fixture.mjs'
import { checkAccessibility } from './harness.mjs'
import { contractStyles, checkCustomizationContract } from './customization/contract.mjs'

const contract = {
  root: '.erx-button',
  themed: { property: 'background-color', token: '--erx-color-primary' },
  untouched: { property: 'color' },
  part: { selector: '.erx-button__label', property: 'color' },
  classes: 'label',
  variant: { value: 'outline', defaultValue: 'solid', property: 'border-top-color' },
  hook: { name: '--erx-button-bg', property: 'background-color', token: '--erx-color-primary' },
}
export function buildFoundationFixture(dir) {
  return buildPrimitiveFixture(dir, 'foundation', {
    styles: true,
    head: `<style>${contractStyles(contract)}
      body { background: var(--erx-color-canvas); color: var(--erx-color-text); }
      [data-contract='slot'] { --erx-button-bg: var(--erx-color-canvas); }
      #dispose { color: var(--erx-color-text); background: var(--erx-color-canvas); min-height: 32px; margin-block-start: 8px; }
    </style>`,
  })
}
export async function checkFoundation(browser, base) {
  const page = await browser.newPage({ hasTouch: true })
  try {
    await page.goto(base + '/foundation/')
    await page.locator('main[data-hydrated="true"]').waitFor()
    await checkCustomizationContract(page, contract)
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme })
      await checkAccessibility(page)
    }
    const save = page.locator('#save')
    await save.focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    await page.getByRole('button', { name: 'Add', exact: true }).tap()
    assert.equal(await page.locator('#count').textContent(), '3')
    assert.ok((await save.boundingBox()).height >= 44)
    const blocked = page.getByRole('link', { name: 'Unavailable' })
    await blocked.focus()
    await page.keyboard.press('Enter')
    await blocked.dispatchEvent('click')
    await page.getByRole('button', { name: 'Sending' }).dispatchEvent('click')
    assert.equal(await page.locator('#count').textContent(), '3')
    assert.equal(new URL(page.url()).hash, '')
    const route = page.getByRole('link', { name: 'Account' })
    await route.press('Space')
    assert.equal(new URL(page.url()).hash, '')
    await route.press('Enter')
    assert.equal(new URL(page.url()).hash, '#account')
    assert.equal(await page.locator('#count').textContent(), '4')
    await page.getByRole('link', { name: 'Destination' }).press('Enter')
    assert.equal(new URL(page.url()).hash, '#destination')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    assert.equal(
      await page
        .locator('.erx-spinner')
        .first()
        .evaluate(el => getComputedStyle(el).animationName),
      'none',
    )
    await page.emulateMedia({ forcedColors: 'active' })
    await page.setViewportSize({ width: 320, height: 480 })
    await page.evaluate(() => {
      document.body.style.zoom = '2'
    })
    assert.ok(await save.evaluate(el => el.getBoundingClientRect().right <= innerWidth))
  } finally {
    await page.close()
  }
}
