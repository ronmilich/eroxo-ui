import assert from 'node:assert/strict'
import { runKeyboardTable } from './harness.mjs'
import { buildPrimitiveFixture } from './primitive-fixture.mjs'

export function buildCoreUtilitiesFixture(dir) {
  return buildPrimitiveFixture(dir, 'core-utilities', {
    verifyChunk(code) {
      assert.doesNotMatch(code, /\[eroxo-ui\]|changed from (?:controlled|uncontrolled)/)
    },
  })
}

export async function checkCoreUtilities(browser, base) {
  const url = base + '/core-utilities/'
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) errors.push(message.text())
  })
  const activate = label => page.getByRole('button', { name: `Activate ${label}` })
  const result = label => page.getByRole('region', { name: label }).locator('output[id]')
  async function verify(label, expected) {
    await result(label).filter({ hasText: expected }).waitFor()
    assert.equal(await result(label).textContent(), expected)
    const id = await result(label).getAttribute('id')
    assert.match(id, /^erx-/)
    assert.equal(await activate(label).getAttribute('aria-describedby'), id)
    assert.equal(await page.getByLabel(`${label} details`).textContent(), `${id} refs matched`)
    return id
  }
  try {
    await runKeyboardTable(
      page,
      url,
      ['Enter', 'Space'].map(key => ({
        name: 'The native button activates and keeps focus',
        keys: [key],
        async arrange() {
          await page.locator('main[data-hydrated=true]').waitFor()
          await activate('Inline').focus()
        },
        async verify() {
          await verify('Inline', 'On 1')
          assert.ok(
            await activate('Inline').evaluate(element => element === document.activeElement),
          )
        },
      })),
    )
    const inlineId = await verify('Inline', 'On 1')
    assert.equal(await activate('Inline').getAttribute('kind'), null)
    assert.equal(await activate('Inline').getAttribute('type'), 'button')
    await page.getByRole('button', { name: 'Veto Inline' }).click()
    await activate('Inline').click()
    await verify('Inline', 'On 1')
    await page.getByRole('button', { name: 'Control Inline' }).click()
    await verify('Inline', 'Off 1')

    const link = page.getByRole('link', { name: 'Follow link' })
    assert.equal(await link.getAttribute('type'), null)
    await link.press('Enter')
    await page.waitForURL('**/#target')

    await page.getByRole('button', { name: 'Show portal' }).click()
    await activate('Portal').click()
    const portalId = await verify('Portal', 'On 1')
    assert.notEqual(portalId, inlineId)
    assert.equal(await page.locator('main').getByRole('region', { name: 'Portal' }).count(), 0)
    await page.getByRole('button', { name: 'Dispose' }).click()
    await activate('Portal').waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}
