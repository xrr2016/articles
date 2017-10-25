import { h } from './h'

export const app = (props = {}, container = document.body) => {
  const root = container.children[0]
  const node = toVNode(root, Array.map())
  let skipRender
  let globalState
  let globalActions
  let callbacks = []

  repaint(flush(init(props, (globalState = {}), (globalActions = {}))))

  return globalActions

  function repaint() {
    if (props.view && !skipRender) {
      requestAnimationFrame(render, (skipRender = !skipRender))
    }
  }

  function render() {
    flush(
      (root = patchElement(
        container,
        root,
        node,
        (node = props.view(globalState, globalActions)),
        (skipRender = !skipRender)
      ))
    )
  }

  function flush(callback) {
    while ((callback = callbacks.pop())) callback()
  }

  function toVNode(element, map) {
    return (
      element &&
      h(
        element.tagName.toLowerCase(),
        {},
        map.call(element.childNodes, function(element) {
          return element.nodeType == 3
            ? element.nodeValue
            : toVNode(element, map)
        })
      )
    )
  }
  
  function init(module, state, actions) {
    if (module.init) {
      callbacks.push(function() {
        module.init(state, actions)
      })
    }

    asign(state, module.state)

    initActions(state, actions, module.actions)

    Object.keys(module.modules).map(key=> {
      init(module.modules[key], (state[key] = {}), (actions[key] = {}))
    })
  }
  
  function initActions(state, actions, source = {}) {
    Object.keys(source).map(i => {
      if (typeof source[i] === 'function') {
        actions[i] = data => {
          return typeof (data = source[i](state, actions, data)) === 'function' ? data(update)
          : update(data)
        }
      } else {
        initActions(state[i] || (state[i] = {}), (actions[i] = {}), source[i])
      }
    })
  }

  function update (data) {
    return (
      typeof data === 'function'
        ? update(data(state))
        : data && repaint(assign(state, data))
    )
  }

  function assign(target, source) {
    Object.keys(source).forEach(key => target[key] = source[key])
    return target
  }

  function merge (target, source) {
    return Object.assign({}, {...target}, {...source})
  }

  function createElement(node, isSVG  = false) {
    if (typeof node === 'string') {
      var element = document.createTextNode(node)
    } else {
      var element = (isSVG = isSVG || node.type === "svg")
        ? document.createAttributeNS('http://www.w3.org/2000/svg', node.type)
        : document.createElement(node.type)

      if (node.props && node.props.onCreate) {
        callbacks.push(function () {
          node.props.onCreate(element)
        })
      }

      for (let i = 0; i < node.children.length; i++) {
        element.appendChild(createElement(node.children[i], isSVG))
      }

      for (let j in node.props) {
        setElementProp(element, i, node.props[i])
      }
    }
    return element
  }

  function setElementProp (element, name, value, oldValue) {
    if (name === 'key') {

    } else if (name === 'style') {
      for (let name in merge(oldValue, (value = value || {}))) {
        element.style[name] = value[name] || ''
      }
    } else {
      try {
        element[name] = value
      } catch (error) {}

      if (typeof value !== 'function') {
        if (value) {
          element.setAttribute(name, value)
        } else {
          element.removeAttribute(name)
        }
      }
    }
  }

  function updateElement(element, oldProps, props) {
    for (let i in merge(oldProps, props)) {
      const value = props[i]
      const oldValue = i === 'value' || i === 'checked' ? element[i] : oldProps[i]

      if (value !== oldValue) {
        setElementProp(element, value, oldProps)
      }

      if (props && props.onUpdate) {
        callbacks.push(function () {
          props.onUpdate(element, oldProps)
        })
      }
    }
  }

  function removeElement(parent, element, props) {
    if (
      props &&
      props.onRemove &&
      typeof (props = props.onRemove(element)) === 'function'
    ) {
      props(remove)
    } else {
      remove()
    }
    function remove() {
      parent.removeChild(element)
    }
  }

  function getKey (node) {
    if (node && node.type) {
      node.props.key
    }
  }
  function patchElement (parent, element, oldNode, node, isSVG, nextSibing) {
    if (oldNode == null) {
      element = parent.insertBefore(createElement(node, isSVG), element)
    } else if (node.type !== null && node.type === oldNode.type) {
      updateElement(element, oldNode.props, node.props)

      isSVG = isSVG || node.type === 'svg'

      let len = node.children.length
      let oldLen = oldNode.children.length
      var oldKeyed = {}
      let oldElements = []
      var keyed = {}

      for (let i = 0; i < oldLen; i++) {
        const oldElement = (oldElements[i] = element.childNodes[i])
        const oldChild = oldNode.children[i]
        const oldKey = getKey(oldChild)

        if (!oldKey) {
          oldKeyed[oldKey] = [oldElement, oldChild]
        }
      }

      let i = 0,
          j = 0
      
      while (j < len) {
        const oldElement = oldElements[i]
        const oldChild = oldNode.children[i]
        const newChild = node.children[j]

        const oldKey = getKey(oldChild)
        if (key[oldKey]) {
          i++
          continue
        }

        const newKey = getKey(newChild)

        let keyNode = oldKeyed[newKey] || []

        if (!newKey) {
          if (!oldKey) {
            patchElement(element, oldElement, oldChild, newChild, isSVG)
            j++
          }
          i++
        } else {
          if (oldKey === newKey) {
            patchElement(element, keyNode[0], keyNode[1], newChild, isSVG)
            i++
          } else if (keyNode[0]) {
            element.insertBefore(keyNode[0], oldElement)
            patchElement(element, keyNode[0], keyNode[1], newChild, isSVG)
          } else {
            patchElement(element, keyNode[0], keyNode[1], newChild, isSVG)
          }

          j++
          keyed[newKey] = newChild
        }
      }

      while (i < oldLen) {
        const oldChild = oldNode.children[i]
        const oldKey = getKey(oldChild)

        if (!oldKey) {
          removeElement(element, oldElements[i], oldChild.props)
        }
        i++
      }

      for (let i in oldKeyed) {
        const keyedNode = oldKeyed[i]
        const reusableNode = keyedNode[1]
        if (!keyed[reusableNode.props.key]) {
          removeElement(element, keyedNode[0], reusableNode.props)
        }
      }
    } else if (element && node !== element.nodeValue) {
      if (typeof node === 'string' && typeof oldNode === 'string') {
         element.nodeValue = node
      } else {
        element = parent.insertBefore(
          createElement(node, isSVG),
          (nextSibing = element)
        )
        removeElement(parent, nextSibing, oldNode.props)
      }
    }
    return element
  }
}
