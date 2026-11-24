import solid from '@solidjs/vite-plugin'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { compileDocs } from './compile.mjs'

const root = fileURLToPath(new URL('./', import.meta.url))
const input = ['index.html', 'components/hello/index.html']
const href = (page, target) => path.posix.relative(path.posix.dirname(page.route), target) || '.'
const escape = value =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const example =
  '<div id="playground"></div>\n<noscript>Enable JavaScript to try the example.</noscript>'

async function site() {
  const docs = await compileDocs(example)
  const index = docs.pages.map(page => ({
    title: page.title,
    route: page.route,
    headings: page.sections.map(section => section.title),
    text: page.html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  }))
  docs.files.set('search.json', JSON.stringify(index) + '\n')
  return docs
}

function layout(page, pages) {
  const navigation = pages
    .map(
      item =>
        `<a href="${href(page, item.route)}"${item === page ? ' aria-current="page"' : ''}>${item.title}</a>`,
    )
    .join('')
  const sections = page.sections
    .map(section => `<a href="#${section.id}">${escape(section.title)}</a>`)
    .join('')
  return `<a class="skip" href="#main">Skip to content</a>
    <header class="top">
      <a class="brand" href="${href(page, 'index.html')}">Eroxo<span> UI</span></a>
      <div class="search" data-index="${href(page, 'search.json')}" hidden>
        <label for="docs-search">Search docs</label>
        <input id="docs-search" type="search" placeholder="Search docs" autocomplete="off" aria-controls="results">
        <div id="results" class="results" hidden>
          <p role="status"></p>
          <ul></ul>
        </div>
      </div>
      <a class="source-link" href="https://github.com/ronmilich/eroxo-ui">GitHub</a>
    </header>
    <div class="layout">
      <nav class="sidebar" aria-label="Documentation">${navigation}</nav>
      <main id="main">
        <article>${page.html}</article>
        <footer class="formats">
          <a href="${href(page, page.markdown)}">Markdown</a>
          <a href="${href(page, 'llms.txt')}">llms.txt</a>
          ${page.route === input[1] ? `<a href="${href(page, 'components/hello.json')}">Component metadata</a>` : ''}
        </footer>
      </main>
      <nav class="outline" aria-label="On this page"><b>On this page</b>${sections}</nav>
    </div>`
}

function documentation(command) {
  let built
  return {
    name: 'eroxo-documentation',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const name = new URL(request.url, 'http://localhost').pathname.slice(1)
        if (!/\.(?:md|txt|json)$/.test(name)) return next()
        try {
          const docs = await site()
          const content = docs.files.get(name)
          if (content === undefined) return next()
          response.setHeader(
            'Content-Type',
            name.endsWith('.json')
              ? 'application/json; charset=utf-8'
              : 'text/plain; charset=utf-8',
          )
          response.end(content)
        } catch (error) {
          next(error)
        }
      })
    },
    async buildStart() {
      if (command === 'build') built = await site()
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, context) {
        const docs = built ?? (await site())
        const filename = path.relative(root, context.filename).replaceAll('\\', '/')
        const page = docs.pages.find(item => item.route === filename)
        if (!page) return html
        const title = page.route === 'index.html' ? 'Eroxo UI Docs' : `${page.title} · Eroxo UI`
        return html
          .replace('<!-- docs-title -->', `<title>${title}</title>`)
          .replace('<!-- docs-page -->', () => layout(page, docs.pages))
      },
    },
    generateBundle() {
      for (const [fileName, source] of built.files)
        this.emitFile({ type: 'asset', fileName, source })
    },
  }
}

export default defineConfig(({ command, isPreview }) => ({
  root,
  base: './',
  plugins: [solid(), documentation(command)],
  resolve: {
    dedupe: ['solid-js', '@solidjs/web'],
    alias:
      command === 'serve' && !isPreview
        ? [
            {
              find: 'eroxo-ui/hello',
              replacement: fileURLToPath(new URL('../src/hello.tsx', import.meta.url)),
            },
            {
              find: 'eroxo-ui/styles.css',
              replacement: fileURLToPath(new URL('../src/styles.css', import.meta.url)),
            },
          ]
        : [],
  },
  build: { rolldownOptions: { input: input.map(file => path.join(root, file)) } },
  server: { port: 3000 },
}))
