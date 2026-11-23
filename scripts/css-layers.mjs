import stylelint from 'stylelint'

const ruleName = 'eroxo/layer-order'
const message = 'Start each library stylesheet with @layer erx.tokens, erx.components;'

export default stylelint.createPlugin(ruleName, () => (root, result) => {
  const first = root.nodes.find(node => node.type !== 'comment')
  if (
    first?.type === 'atrule' &&
    first.name === 'layer' &&
    !first.nodes &&
    /^erx\.tokens\s*,\s*erx\.components$/.test(first.params)
  )
    return

  stylelint.utils.report({ ruleName, result, node: first ?? root, message })
})
