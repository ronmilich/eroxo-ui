import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { preview } from 'vite'
import { checkAccessibility } from '../test/browser/harness.mjs'

const docs = new URL('../dev/', import.meta.url)
const base = '/eroxo-ui/'
const server = await preview({
  root: fileURLToPath(docs),
  configFile: false,
  base,
  preview: { host: '127.0.0.1', port: 0 },
})
const url = new URL(base, 'http://127.0.0.1:' + server.httpServer.address().port)
const componentUrl = new URL('components/hello/', url).href

try {
  const browser = await chromium.launch()
  try {
    const staticPage = await browser.newPage({ javaScriptEnabled: false })
    await staticPage.goto(componentUrl)
    assert.equal(await staticPage.getByRole('heading', { level: 1 }).textContent(), 'Hello')
    const row = staticPage.getByRole('row').filter({ hasText: 'The name to greet.' })
    assert.match(await row.textContent(), /to.*"World"/s)
    await staticPage.close()

    const page = await browser.newPage({ viewport: { width: 375, height: 850 } })
    page.setDefaultTimeout(8000)
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(url.href)
    await page.getByRole('searchbox').fill('styling hooks')
    await page.locator('#results').getByRole('link', { name: 'Hello', exact: true }).click()
    const greeting = page.locator('.erx-hello')
    assert.equal(await greeting.textContent(), 'Hello Iris!')
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Solid')
    await page.getByText('Hello Solid!', { exact: true }).waitFor()
    const theme = page.getByLabel('Theme', { exact: true })
    await theme.selectOption('dark')
    assert.equal(await greeting.evaluate(el => getComputedStyle(el).color), 'rgb(245, 247, 252)')
    await checkAccessibility(page)
    await theme.selectOption('custom')
    await page.getByLabel('Greeting color', { exact: true }).fill('#225577')
    assert.equal(await greeting.evaluate(el => getComputedStyle(el).color), 'rgb(34, 85, 119)')
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    assert.deepEqual(errors, [])
    await page.getByRole('link', { name: 'Iris tokens', exact: true }).click()
    await page.getByRole('heading', { name: 'Contrast checks' }).waitFor()
    assert.match(await page.locator('article').innerText(), /--erx-color-primary/)
  } finally {
    await browser.close()
  }

  for (const name of [
    'index.md',
    'tokens.md',
    'components/hello.md',
    'components/hello.json',
    'examples/hello.tsx',
    'llms.txt',
    'llms-full.txt',
  ]) {
    const response = await fetch(new URL(name, url))
    assert.ok(response.ok, `Missing published docs output ${name}`)
    const artifact = await response.text()
    assert.equal(
      artifact,
      await readFile(new URL(`dist/docs/${name}`, new URL('../', docs)), 'utf8'),
    )
  }
  const metadata = await (await fetch(new URL('components/hello.json', url))).json()
  assert.equal(metadata.component, 'Hello')
  assert.equal(metadata.props.find(prop => prop.name === 'to')?.default, '"World"')
  assert.equal(
    await (await fetch(new URL(metadata.examples[0].source, url))).text(),
    await readFile(new URL('examples/hello.tsx', docs), 'utf8'),
  )
  console.log(
    'Docs HTML, search, live example, themes, accessibility and generated reference passed.',
  )
} finally {
  await server.close()
}
