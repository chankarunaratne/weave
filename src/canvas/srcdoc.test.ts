import { describe, expect, it } from 'vitest'
import { buildSrcdoc } from './srcdoc'

describe('buildSrcdoc', () => {
  it('puts the component css after the baseline margin reset', () => {
    const doc = buildSrcdoc('<h2>Pro plan</h2>', '.card{color:red}')
    const baseline = doc.indexOf('margin:0')
    const component = doc.indexOf('.card{color:red}')
    expect(baseline).toBeGreaterThan(-1)
    expect(component).toBeGreaterThan(baseline)
    expect(doc).toContain('<body><h2>Pro plan</h2></body>')
  })
})
