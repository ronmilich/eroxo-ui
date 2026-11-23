import { render } from '@solidjs/web'
import { flush } from 'solid-js'
import { view } from './view.ts'

const app = view()
render(app.render, document.body)
app.update()
flush()
