import assert from 'node:assert/strict'
import { generateHydrationScript, renderToString } from '@solidjs/web'
import { Hello } from 'eroxo-ui'
import { Hello as SubpathHello } from 'eroxo-ui/hello'
import { view } from './view.ts'

assert.equal(typeof document, 'undefined')
assert.equal(Hello, SubpathHello)
assert.match(import.meta.resolve('eroxo-ui/hello'), /hello\.server\.js$/)
export const html = renderToString(view().render)
export const hydrationScript = generateHydrationScript()
