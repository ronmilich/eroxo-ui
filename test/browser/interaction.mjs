import assert from 'node:assert/strict'
import { runKeyboardTable } from './harness.mjs'

async function checkIme(page, text) {
  const input = page.getByRole('textbox', { name: 'Compose' })
  await input.focus()
  const before = await page.locator('#committed').textContent()
  const filtered = await page.locator('#filtered').textContent()
  await input.evaluate((el, value) => {
    el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    el.value = value
    el.dispatchEvent(new CompositionEvent('compositionupdate', { bubbles: true, data: value }))
    el.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: value,
        isComposing: true,
      }),
    )
  }, text)
  for (const key of ['ArrowLeft', 'Enter', 'Escape']) await input.press(key)
  assert.equal(await page.locator('#filtered').textContent(), filtered)
  assert.equal(await page.locator('#committed').textContent(), before)
  await input.evaluate(async el => {
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: el.value }))
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    el.dispatchEvent(
      new InputEvent('input', { bubbles: true, inputType: 'insertText', data: el.value }),
    )
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  assert.equal(await input.inputValue(), text)
  assert.equal(await page.locator('#committed').textContent(), before)
  assert.equal(await page.locator('#filtered').textContent(), text)
  await input.press('Enter')
  assert.equal(await page.locator('#committed').textContent(), text)
}

export async function checkInteraction(browser, base) {
  const page = await browser.newPage({ hasTouch: true })
  const url = base + '/interaction/'
  const action = page.getByRole('button', { name: 'Activate', exact: true })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await runKeyboardTable(
      page,
      url,
      ['Space', 'Enter'].map(key => ({
        name: 'Custom button activates once',
        keys: [key],
        async arrange() {
          await page.locator('main[data-hydrated]').waitFor()
          await action.focus()
        },
        async verify() {
          assert.equal(await page.locator('#presses').textContent(), '1')
          assert.equal(await page.locator('#modality').textContent(), 'keyboard')
          assert.equal(await action.evaluate(el => getComputedStyle(el).outlineWidth), '2px')
        },
      })),
    )
    await action.tap()
    assert.equal(await page.locator('#presses').textContent(), '2')
    assert.equal(await page.locator('#modality').textContent(), 'touch')
    assert.equal(await page.locator('#hover').textContent(), 'false')
    await page.mouse.move(0, 0)
    await action.hover()
    const hoverCapable = await page.evaluate(() => matchMedia('(any-hover: hover)').matches)
    assert.equal(await page.locator('#hover').textContent(), String(hoverCapable))
    await action.click()
    assert.equal(await page.locator('#presses').textContent(), '3')
    assert.equal(await page.locator('#modality').textContent(), 'pointer')
    await action.evaluate(el =>
      el.addEventListener(
        'pointerdown',
        event => {
          el.dataset.pointer = String(event.pointerId)
        },
        { once: true },
      ),
    )
    await page.mouse.down()
    assert.ok(await action.evaluate(el => el.hasPointerCapture(Number(el.dataset.pointer))))
    await page.locator('#holds').filter({ hasText: '1' }).waitFor()
    await page.mouse.up()
    assert.equal(await page.locator('#presses').textContent(), '3')
    await page.mouse.down()
    await page.mouse.move(0, 0)
    await page.mouse.up()
    assert.equal(await page.locator('#presses').textContent(), '3')
    const navigate = page.getByRole('button', { name: 'Navigate' })
    await navigate.press('ArrowLeft')
    await navigate.press('Control+ArrowRight')
    assert.equal(await page.locator('#steps').textContent(), '1')
    await navigate.press('ArrowRight')
    assert.equal(await page.locator('#steps').textContent(), '0')
    for (const text of ['中文', '한글']) await checkIme(page, text)
    assert.equal(await page.locator('#steps').textContent(), '0')
    await page.getByRole('button', { name: 'Move next' }).click()
    const open = page.getByRole('button', { name: 'Open portal' })
    assert.ok(await open.evaluate(el => el === document.activeElement))
    await open.evaluate(el => {
      const container = document.createElement('div')
      container.innerHTML =
        '<fieldset disabled><legend><button>Legend exception</button></legend><button>Excluded field</button></fieldset>' +
        '<details><summary>Summary stop</summary><button>Excluded disclosure</button></details>' +
        '<button tabindex="-1">Excluded negative</button><button style="visibility:hidden">Excluded visibility</button>'
      el.parentNode.append(container)
      const host = document.createElement('span')
      container.append(host)
      host.innerHTML =
        '<button slot="test">Assigned stop</button><button>Excluded unslotted</button>'
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<slot name="test"></slot><button>Shadow stop</button>'
    })
    await open.press('Enter')
    const tabs = await page.locator('#tabs').textContent()
    assert.doesNotMatch(tabs, /Hidden|Inert|Disabled|Excluded/)
    for (const included of [
      'Legend exception',
      'Summary stop',
      'Assigned stop',
      'Shadow stop',
      'Navigate',
    ])
      assert.ok(tabs.includes(included))
    await page.getByRole('button', { name: 'Portal action' }).click()
    assert.equal(await page.locator('#inside').textContent(), 'true')
    await page.getByRole('button', { name: 'Dispose' }).click()
    await action.waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}
