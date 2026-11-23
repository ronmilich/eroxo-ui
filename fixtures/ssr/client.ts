import { hydrate } from '@solidjs/web'
import { view } from './view.ts'

const root = document.querySelector('main')!
const original = root.firstElementChild
const app = view()
hydrate(app.render, root)
if (!original || root.firstElementChild !== original)
  throw new Error('Hydration replaced the server element')
document.querySelector('button')!.addEventListener('click', app.update)
root.dataset.hydrated = 'true'
