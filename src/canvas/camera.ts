export type Camera = {
  x: number
  y: number
  zoom: number
}

export const MIN_ZOOM = 0.02
export const MAX_ZOOM = 64

export function screenToWorld(
  camera: Camera,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  }
}

export function worldToScreen(
  camera: Camera,
  worldX: number,
  worldY: number,
): { x: number; y: number } {
  return {
    x: worldX * camera.zoom + camera.x,
    y: worldY * camera.zoom + camera.y,
  }
}

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

export function zoomAt(
  camera: Camera,
  screenX: number,
  screenY: number,
  nextZoom: number,
): Camera {
  const zoom = clampZoom(nextZoom)
  const world = screenToWorld(camera, screenX, screenY)
  return {
    zoom,
    x: screenX - world.x * zoom,
    y: screenY - world.y * zoom,
  }
}

export function panBy(camera: Camera, dx: number, dy: number): Camera {
  return { ...camera, x: camera.x + dx, y: camera.y + dy }
}

export function zoomFromWheel(zoom: number, deltaY: number): number {
  return zoom * Math.exp(-deltaY * 0.0015)
}

export function normalizeWheel(delta: number, deltaMode: number): number {
  if (deltaMode === 1) return delta * 16
  if (deltaMode === 2) return delta * 800
  return delta
}

export type WheelInput = {
  deltaX: number
  deltaY: number
  deltaMode: number
  ctrlKey: boolean
  metaKey: boolean
  cursorX: number
  cursorY: number
}

export function applyWheel(camera: Camera, input: WheelInput): Camera {
  const dx = normalizeWheel(input.deltaX, input.deltaMode)
  const dy = normalizeWheel(input.deltaY, input.deltaMode)
  if (input.ctrlKey || input.metaKey) {
    return zoomAt(camera, input.cursorX, input.cursorY, zoomFromWheel(camera.zoom, dy))
  }
  return panBy(camera, -dx, -dy)
}

export function zoomLabel(zoom: number): string {
  return `${Math.round(zoom * 100)}%`
}
