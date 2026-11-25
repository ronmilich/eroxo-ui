import assert from 'node:assert/strict'

const color = {
  canvas: 'rgb(250, 250, 252)',
  surface: 'rgb(255, 255, 255)',
  darkSurface: 'rgb(20, 25, 37)',
  brandSurface: 'rgb(242, 246, 252)',
}

// Checks the documented layer order and the bridge's theme-aware utilities.
export async function checkTailwind(browser, url) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) errors.push(message.text())
  })
  const style = (selector, property) =>
    page
      .locator(selector)
      .evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property)
  // The value a token gives a property inside an element's scope.
  const token = (selector, property, name) =>
    page.locator(selector).evaluate(
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
  try {
    await page.goto(url)
    await page.locator('#stock').waitFor()
    assert.equal(await style('#stock', 'display'), 'flex')

    // base < erx < utilities < unlayered application CSS, whatever the specificity.
    assert.equal(await style('#component', 'background-color'), color.canvas)
    assert.equal(await style('#utility', 'background-color'), color.surface)
    assert.equal(await style('#application', 'background-color'), 'rgb(3, 4, 5)')

    // Utilities follow the Eroxo scope they render in.
    assert.equal(await style('#light', 'background-color'), color.surface)
    assert.equal(await style('#light', 'border-top-left-radius'), '10px')
    assert.equal(await style('#light', 'padding-top'), '20px')
    // Tailwind stacks shadows after its transparent ring and inset layers.
    const shadow = await token('#light', 'box-shadow', '--erx-elevation-popover')
    assert.ok((await style('#light', 'box-shadow')).endsWith(shadow), shadow)
    assert.equal(
      await style('#light', 'font-family'),
      await token('#light', 'font-family', '--erx-font-mono'),
    )
    assert.equal(await style('#dark', 'background-color'), color.darkSurface)
    assert.equal(await style('#dark', 'color'), await token('#dark', 'color', '--erx-color-text'))
    assert.equal(await style('#brand', 'background-color'), color.brandSurface)
    assert.equal(await style('#brand', 'border-top-left-radius'), '4px')
    assert.equal(await style('#compact', 'padding-top'), '16px')

    // The generated utility reads the Eroxo variable directly (@theme inline).
    const declaration = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        const search = rules => {
          for (const rule of rules) {
            if (rule.selectorText === '.bg-erx-surface') return rule.style.backgroundColor
            const nested = rule.cssRules && search(rule.cssRules)
            if (nested) return nested
          }
          return undefined
        }
        const found = search(sheet.cssRules)
        if (found) return found
      }
      return undefined
    })
    assert.equal(declaration, 'var(--erx-color-surface)')
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}
