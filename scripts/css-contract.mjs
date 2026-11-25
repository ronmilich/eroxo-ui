import stylelint from 'stylelint'
import { iris } from './iris-tokens.mjs'

const { createPlugin, utils } = stylelint
const libraryLayers = new Set(['erx.tokens', 'erx.components'])
const maximumHooks = 4

// Every public token name. A var(--erx-*) reference to anything else is a component hook.
const tokens = new Set([
  ...Object.values(iris.groups).flatMap(({ primitives, roles }) => [
    ...Object.keys(primitives),
    ...Object.keys(roles),
  ]),
  ...Object.values(iris.density).flatMap(Object.keys),
  ...Object.keys(iris.optional),
  ...Object.keys(iris.wide),
  ...Object.keys(iris.reduced),
])

function layerOf(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && parent.name.toLowerCase() === 'layer')
      return parent.params.trim()
  }
  return undefined
}

function ruleOf(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'rule') return parent
  }
  return undefined
}

const layeredRules = createPlugin('eroxo/layered-rules', enabled => (root, result) => {
  if (!enabled) return
  for (const node of root.nodes) {
    if (node.type === 'comment') continue
    if (node.type === 'atrule') {
      const name = node.name.toLowerCase()
      if (name === 'import' || name === 'charset') continue
      if (name === 'layer' && (!node.nodes || libraryLayers.has(node.params.trim()))) continue
    }
    utils.report({
      ruleName: 'eroxo/layered-rules',
      result,
      node,
      message:
        'Put library rules inside @layer erx.tokens or @layer erx.components, so unlayered application CSS wins',
    })
  }
})

const publicProperties = createPlugin('eroxo/public-properties', enabled => (root, result) => {
  if (!enabled) return
  root.walkDecls(/^--erx-/, declaration => {
    const layer = layerOf(declaration)
    if (layer === undefined || layer === 'erx.tokens') return
    utils.report({
      ruleName: 'eroxo/public-properties',
      result,
      node: declaration,
      message: `Declare ${declaration.prop} in @layer erx.tokens, or use a private --_erx-* variable in a component`,
    })
  })
})

const componentHooks = createPlugin('eroxo/component-hooks', enabled => (root, result) => {
  if (!enabled) return
  const hooks = new Map()
  root.walkDecls(declaration => {
    if (layerOf(declaration) !== 'erx.components') return
    const blocks = Array.from(
      (ruleOf(declaration)?.selector ?? '').matchAll(/\.erx-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g),
      match => match[1],
    )
    for (const [, name] of declaration.value.matchAll(/var\(\s*--erx-([a-z0-9-]+)/g)) {
      if (tokens.has(name)) continue
      const block = blocks
        .filter(candidate => name.startsWith(candidate + '-'))
        .sort((a, b) => b.length - a.length)[0]
      if (!block) {
        utils.report({
          ruleName: 'eroxo/component-hooks',
          result,
          node: declaration,
          message: `--erx-${name} is not an Iris token or a hook of a component in this selector. Fix the token name, or read a hook named --erx-<component>-<property>`,
        })
        continue
      }
      const names = hooks.get(block) ?? new Set()
      const added = !names.has(name)
      hooks.set(block, names.add(name))
      if (added && names.size > maximumHooks) {
        utils.report({
          ruleName: 'eroxo/component-hooks',
          result,
          node: declaration,
          message: `${block} reads more than ${maximumHooks} hooks. Use a semantic token or a part class, or record a use case and owner approval`,
        })
      }
    }
  })
})

export default [layeredRules, publicProperties, componentHooks]
