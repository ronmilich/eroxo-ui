const vocabulary = {
  'data-erx-variant': ['solid', 'soft', 'outline', 'ghost', 'text'],
  'data-erx-size': ['sm', 'md', 'lg'],
  'data-erx-tone': ['primary', 'neutral', 'success', 'warning', 'danger', 'info'],
}

export default {
  meta: { name: 'eroxo' },
  rules: {
    'data-attribute': {
      meta: {
        messages: {
          invalid: 'Use data-erx-* for library state and stable classes for parts.',
          value: 'Expected {{name}} to use one of {{choices}}.',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            const name = node.name.name
            if (typeof name !== 'string' || !/^data-/i.test(name)) return
            if (
              name === 'data-erx-slot' ||
              !/^data-erx-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)
            ) {
              context.report({ node, messageId: 'invalid' })
            }
            const choices = vocabulary[name]
            const value = node.value
            if (
              choices &&
              (!value || (value.type === 'Literal' && !choices.includes(value.value)))
            ) {
              context.report({
                node,
                messageId: 'value',
                data: { name, choices: choices.join(', ') },
              })
            }
          },
        }
      },
    },
  },
}
