import { describe, expect, it } from 'vitest'
import { cssSelector, type SelectorNode } from './selector'

function node(
  tagName: string,
  extras: Partial<SelectorNode> = {},
  parent: SelectorNode | null = null,
): SelectorNode {
  return {
    id: '',
    tagName,
    classes: [],
    parent,
    indexAmongTag: 0,
    ...extras,
  }
}

describe('cssSelector', () => {
  it('uses an id when the element has one', () => {
    const heading = node('H2', { id: 'price', parent: node('ARTICLE', { classes: ['card'] }) })
    expect(cssSelector(heading)).toBe('#price')
  })

  it('builds a structural path and numbers duplicate tags', () => {
    const card = node('ARTICLE', { classes: ['card'] })
    const heading = node('H2', { indexAmongTag: 2, parent: card })
    expect(cssSelector(heading)).toBe('article.card > h2:nth-of-type(2)')
  })

  it('does not use a hashed class as the only identifier', () => {
    const card = node('DIV', { classes: ['a1b2c3d4e5f6g7'] })
    expect(cssSelector(card)).toBe('div')
  })
})
