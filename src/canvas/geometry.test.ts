import { describe, expect, it } from 'vitest'
import { contentSize, elementOverlay, screenDeltaToWorld } from './geometry'

const client = { width: 280, height: 200 }
const element = { x: 16, y: 24, width: 40, height: 32 }
const canvas = { x: 100, y: 50, width: 800, height: 600 }

function overlayAt(zoom: number) {
  return elementOverlay({
    canvas,
    iframe: {
      x: 180,
      y: 90,
      width: client.width * zoom,
      height: client.height * zoom,
    },
    iframeClientWidth: client.width,
    iframeClientHeight: client.height,
    element,
  })
}

describe('element overlay', () => {
  it('places the box at 100% zoom', () => {
    expect(overlayAt(1)).toEqual({ x: 96, y: 64, width: 40, height: 32 })
  })

  it('scales the box at 200% zoom', () => {
    expect(overlayAt(2)).toEqual({ x: 112, y: 88, width: 80, height: 64 })
  })

  it('scales the box at 50% zoom', () => {
    expect(overlayAt(0.5)).toEqual({ x: 88, y: 52, width: 20, height: 16 })
  })
})

describe('frame content size', () => {
  it('hugs the component instead of the default iframe width', () => {
    expect(contentSize([{ x: 0, y: 0, width: 47.2, height: 24.1 }])).toEqual({
      width: 48,
      height: 25,
    })
  })

  it('includes a child that is offset from the origin', () => {
    expect(contentSize([{ x: 8, y: 4, width: 20, height: 10 }])).toEqual({
      width: 28,
      height: 14,
    })
  })

  it('uses the furthest edge when a frame has more than one root', () => {
    expect(
      contentSize([
        { x: 0, y: 0, width: 40, height: 12 },
        { x: 0, y: 16, width: 18, height: 10 },
      ]),
    ).toEqual({ width: 40, height: 26 })
  })
})

describe('frame drag', () => {
  it.each([
    [1, 10, 20],
    [2, 5, 10],
    [0.5, 20, 40],
  ] as const)('converts a 10 by 20 screen drag at %s zoom', (zoom, x, y) => {
    expect(screenDeltaToWorld(10, 20, zoom)).toEqual({ x, y })
  })
})
