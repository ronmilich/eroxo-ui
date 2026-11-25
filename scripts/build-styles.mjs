import { copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { bundle } from 'lightningcss'

const root = path.resolve(process.argv[2] ?? '.')
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
for (const key of Object.keys(manifest.exports).filter(key => key.endsWith('.css'))) {
  const name = path.basename(key)
  const filename = path.join(root, 'src', name)
  const out = path.join(root, 'dist', name)
  await writeFile(out.replace(/\.css$/, '.d.css.ts'), 'export {}\n')
  if (name === 'tailwind.css') {
    // Tailwind compiles @theme in the consumer's build, and the consumer's
    // stylesheet sets the layer order, so the bridge ships unchanged.
    await copyFile(filename, out)
    continue
  }
  const { code, map } = bundle({ filename, projectRoot: root, minify: true, sourceMap: true })
  // Lightning CSS merges layer statements into blocks. Each independently loaded sheet
  // must establish the same order, including when a consumer loads component CSS first.
  await writeFile(
    out,
    Buffer.concat([
      Buffer.from('@layer erx.tokens, erx.components;\n'),
      code,
      Buffer.from('\n/*# sourceMappingURL=' + name + '.map */\n'),
    ]),
  )
  const sourceMap = JSON.parse(map)
  sourceMap.mappings = ';' + sourceMap.mappings
  await writeFile(out + '.map', JSON.stringify(sourceMap))
}
