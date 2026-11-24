import { setupSearch } from './search'

setupSearch()

const playground = document.getElementById('playground')
if (playground) {
  const { mountPlayground } = await import('./Playground')
  mountPlayground(playground)
}
