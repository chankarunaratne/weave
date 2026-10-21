export type SelectorNode = {
  id: string
  tagName: string
  classes: string[]
  parent: SelectorNode | null
  indexAmongTag: number
}

export function cssSelector(node: SelectorNode): string {
  if (node.id) return `#${escapeIdent(node.id)}`
  const parts: string[] = []
  let current: SelectorNode | null = node
  while (current) {
    let part = current.tagName.toLowerCase()
    const classes = current.classes.filter(isStableClass)
    if (classes.length > 0) {
      part += classes.map((name) => `.${escapeIdent(name)}`).join('')
    }
    if (current.indexAmongTag > 0) {
      part += `:nth-of-type(${current.indexAmongTag})`
    }
    parts.unshift(part)
    current = current.parent
  }
  return parts.join(' > ')
}

export function selectorNodeFromElement(element: Element): SelectorNode {
  const parent = element.parentElement
  const stop = !parent || parent.tagName === 'BODY' || parent.tagName === 'HTML'
  let indexAmongTag = 0
  if (parent) {
    const same = [...parent.children].filter((child) => child.tagName === element.tagName)
    if (same.length > 1) indexAmongTag = same.indexOf(element) + 1
  }
  return {
    id: element.id,
    tagName: element.tagName,
    classes: [...element.classList],
    parent: stop || !parent ? null : selectorNodeFromElement(parent),
    indexAmongTag,
  }
}

export function ancestorChain(element: Element): Element[] {
  const chain: Element[] = []
  let current: Element | null = element
  while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
    chain.unshift(current)
    current = current.parentElement
  }
  return chain
}

function isStableClass(name: string): boolean {
  if (name.length > 40) return false
  if (/^[a-z0-9]{12,}$/i.test(name) && /\d/.test(name)) return false
  return true
}

function escapeIdent(value: string): string {
  return value.replace(/([^a-zA-Z0-9_-])/g, '\\$1')
}
