import assert from 'node:assert/strict'

/**
 * A component's customization contract for the shared harness.
 * @typedef {object} Contract
 * @property {string} root Root selector, such as `.erx-button`.
 * @property {{ property: string, token: string }} themed A root property that follows `--erx-color-primary`, which the contract theme changes.
 * @property {{ property: string }} untouched A root property that follows a token the contract theme omits.
 * @property {{ selector: string, property: string }} part A part that a consumer restyles through its stable class.
 * @property {string} classes The part that receives `classes={{ [classes]: 'contract-part' }}` in the slot scenario.
 * @property {{ value: string, defaultValue: string, property: string }} variant The variant the variant scenario renders, the default, and a property to override.
 * @property {{ name: string, property: string, token: string }} hook A component hook, the property it sets, and the token it falls back to.
 */

const override = { part: 'rgb(1, 2, 3)', variant: 'rgb(4, 5, 6)', hook: 'rgb(7, 8, 9)' }
const contractPrimary = 'rgb(28, 97, 191)'

/**
 * Returns the consumer CSS for the slot, variant and hook scenarios. It uses
 * only public names and zero-specificity selectors, so it wins only because it
 * is unlayered: no `!important` and no specificity contest.
 * @param {Contract} contract
 */
export function contractStyles(contract) {
  return [
    `:where([data-contract='slot'] ${contract.part.selector}) { ${contract.part.property}: ${override.part}; }`,
    ':where(.contract-part) { text-decoration-line: underline; }',
    `:where([data-contract='variant'] ${contract.root}[data-erx-variant='${contract.variant.value}']) { ${contract.variant.property}: ${override.variant}; }`,
    `:where([data-contract='hook']) { ${contract.hook.name}: ${override.hook}; }`,
  ].join('\n')
}

/**
 * Checks a custom theme, a nested theme, a slot override, a variant override
 * and missing-token fallbacks on a page that renders `ContractScenarios`.
 * @param {import('playwright').Page} page
 * @param {Contract} contract
 */
export async function checkCustomizationContract(page, contract) {
  assert.doesNotMatch(contractStyles(contract), /!important|--_erx-/)
  const instance = scenario => page.locator(`[data-contract-instance="${scenario}"]`)
  const element = (scenario, selector = contract.root) =>
    instance(scenario).locator(selector).first()
  const read = (scenario, property, selector) =>
    element(scenario, selector).evaluate(
      (el, name) => getComputedStyle(el).getPropertyValue(name),
      property,
    )
  // The value a token gives a property where the scenario renders.
  const token = (scenario, property, name) =>
    instance(scenario).evaluate(
      (el, [cssProperty, tokenName]) => {
        const sample = document.createElement('div')
        sample.style.setProperty(cssProperty, `var(${tokenName})`)
        el.append(sample)
        const value = getComputedStyle(sample).getPropertyValue(cssProperty)
        sample.remove()
        return value
      },
      [property, name],
    )
  const { themed, untouched, part, variant, hook } = contract

  // Custom theme: the component follows the theme, and omitted tokens keep Iris values.
  const initial = await read('default', themed.property)
  assert.equal(await token('custom', themed.property, themed.token), contractPrimary)
  assert.equal(await read('custom', themed.property), contractPrimary)
  assert.notEqual(initial, contractPrimary)
  assert.equal(await read('custom', untouched.property), await read('default', untouched.property))

  // Nested theme: the dark scope applies inside and stays isolated from its sibling.
  assert.equal(
    await read('nested', themed.property),
    await token('nested', themed.property, themed.token),
  )
  assert.equal(await read('nested', 'color-scheme'), 'dark')
  assert.notEqual(await read('nested', themed.property), initial)
  assert.equal(await read('outer', themed.property), initial)
  assert.equal(await read('outer', 'color-scheme'), 'light')

  // Slot override: unlayered CSS on the stable part class and the classes map both apply.
  assert.equal(await read('slot', part.property, part.selector), override.part)
  const classed = instance('slot').locator('.contract-part')
  assert.equal(await classed.count(), 1)
  assert.ok(
    await classed.evaluate(
      (el, selector) => el.matches(selector),
      `${contract.root}__${contract.classes}`,
    ),
  )
  assert.equal(await classed.evaluate(el => getComputedStyle(el).textDecorationLine), 'underline')

  // Variant override: the attribute reports the resolved variant, and consumer CSS wins.
  assert.equal(await element('default').getAttribute('data-erx-variant'), variant.defaultValue)
  assert.equal(await element('variant').getAttribute('data-erx-variant'), variant.value)
  assert.equal(await read('variant', variant.property), override.variant)

  // Missing hook: the component falls back to its token; a consumer hook replaces it.
  assert.equal(
    await read('fallback', hook.property),
    await token('fallback', hook.property, hook.token),
  )
  assert.equal(await read('hook', hook.property), override.hook)
}
