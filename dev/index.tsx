import { setupSearch } from './search'

setupSearch()

const playground = document.getElementById('playground')
if (playground && playground.dataset.example !== 'hello') {
  const examples = import.meta.glob<{ default: () => import('@solidjs/web').JSX.Element }>(
    './examples/*.tsx',
  )
  const load = examples['./examples/' + playground.dataset.example + '.tsx']
  if (load) {
    const { render } = await import('@solidjs/web')
    const example = await load()
    render(() => <example.default />, playground)
  }
} else if (playground) {
  const { mountPlayground } = await import('./Playground')
  mountPlayground(playground)
}
