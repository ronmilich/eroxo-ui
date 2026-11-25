import assert from 'node:assert/strict'
import { checkAccessibility } from './harness.mjs'
import { buildPrimitiveFixture } from './primitive-fixture.mjs'

const storageKey = 'erx-fixture-color-scheme'
const color = {
  irisLightCanvas: 'rgb(250, 250, 252)',
  irisDarkCanvas: 'rgb(11, 14, 21)',
  irisLightPrimary: 'rgb(81, 69, 205)',
  irisDarkPrimary: 'rgb(164, 156, 255)',
  brandLightCanvas: 'rgb(242, 246, 252)',
  brandLightPrimary: 'rgb(28, 97, 191)',
  brandDarkPrimary: 'rgb(143, 184, 255)',
}

export function buildThemeFixture(dir) {
  return buildPrimitiveFixture(dir, 'theme', {
    styles: true,
    head: `<style>
     html { background-color: var(--erx-color-canvas); color: var(--erx-color-text); }
     @layer erx.components {
       .swatch {
         background-color: var(--erx-color-primary);
         color: var(--erx-color-on-primary);
         border-radius: var(--erx-radius-control);
         min-block-size: var(--erx-density-control-default-min-block-size);
       }
       dialog::backdrop { background-color: var(--erx-color-overlay-scrim); }
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

function read(page, selector) {
  return page.locator(selector).evaluate(el => {
    const style = getComputedStyle(el)
    return {
      background: style.backgroundColor,
      radius: style.borderTopLeftRadius,
      minHeight: style.minHeight,
      scheme: style.colorScheme,
    }
  })
}

const documentTheme = page =>
  page.evaluate(() => document.documentElement.getAttribute('data-erx-theme'))

// Block the application module so that only the inline script can theme the page.
async function checkFirstPaint(browser, url, stored, colorScheme, expected) {
  const context = await browser.newContext({ colorScheme })
  try {
    await context.addInitScript(
      ([key, value]) => {
        try {
          if (value) localStorage.setItem(key, value)
        } catch {
          // about:blank has no storage.
        }
      },
      [storageKey, stored],
    )
    const page = await context.newPage()
    await page.route('**/fixture.js', route => route.abort())
    await page.goto(url)
    assert.equal(await documentTheme(page), stored ?? 'system')
    const scope = await read(page, 'main > .erx-theme-scope')
    const outer = await read(page, '#outer')
    assert.equal(scope.scheme, expected)
    assert.equal(
      scope.background,
      color[expected === 'dark' ? 'irisDarkCanvas' : 'irisLightCanvas'],
    )
    assert.equal(
      outer.background,
      color[expected === 'dark' ? 'irisDarkPrimary' : 'irisLightPrimary'],
    )
    assert.equal(await page.locator('main').getAttribute('data-hydrated'), null)
  } finally {
    await context.close()
  }
}

export async function checkTheme(browser, base) {
  const url = base + '/theme/'
  for (const [stored, colorScheme, expected] of [
    ['dark', 'light', 'dark'],
    ['light', 'dark', 'light'],
    [null, 'dark', 'dark'],
  ]) {
    await checkFirstPaint(browser, url, stored, colorScheme, expected)
  }

  const context = await browser.newContext({ colorScheme: 'light' })
  const errors = []
  try {
    await context.addInitScript(key => {
      try {
        if (!sessionStorage.getItem('seeded')) {
          localStorage.setItem(key, 'dark')
          sessionStorage.setItem('seeded', 'true')
        }
      } catch {
        return
      }
      // Record the canvas of the server-rendered scope as the parser inserts it.
      new MutationObserver((_, observer) => {
        const scope = document.querySelector('main > .erx-theme-scope')
        if (!scope) return
        window.firstPaint = getComputedStyle(scope).backgroundColor
        observer.disconnect()
      }).observe(document, { childList: true, subtree: true })
    }, storageKey)
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => {
      if (['warning', 'error'].includes(message.type())) errors.push(message.text())
    })
    const root = page.locator('main > .erx-theme-scope')
    const status = page.locator('#status')
    const scheme = name => page.getByRole('button', { name, exact: true }).click()

    await page.goto(url)
    await page.locator('main[data-hydrated="true"]').waitFor()
    assert.equal(await page.evaluate(() => window.firstPaint), color.irisDarkCanvas)
    await status.filter({ hasText: 'iris dark dark' }).waitFor()
    assert.equal(await root.getAttribute('data-erx-theme'), 'dark')
    assert.equal(await documentTheme(page), 'dark')
    assert.equal((await read(page, 'main > .erx-theme-scope')).background, color.irisDarkCanvas)
    await checkAccessibility(page)

    const draft = page.getByRole('textbox', { name: 'Draft' })
    await draft.fill('Keep this draft')
    const input = await draft.elementHandle()

    await scheme('light')
    await status.filter({ hasText: 'iris light light' }).waitFor()
    assert.equal(await documentTheme(page), 'light')
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), 'light')
    assert.deepEqual(await read(page, '#outer'), {
      background: color.irisLightPrimary,
      radius: '10px',
      minHeight: '40px',
      scheme: 'light',
    })
    assert.deepEqual(await read(page, '#nested'), {
      background: color.irisDarkPrimary,
      radius: '10px',
      minHeight: '32px',
      scheme: 'dark',
    })
    await checkAccessibility(page)

    await page.getByRole('button', { name: 'Custom theme' }).click()
    await status.filter({ hasText: 'fixture-brand light light' }).waitFor()
    const nestedScope = page.locator('#nested').locator('xpath=..')
    assert.equal(await root.getAttribute('data-erx-theme'), 'fixture-brand light')
    assert.equal(await nestedScope.getAttribute('data-erx-theme'), 'fixture-brand dark')
    assert.equal(await nestedScope.getAttribute('data-erx-density'), 'compact')
    assert.equal(await documentTheme(page), 'fixture-brand light')
    assert.equal((await read(page, 'main > .erx-theme-scope')).background, color.brandLightCanvas)
    assert.equal((await read(page, '#outer')).background, color.brandLightPrimary)
    assert.equal((await read(page, '#outer')).radius, '4px')
    assert.deepEqual(await read(page, '#nested'), {
      background: color.brandDarkPrimary,
      radius: '4px',
      minHeight: '32px',
      scheme: 'dark',
    })

    await scheme('dark')
    await status.filter({ hasText: 'fixture-brand dark dark' }).waitFor()
    // The theme omits a dark canvas, so the Iris dark canvas applies.
    assert.equal((await read(page, 'main > .erx-theme-scope')).background, color.irisDarkCanvas)
    assert.equal((await read(page, '#outer')).background, color.brandDarkPrimary)
    await checkAccessibility(page)

    await scheme('system')
    await status.filter({ hasText: 'fixture-brand system light' }).waitFor()
    assert.equal(await documentTheme(page), 'fixture-brand system')
    assert.equal((await read(page, '#outer')).background, color.brandLightPrimary)
    await page.emulateMedia({ colorScheme: 'dark' })
    await status.filter({ hasText: 'fixture-brand system dark' }).waitFor()
    assert.equal((await read(page, '#outer')).background, color.brandDarkPrimary)
    await page.emulateMedia({ colorScheme: 'light' })
    await status.filter({ hasText: 'fixture-brand system light' }).waitFor()

    assert.equal(await draft.inputValue(), 'Keep this draft')
    assert.ok(await draft.evaluate((el, original) => el === original, input))
    await input.dispose()

    await page.getByRole('button', { name: 'Open dialog' }).click()
    const dialog = page.getByRole('dialog', { name: 'Themed dialog' })
    await dialog.waitFor()
    assert.ok(await dialog.evaluate(el => el.matches(':modal')))
    assert.equal((await read(page, '#dialog-swatch')).background, color.brandDarkPrimary)
    const scrims = await dialog.evaluate(el => {
      const probe = parent => {
        const sample = document.createElement('div')
        sample.style.backgroundColor = 'var(--erx-color-overlay-scrim)'
        parent.append(sample)
        const value = getComputedStyle(sample).backgroundColor
        sample.remove()
        return value
      }
      return {
        backdrop: getComputedStyle(el, '::backdrop').backgroundColor,
        nested: probe(el.parentElement),
        root: probe(document.querySelector('main > .erx-theme-scope')),
      }
    })
    assert.equal(scrims.backdrop, scrims.nested)
    assert.notEqual(scrims.nested, scrims.root)
    await page.getByRole('button', { name: 'Close dialog' }).click()
    await dialog.waitFor({ state: 'hidden' })

    await page.getByRole('button', { name: 'Open portal' }).click()
    const portaled = page.locator('#portaled')
    await portaled.waitFor()
    assert.equal(await page.locator('main #portaled').count(), 0)
    assert.equal(
      await page.locator('#portal-scope').getAttribute('data-erx-theme'),
      'fixture-brand dark',
    )
    assert.equal(await page.locator('#portal-scope').getAttribute('data-erx-density'), 'compact')
    assert.deepEqual(await read(page, '#portaled'), {
      background: color.brandDarkPrimary,
      radius: '4px',
      minHeight: '32px',
      scheme: 'dark',
    })
    // Portal content without a scope inherits <html>, which follows the outermost scope.
    assert.equal((await read(page, '#portal-plain')).background, color.brandLightPrimary)

    await page.getByRole('button', { name: 'Dispose' }).click()
    await root.waitFor({ state: 'detached' })
    await portaled.waitFor({ state: 'detached' })
    assert.equal(await documentTheme(page), 'dark')

    await page.reload()
    await page.locator('main[data-hydrated="true"]').waitFor()
    assert.equal(await page.evaluate(() => window.firstPaint), color.irisLightCanvas)
    await status.filter({ hasText: 'iris system light' }).waitFor()
    assert.equal(await documentTheme(page), 'system')
    assert.deepEqual(errors, [])
  } finally {
    await context.close()
  }
}
