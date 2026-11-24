import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Marked, Renderer } from 'marked'
import { API, SignatureKind, SymbolFlags } from 'typescript/unstable/sync'
import { iris, contrastRatio, resolveToken } from '../scripts/iris-tokens.mjs'

const here = new URL('./', import.meta.url)
const library = new URL('../src/', here)
const definitions = [
  { title: 'Eroxo UI', route: 'index.html', markdown: 'index.md', content: 'index' },
  { title: 'Iris tokens', route: 'tokens/index.html', markdown: 'tokens.md', content: 'tokens' },
  {
    title: 'Hello',
    route: 'components/hello/index.html',
    markdown: 'components/hello.md',
    content: 'hello',
    example: 'examples/hello.tsx',
    entry: 'hello.tsx',
  },
]
const read = (name, root = here) => readFile(new URL(name, root), 'utf8')
const json = value => JSON.stringify(value, null, 2) + '\n'
const code = value => '`' + value + '`'
const cell = value =>
  String(value)
    .replaceAll('|', '\\|')
    .replace(/\s*\r?\n\s*/g, ' ')

function table(headers, rows) {
  return [headers, headers.map(() => '---'), ...rows]
    .map(row => '| ' + row.map(cell).join(' | ') + ' |')
    .join('\n')
}

function tokenReference() {
  const sections = Object.entries(iris.groups).map(([family, { primitives, roles }]) => {
    const rows = Object.entries({ ...primitives, ...roles }).map(([name, value]) => {
      const [light, dark] = Array.isArray(value) ? value : [value, value]
      return [
        code('--erx-' + name),
        name in primitives ? 'Primitive' : 'Semantic',
        code(light),
        code(dark),
      ]
    })
    return (
      '## ' + family + '\n\n' + table(['Token', 'Tier', 'Light or shared', 'Dark or shared'], rows)
    )
  })
  const density = Object.entries(iris.density.standard).map(([name, standard]) => [
    code('--erx-' + name),
    code(iris.density.compact[name]),
    code(standard),
    code(iris.density.comfortable[name]),
  ])
  sections.push(
    '## Density\n\n' + table(['Semantic token', 'Compact', 'Standard', 'Comfortable'], density),
  )
  for (const [heading, values] of [
    ['Wide typography at 48rem', iris.wide],
    ['Reduced-motion defaults', iris.reduced],
    ['Optional overrides and their fallbacks', iris.optional],
  ]) {
    sections.push(
      '## ' +
        heading +
        '\n\n' +
        table(
          ['Token', 'Value'],
          Object.entries(values).map(([name, value]) => [code('--erx-' + name), code(value)]),
        ),
    )
  }
  const contrast = iris.contrast.map(([foreground, background, minimum]) => [
    code('--erx-' + foreground),
    code('--erx-' + background),
    minimum,
    ...['light', 'dark'].map(mode =>
      contrastRatio(resolveToken(foreground, mode), resolveToken(background, mode)).toFixed(2),
    ),
  ])
  sections.push(
    '## Contrast checks\n\n' +
      table(['Foreground', 'Background', 'Minimum', 'Light', 'Dark'], contrast),
  )
  return sections.join('\n\n')
}

function componentProps(entry, name) {
  const filename = fileURLToPath(new URL(entry, library))
  const config = fileURLToPath(new URL('../tsconfig.json', here))
  const api = new API({ cwd: path.dirname(config) })
  try {
    const snapshot = api.updateSnapshot({ openProjects: [config] })
    const { program, checker } = snapshot.getProject(config)
    const source = program.getSourceFile(filename)
    const component = checker
      .getExportsOfModule(checker.getSymbolAtLocation(source))
      .find(symbol => symbol.name === name)
    assert.ok(component, `Missing TypeScript export ${name} from ${entry}`)
    const [signature] = checker.getSignaturesOfType(
      checker.getTypeOfSymbol(component),
      SignatureKind.Call,
    )
    assert.ok(signature, `Expected ${name} to be a callable component`)
    const [props] = signature.getParameters()
    if (!props) return []
    return checker.getPropertiesOfType(checker.getTypeOfSymbol(props)).map(prop => {
      const description = prop.getDocumentationComment(checker)
      const tags = new Map(prop.getJsDocTags(checker).map(tag => [tag.name, tag.text]))
      assert.ok(description, `${name}.${prop.name} is missing a JSDoc description`)
      return {
        name: prop.name,
        type: checker.typeToString(checker.getTypeOfSymbol(prop)),
        required: !(prop.flags & SymbolFlags.Optional),
        default: tags.get('defaultValue') ?? null,
        description,
        example: tags.get('example') ?? null,
      }
    })
  } finally {
    api.close()
  }
}

function componentMarkdown(content, metadata, example, live) {
  const { props, keyboard, cssVariables } = metadata
  const source = '```tsx\n' + example.trimEnd() + '\n```'
  return content
    .replace('{{example}}', () => (live ? live + '\n\n' + source : source))
    .replace('{{props}}', () =>
      table(
        ['Prop', 'Type', 'Required', 'Default', 'Description'],
        props.map(prop => [
          code(prop.name),
          code(prop.type),
          prop.required ? 'Yes' : 'No',
          prop.default === null ? '—' : code(prop.default),
          prop.description,
        ]),
      ),
    )
    .replace('{{keyboard}}', () =>
      table(
        ['Key', 'Behavior'],
        keyboard.map(row => [row.key, row.behavior]),
      ),
    )
    .replace('{{styling}}', () =>
      table(
        ['CSS variable', 'Description', 'Fallback'],
        cssVariables.map(variable => [
          code(variable.name),
          variable.description,
          code(variable.fallback),
        ]),
      ),
    )
}

function renderMarkdown(markdown) {
  const sections = []
  const ids = new Set()
  const renderer = new Marked({
    renderer: {
      code(token) {
        return Renderer.prototype.code.call(this, token).replace('<pre>', '<pre tabindex="0">')
      },
      heading(token) {
        const stem = token.text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        let id = stem || 'section'
        for (let index = 2; ids.has(id); index++) id = `${stem || 'section'}-${index}`
        ids.add(id)
        if (token.depth === 2) sections.push({ id, title: token.text })
        return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`
      },
    },
  })
  return { html: renderer.parse(markdown), sections }
}

export async function compileDocs(live = '') {
  const files = new Map()
  const pages = []
  for (const definition of definitions) {
    const { title, route, markdown, content, example, entry } = definition
    const intro = await read(`content/${content}.md`)
    const body = `# ${title}\n\n${intro.replace('{{tokens}}', () => tokenReference())}`
    let reference = body.replaceAll('./components/hello/', './components/hello.md')
    let web = body
    if (example) {
      const spec = JSON.parse(await read(`content/${content}.json`))
      const source = await read(example)
      const metadata = {
        ...spec,
        props: componentProps(entry, spec.component),
        examples: [{ source: example }],
      }
      reference = componentMarkdown(reference, metadata, source)
      web = componentMarkdown(web, metadata, source, live)
      files.set(example, source)
      files.set(markdown.replace(/\.md$/, '.json'), json(metadata))
    }
    files.set(markdown, reference)
    pages.push({ title, route, markdown, reference, ...renderMarkdown(web) })
  }

  files.set(
    'llms.txt',
    [
      '# Eroxo UI',
      '',
      '> Component documentation and live-example source for the Eroxo UI Solid 2 library.',
      '',
      '## Documentation',
      '',
      ...pages.map(page => `- [${page.title}](./${page.markdown})`),
      '- [Hello component metadata](./components/hello.json)',
      '',
    ].join('\n'),
  )
  files.set('llms-full.txt', pages.map(page => page.reference.trim()).join('\n\n---\n\n') + '\n')
  return { pages, files }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const { files } = await compileDocs()
  for (const [filename, content] of files) {
    const target = path.join(process.argv[2], filename)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content)
  }
}
