import { describe, expect, it } from 'vitest'
import {
  applyWheel,
  screenToWorld,
  worldToScreen,
  zoomAt,
  zoomLabel,
  type Camera,
} from './camera'

const zooms = [0.5, 1, 2] as const

describe('screen and world coordinates', () => {
  it.each(zooms)('round-trips at %s zoom', (zoom) => {
    const camera: Camera = { x: 40, y: -15, zoom }
    const screen = { x: 180, y: 96 }
    const world = screenToWorld(camera, screen.x, screen.y)
    expect(worldToScreen(camera, world.x, world.y)).toEqual(screen)
  })

  it('maps a known point at 50%, 100%, and 200%', () => {
    expect(screenToWorld({ x: 0, y: 0, zoom: 1 }, 10, 20)).toEqual({ x: 10, y: 20 })
    expect(screenToWorld({ x: 0, y: 0, zoom: 2 }, 10, 20)).toEqual({ x: 5, y: 10 })
    expect(screenToWorld({ x: 0, y: 0, zoom: 0.5 }, 10, 20)).toEqual({ x: 20, y: 40 })
  })

  it('treats the pan offset as the screen position of the world origin', () => {
    const camera: Camera = { x: 100, y: 50, zoom: 2 }
    expect(screenToWorld(camera, 100, 50)).toEqual({ x: 0, y: 0 })
    expect(worldToScreen(camera, 0, 0)).toEqual({ x: 100, y: 50 })
  })
})

describe('zoom at the cursor', () => {
  it.each(zooms)('keeps the world point under the cursor at %s', (zoom) => {
    const camera: Camera = { x: 30, y: 12, zoom }
    const cursor = { x: 80, y: 40 }
    const before = screenToWorld(camera, cursor.x, cursor.y)
    const next = zoomAt(camera, cursor.x, cursor.y, zoom * 1.7)
    expect(screenToWorld(next, cursor.x, cursor.y)).toEqual(before)
  })

  it('keeps that point when the zoom hits the limit', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 1 }
    const next = zoomAt(camera, 25, 25, 10_000)
    expect(next.zoom).toBe(64)
    expect(screenToWorld(next, 25, 25)).toEqual({ x: 25, y: 25 })
  })
})

describe('wheel', () => {
  it('pans on trackpad scroll and leaves zoom alone', () => {
    const next = applyWheel(
      { x: 10, y: 10, zoom: 1 },
      { deltaX: 5, deltaY: 8, deltaMode: 0, ctrlKey: false, metaKey: false, cursorX: 0, cursorY: 0 },
    )
    expect(next).toEqual({ x: 5, y: 2, zoom: 1 })
  })

  it('zooms toward the cursor on ctrl or meta scroll', () => {
    const start: Camera = { x: 0, y: 0, zoom: 1 }
    const input = {
      deltaX: 0,
      deltaY: -40,
      deltaMode: 0,
      ctrlKey: true,
      metaKey: false,
      cursorX: 80,
      cursorY: 40,
    }
    const next = applyWheel(start, input)
    expect(next.zoom).toBeGreaterThan(1)
    expect(screenToWorld(next, 80, 40)).toEqual(screenToWorld(start, 80, 40))

    const withMeta = applyWheel(start, { ...input, ctrlKey: false, metaKey: true })
    expect(withMeta.zoom).toBeGreaterThan(1)
  })

  it('labels 50%, 100%, and 200%', () => {
    expect(zoomLabel(0.5)).toBe('50%')
    expect(zoomLabel(1)).toBe('100%')
    expect(zoomLabel(2)).toBe('200%')
  })
})
