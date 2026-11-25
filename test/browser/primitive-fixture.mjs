import { cp, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import solid from '@solidjs/vite-plugin'
import { build } from 'vite'

const root = fileURLToPath(new URL('../../', import.meta.url))

function chunks(result) {
  return [result]
    .flat()
    .flatMap(build => build.output)
    .filter(file => file.type === 'chunk')
}

export async function buildPrimitiveFixture(
  dir,
  name,
  { styles = false, head = '', verifyChunk } = {},
) {
  const fixture = `test/browser/${name}-fixture.tsx`
  const local = path.resolve(dir) === path.resolve(root)
  // Compile private sources with the peers installed in the selected packed consumer.
  if (!local) {
    await mkdir(path.join(dir, 'test/browser'), { recursive: true })
    await cp(path.join(root, fixture), path.join(dir, fixture))
    await cp(path.join(root, 'src/internal'), path.join(dir, 'src/internal'), { recursive: true })
  }

  const config = () => ({ root: dir, configFile: false, plugins: [solid({ ssr: true })] })
  const entry = path.join(dir, fixture)
  const clientDir = `dist/${name}`
  const client = await build({
    ...config(),
    build: {
      outDir: clientDir,
      lib: { entry, formats: ['es'], fileName: () => 'fixture.js' },
    },
  })
  const serverDir = `dist/${name}-server`
  const server = await build({
    ...config(),
    build: { ssr: entry, outDir: serverDir },
  })
  if (verifyChunk) {
    for (const chunk of [...chunks(client), ...chunks(server)]) verifyChunk(chunk.code)
  }
  const serverEntry = chunks(server).find(file => file.isEntry)
  // A fixture can export markup for the start of <head>, such as a first-paint script.
  const {
    html,
    hydrationScript,
    head: firstHead = '',
  } = await import(pathToFileURL(path.join(dir, serverDir, serverEntry.fileName)).href)
  let stylesheet = ''
  if (styles) {
    const dist = local ? 'dist' : 'node_modules/eroxo-ui/dist'
    await cp(path.join(dir, dist, 'styles.css'), path.join(dir, clientDir, 'styles.css'))
    stylesheet = '<link rel="stylesheet" href="./styles.css">'
  }
  await writeFile(
    path.join(dir, clientDir, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8">${firstHead}<title>Primitive conformance</title>` +
      `${stylesheet}${head}${hydrationScript}</head><body><main>${html}</main><button id="dispose">Dispose</button>` +
      '<script type="module" src="./fixture.js"></script></body></html>',
  )
}
