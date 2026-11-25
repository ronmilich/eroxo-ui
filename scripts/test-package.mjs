import assert from 'node:assert/strict'
import { execFileSync, execSync } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'
import solid from '@solidjs/vite-plugin'
import { JSDOM } from 'jsdom'
import { chromium, firefox, webkit } from 'playwright'
import { checkAccessibility, checkGreeting } from '../test/browser/harness.mjs'
import { checkInputPatterns } from '../test/browser/conformance.mjs'
import { buildCoreUtilitiesFixture, checkCoreUtilities } from '../test/browser/core-utilities.mjs'
import { buildPrimitiveFixture } from '../test/browser/primitive-fixture.mjs'
import { checkInteraction } from '../test/browser/interaction.mjs'
import { buildThemeFixture, checkTheme } from '../test/browser/theme.mjs'
import {
  buildAccessibilityUtilitiesFixture,
  checkAccessibilityUtilities,
} from '../test/browser/accessibility-utilities.mjs'
import { build, createBuilder, preview } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const artifacts = path.join(root, 'artifacts')
const sizeRoot = path.join(root, 'fixtures/size')
const sizes = []
const tier = process.env.SOLID_PEER_TIER ?? 'minimum'
assert.ok(['minimum', 'latest'].includes(tier), 'Unknown SOLID_PEER_TIER: ' + tier)
const { peerDependencies } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
// Use one spelling of the temporary root for Vite's HTML entries on Windows.
const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'eroxo-packed-')))
const tool = (file, args, cwd = root) =>
  execFileSync(process.execPath, [path.join(root, file), ...args], { cwd, stdio: 'inherit' })

function pack(cwd) {
  const output = execSync('npm pack --json --ignore-scripts', {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, npm_config_pack_destination: artifacts },
  })
  const [packed] = Object.values(JSON.parse(output))
  return { ...packed, path: path.join(artifacts, packed.filename) }
}

async function installFixture(
  name,
  tarball,
  packageName,
  source = path.join(root, 'fixtures', name),
) {
  const dir = path.join(temp, name)
  await cp(source, dir, {
    recursive: true,
    filter: file => !['dist', 'node_modules'].includes(path.basename(file)),
  })
  await cp(tarball, path.join(dir, 'library.tgz'))
  const file = path.join(dir, 'package.json')
  const manifest = JSON.parse(await readFile(file, 'utf8'))
  manifest.dependencies = { ...manifest.dependencies, [packageName]: 'file:library.tgz' }
  for (const [peer, range] of Object.entries(peerDependencies)) {
    assert.equal('^' + manifest.dependencies[peer], range, 'Fixture minimum drifted for ' + peer)
    if (tier === 'latest') manifest.dependencies[peer] = range
  }
  await writeFile(file, JSON.stringify(manifest))
  execSync(
    'npm install --ignore-scripts --no-audit --no-fund --package-lock=false --strict-peer-deps',
    { cwd: dir, stdio: 'inherit' },
  )
  const consumer = createRequire(file)
  const installed = path.join(dir, 'node_modules', packageName)
  assert.equal(
    await realpath(installed),
    (await realpath(dir)) + path.sep + path.join('node_modules', packageName),
  )
  const library = createRequire(path.join(installed, 'package.json'))
  for (const peer of ['solid-js', '@solidjs/web']) {
    const { version } = JSON.parse(
      await readFile(path.join(dir, 'node_modules', peer, 'package.json'), 'utf8'),
    )
    console.log(`${name} (${tier}): ${peer}@${version}`)
    assert.equal(
      await realpath(consumer.resolve(peer)),
      await realpath(library.resolve(peer)),
      peer,
    )
  }
  return dir
}

function inspectOutput(label, result) {
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(build => build.output)
  const modules = outputs
    .filter(file => file.type === 'chunk')
    .flatMap(file => Object.keys(file.modules))
    .map(id => id.replaceAll('\\', '/'))
  const css = outputs
    .filter(file => file.fileName.endsWith('.css'))
    .map(file => String(file.source))
    .join('\n')
  for (const ext of ['js', 'css']) {
    const files = outputs.filter(file => file.fileName.endsWith('.' + ext))
    const buffers = files.map(file => Buffer.from(file.type === 'chunk' ? file.code : file.source))
    sizes.push([
      label,
      ext,
      buffers.reduce((n, b) => n + b.length, 0),
      buffers.reduce((n, b) => n + gzipSync(b).length, 0),
    ])
  }
  return { css, modules }
}

async function checkThemeScopes(page) {
  const observed = await page.evaluate(() => {
    const root = document.documentElement
    const scope = document.createElement('section')
    scope.innerHTML = [
      '<div data-erx-density="compact">',
      '  <div data-erx-theme="light" id="packed-light"></div>',
      '</div>',
      '<div data-erx-theme="dark">',
      '  <div data-erx-density="comfortable" data-erx-theme="custom" id="packed-custom"',
      '    style="--erx-color-shadow: rgb(41, 50, 61); --erx-color-primary: #184b91"></div>',
      '</div>',
    ].join('')
    scope.style.setProperty('--erx-radius-control', '27px')
    scope.style.setProperty('--erx-type-body-size', '1.125rem')
    document.body.append(scope)
    const light = scope.querySelector('#packed-light')
    const custom = scope.querySelector('#packed-custom')
    for (const sample of [light, custom]) {
      Object.assign(sample.style, {
        color: 'var(--erx-color-text)',
        backgroundColor: 'var(--erx-color-primary)',
        minHeight: 'var(--erx-density-control-default-min-block-size)',
        borderRadius: 'var(--erx-radius-control)',
        fontSize: 'var(--erx-type-body-size)',
        boxShadow: 'var(--erx-elevation-card-raised)',
      })
    }
    function read(el) {
      const style = getComputedStyle(el)
      return [
        style.colorScheme,
        style.color,
        style.backgroundColor,
        style.minHeight,
        style.borderRadius,
        style.fontSize,
        style.boxShadow,
      ]
    }
    try {
      const implicit = getComputedStyle(root).colorScheme
      root.setAttribute('data-erx-theme', 'light')
      root.setAttribute('data-erx-density', 'compact')
      const explicitLight = getComputedStyle(root).colorScheme
      const rootDensity = getComputedStyle(root)
        .getPropertyValue('--erx-density-control-default-min-block-size')
        .trim()
      root.setAttribute('data-erx-theme', 'dark')
      const explicitDark = getComputedStyle(root).colorScheme
      return {
        implicit,
        explicitLight,
        explicitDark,
        rootDensity,
        light: read(light),
        custom: read(custom),
      }
    } finally {
      root.removeAttribute('data-erx-theme')
      root.removeAttribute('data-erx-density')
      scope.remove()
    }
  })
  assert.equal(observed.implicit, 'dark')
  assert.equal(observed.explicitLight, 'light')
  assert.equal(observed.explicitDark, 'dark')
  assert.equal(observed.rootDensity, '2rem')
  assert.deepEqual(observed.light.slice(0, 6), [
    'light',
    'rgb(22, 25, 37)',
    'rgb(81, 69, 205)',
    '32px',
    '27px',
    '18px',
  ])
  assert.deepEqual(observed.custom.slice(0, 6), [
    'dark',
    'rgb(245, 247, 252)',
    'rgb(24, 75, 145)',
    '48px',
    '27px',
    '18px',
  ])
  assert.match(observed.custom[6], /rgb\(41, 50, 61\)/)
}

async function checkPage(browser, url, name) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (['warning', 'error'].includes(message.type())) errors.push(message.text())
  })
  try {
    if (name !== 'spa') {
      for (const [colorScheme, color] of [
        ['light', 'rgb(22, 25, 37)'],
        ['dark', 'rgb(245, 247, 252)'],
      ]) {
        const firstPaint = await browser.newPage({ javaScriptEnabled: false, colorScheme })
        try {
          const response = await firstPaint.goto(url)
          assert.ok(response?.ok(), 'Expected a successful server response')
          await checkGreeting(firstPaint, 'Hello fixture!')
          assert.equal(
            await firstPaint.locator('.erx-hello').evaluate(el => getComputedStyle(el).color),
            color,
          )
        } finally {
          await firstPaint.close()
        }
      }
    }
    if (name === 'start') {
      await page.addInitScript(() => {
        // The streamed markup is parsed before the generated module entry hydrates it.
        const observer = new MutationObserver(() => {
          const greeting = document.querySelector('.erx-hello')
          if (!greeting) return
          window.serverGreeting = greeting
          observer.disconnect()
        })
        observer.observe(document, { childList: true, subtree: true })
      })
    }
    await page.goto(url)
    await page
      .locator(name === 'ssr' ? 'main[data-hydrated="true"] .erx-hello' : '.erx-hello')
      .waitFor()
    assert.equal(
      await page.locator('.erx-hello').evaluate(el => getComputedStyle(el).color),
      'rgb(22, 25, 37)',
    )
    await checkGreeting(page, 'Hello fixture!')
    await checkAccessibility(page)
    await page.getByRole('button', { name: 'Update' }).click()
    await page.getByText('Hello updated!', { exact: true }).waitFor()
    if (name === 'start') {
      assert.ok(
        await page.locator('.erx-hello').evaluate(el => el === window.serverGreeting),
        'Start mode replaced the server-rendered greeting',
      )
    }
    await page
      .locator('main')
      .evaluate(el => el.style.setProperty('--erx-hello-color', 'rgb(30, 60, 90)'))
    assert.equal(
      await page.locator('.erx-hello').evaluate(el => getComputedStyle(el).color),
      'rgb(30, 60, 90)',
    )
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 640, height: 480 })
    await page.addStyleTag({
      content: `
     @media (prefers-color-scheme: dark) {
       :root { background: var(--erx-color-canvas); color: var(--erx-color-text); }
       button { appearance: none; background: white; color: #161925; border: 1px solid white; }
     }
     html { zoom: 2; }
   `,
    })
    await page.locator('main').evaluate(el => el.style.removeProperty('--erx-hello-color'))
    assert.equal(
      await page.locator('.erx-hello').evaluate(el => getComputedStyle(el).color),
      'rgb(245, 247, 252)',
    )
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    await checkAccessibility(page)
    if (name === 'spa') await checkThemeScopes(page)
    assert.deepEqual(errors, [])
  } finally {
    await page.close()
  }
}

async function checkInBrowsers(name, config) {
  const server = await preview({
    ...config,
    preview: { host: '127.0.0.1', port: 0 },
  })
  const url = 'http://127.0.0.1:' + server.httpServer.address().port
  try {
    for (const engine of [chromium, firefox, webkit]) {
      const browser = await engine.launch()
      try {
        console.log(`Checking ${name} in ${engine.name()} ${browser.version()}`)
        await checkPage(browser, url, name)
        if (name === 'spa') {
          await checkInputPatterns(browser, url)
          await checkCoreUtilities(browser, url)
          await checkAccessibilityUtilities(browser, url)
          await checkInteraction(browser, url)
          await checkTheme(browser, url)
        }
      } finally {
        await browser.close()
      }
    }
  } finally {
    await server.close()
  }
}

async function checkDomRunner(dir) {
  const result = await build({
    root: dir,
    configFile: false,
    resolve: { conditions: ['browser', 'production'] },
    build: {
      write: false,
      lib: { entry: path.join(dir, 'dom-runner.ts'), name: 'fixture', formats: ['iife'] },
    },
  })
  const [chunk] = (Array.isArray(result) ? result[0] : result).output.filter(
    file => file.type === 'chunk',
  )
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only' })
  try {
    dom.window.eval(chunk.code)
    assert.equal(dom.window.document.body.textContent, 'Hello updated!')
  } finally {
    dom.window.close()
  }
}

async function consumers(tarball) {
  for (const name of ['spa', 'ssr']) {
    const ssr = name === 'ssr'
    const dir = await installFixture(name, tarball, 'eroxo-ui')
    tool('node_modules/typescript/bin/tsc', ['-p', dir])
    const result = await build({ root: dir, configFile: false, plugins: ssr ? [] : [solid()] })
    const { css, modules } = inspectOutput(name, result)
    assert.ok(
      modules.some(id => id.endsWith('/eroxo-ui/dist/hello.' + (ssr ? 'js' : 'jsx'))),
      modules.join('\n'),
    )
    for (const peer of ['solid-js', '@solidjs/web']) {
      const marker = '/node_modules/' + peer + '/'
      const roots = new Set(
        modules.filter(id => id.includes(marker)).map(id => id.slice(0, id.lastIndexOf(marker))),
      )
      assert.equal(roots.size, 1, 'Expected one bundled copy of ' + peer + ': ' + [...roots])
    }
    assert.equal(css.match(/--erx-neutral-25\s*:/g)?.length, 1)
    if (ssr) {
      await checkDomRunner(dir)
      const { html, hydrationScript } = await import(
        pathToFileURL(path.join(dir, 'server.mjs')).href
      )
      const index = path.join(dir, 'dist/index.html')
      const template = await readFile(index, 'utf8')
      await writeFile(
        index,
        template
          .replace('<!--server-content-->', () => html)
          .replace('<!--hydration-script-->', () => hydrationScript),
      )
    } else {
      await build({
        root: dir,
        configFile: false,
        base: './',
        plugins: [solid()],
        build: {
          outDir: 'dist/conformance',
          rolldownOptions: { input: path.join(dir, 'conformance.html') },
        },
      })
      await buildCoreUtilitiesFixture(dir)
      await buildAccessibilityUtilitiesFixture(dir)
      await buildPrimitiveFixture(dir, 'interaction', { styles: true })
      await buildThemeFixture(dir)
    }
    await checkInBrowsers(name, { root: dir, configFile: false })
  }

  const start = await installFixture('start', tarball, 'eroxo-ui')
  tool('node_modules/typescript/bin/tsc', ['-p', start])
  const config = { root: start, configFile: false }
  const builder = await createBuilder({ ...config, plugins: [solid({ start: true, ssr: true })] })
  await builder.buildApp()
  await checkInBrowsers('start', { ...config, plugins: [solid({ start: true, ssr: true })] })
}

async function benchmark() {
  tool('node_modules/vite/bin/vite.js', ['build', '--mode', 'size-probe'])
  tool('scripts/build-styles.mjs', [sizeRoot])
  const packed = pack(sizeRoot)
  const dir = await installFixture(
    'size',
    packed.path,
    'eroxo-size-probe',
    path.join(sizeRoot, 'consumer'),
  )
  for (const entry of ['light', 'heavy']) {
    const result = await build({
      root: dir,
      configFile: false,
      build: {
        write: false,
        rolldownOptions: {
          input: path.join(dir, entry + '.ts'),
          preserveEntrySignatures: 'strict',
        },
      },
    })
    const { css, modules } = inspectOutput(
      entry === 'light' ? 'Button probe' : 'Button + Dialog probe',
      result,
    )
    assert.equal(
      modules.some(id => id.endsWith('/dist/dialog.js')),
      entry === 'heavy',
    )
    assert.equal(css.includes('.erx-dialog'), entry === 'heavy')
    assert.ok(css.includes('.erx-button'))
    assert.equal(css.match(/--erx-probe-color\s*:/g)?.length, 1)
  }
}

try {
  await mkdir(artifacts, { recursive: true })
  const packed = pack(root)
  const files = packed.files.map(file => file.path)
  for (const name of [
    'LICENSE',
    'NOTICE',
    'dist/hello.jsx.map',
    'dist/hello.server.js.map',
    'dist/hello.js.map',
    'dist/theme.jsx',
    'dist/theme.server.js',
    'dist/theme.css',
    'dist/tokens.css',
    'dist/styles.css.map',
    'dist/docs/index.md',
    'dist/docs/tokens.md',
    'dist/docs/components/hello.md',
    'dist/docs/components/hello.json',
    'dist/docs/examples/hello.tsx',
    'dist/docs/llms.txt',
    'dist/docs/llms-full.txt',
  ]) {
    assert.ok(files.includes(name), name + ' missing from tarball')
  }
  tool('node_modules/publint/src/cli.js', ['run', packed.path, '--strict'])
  tool('node_modules/@arethetypeswrong/cli/dist/index.js', [
    '--profile',
    'esm-only',
    '--no-definitely-typed',
    '--quiet',
    packed.path,
  ])
  for (const file of files.filter(name => /^dist\/.*\.(js|jsx|css)$/.test(name))) {
    const bytes = await readFile(path.join(root, file))
    sizes.push([file, path.extname(file).slice(1), bytes.length, gzipSync(bytes).length])
  }
  await consumers(packed.path)
  await benchmark()
  const report = [
    '# UL-08 package sizes',
    '',
    'Bytes are summed per emitted asset. Browser rows include the Solid runtime. The private probes measure import isolation ahead of the production components.',
    '',
    '| Entry | Type | Bytes | Gzip bytes |',
    '|---|---|---:|---:|',
    ...sizes.map(row => '| ' + row.join(' | ') + ' |'),
    '',
  ].join('\n')
  await writeFile(path.join(artifacts, 'size-report.md'), report)
  console.log(report)
} finally {
  await rm(temp, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
