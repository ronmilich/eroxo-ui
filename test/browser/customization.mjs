import assert from 'node:assert/strict'
import { checkCustomizationContract, contractStyles } from './customization/contract.mjs'
import { buildPrimitiveFixture } from './primitive-fixture.mjs'

/** @type {import('./customization/contract.mjs').Contract} */
const probeContract = {
  root: '.erx-probe',
  themed: { property: 'background-color', token: '--erx-color-primary' },
  untouched: { property: 'color' },
  part: { selector: '.erx-probe__label', property: 'color' },
  classes: 'label',
  variant: { value: 'outline', defaultValue: 'solid', property: 'border-top-color' },
  hook: { name: '--erx-probe-bg', property: 'background-color', token: '--erx-color-primary' },
}

// The probe's documented styling surface: part classes, state attributes and hooks.
const documented = {
  classes: ['erx-probe', 'erx-probe__icon', 'erx-probe__label'],
  attributes: ['data-erx-variant', 'data-erx-tone', 'data-erx-size', 'data-erx-disabled'],
  hooks: ['--erx-probe-bg', '--erx-probe-fg', '--erx-probe-radius'],
}

// A consumer restyles the root, both parts, a state, a tone, a size and a hook.
const restyle = `
[data-contract='restyle'] .restyled { --erx-probe-radius: 2px; padding-inline: 20px; }
[data-contract='restyle'] .erx-probe__icon { color: rgb(10, 20, 30); }
[data-contract='restyle'] .erx-probe__label { letter-spacing: 1px; }
[data-contract='restyle'] .erx-probe[data-erx-size='lg'] { outline: 3px solid rgb(40, 50, 60); }
[data-contract='restyle'] .erx-probe[data-erx-disabled] { opacity: 0.5; }
[data-contract='restyle'] .erx-probe[data-erx-tone='danger'] { --erx-probe-fg: rgb(250, 250, 250); }
`

export function buildCustomizationFixture(dir) {
  return buildPrimitiveFixture(dir, 'customization', {
    styles: true,
    css: true,
    head: `<style>${contractStyles(probeContract)}\n${restyle}</style>`,
  })
}

function checkPublicNames(css) {
  assert.doesNotMatch(css, /!important|--_erx-/)
  for (const [, name] of css.matchAll(/\.([a-z][\w-]*)/g)) {
    assert.ok(!name.startsWith('erx-') || documented.classes.includes(name), name)
  }
  for (const [, name] of css.matchAll(/\[([\w-]+)/g)) {
    assert.ok(name === 'data-contract' || documented.attributes.includes(name), name)
  }
  for (const [name] of css.matchAll(/--erx-[a-z0-9-]+/g)) {
    assert.ok(documented.hooks.includes(name), name)
  }
}

export async function checkCustomization(browser, base) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) errors.push(message.text())
  })
  try {
    await page.goto(base + '/customization/')
    await page.locator('main[data-hydrated="true"]').waitFor()
    await checkCustomizationContract(page, probeContract)

    checkPublicNames(restyle)
    const style = (selector, property) =>
      page
        .locator(selector)
        .evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
    assert.equal(await style('#restyled', 'border-top-left-radius'), '2px')
    assert.equal(await style('#restyled', 'padding-inline-start'), '20px')
    assert.equal(await style('#restyled', 'min-height'), '48px')
    assert.equal(await style('#restyled', 'outline-width'), '3px')
    assert.equal(await style('#restyled .erx-probe__icon', 'color'), 'rgb(10, 20, 30)')
    assert.equal(await style('#restyled .erx-probe__label', 'letter-spacing'), '1px')
    assert.equal(await style('#disabled', 'opacity'), '0.5')
    assert.equal(await style('#disabled', 'color'), 'rgb(250, 250, 250)')
    assert.equal(await page.locator('#disabled').getAttribute('data-erx-tone'), 'danger')
    assert.equal(await page.locator('#disabled').getAttribute('data-erx-disabled'), '')
    assert.equal(await page.locator('#restyled').getAttribute('data-erx-size'), 'lg')
    assert.equal(
      await page
        .locator('[data-contract-instance="default"] .erx-probe')
        .getAttribute('data-erx-size'),
      null,
    )

    await page.getByRole('button', { name: 'Dispose' }).click()
    await page.locator('.erx-probe').first().waitFor({ state: 'detached' })
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}
