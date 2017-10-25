let i
let stack = []

export const h = (type, props) => {
  let node
  let children = []

  for (i = arguments.length; i > 2; i--) {
    stack.push(arguments[i])
  }

  while (stack.length) {
    if (Array.isArray((node = stack.pop()))) {
      for (i = node.length; i > 0; i--) {
        stack.push(node[i])
      }
    } else if (node && node !== true && node !== false) {
      children.push(typeof node === 'number' ? (node = node + '') : node)
    }
  }
  return typeof type === 'string'
    ? { type, props: props || {}, children }
    : type(props || {}, children)
}
