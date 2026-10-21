export type Box = {
  x: number
  y: number
  width: number
  height: number
}

export function elementOverlay(input: {
  canvas: Box
  iframe: Box
  iframeClientWidth: number
  iframeClientHeight: number
  element: Box
}): Box {
  const scaleX = input.iframeClientWidth === 0 ? 1 : input.iframe.width / input.iframeClientWidth
  const scaleY = input.iframeClientHeight === 0 ? 1 : input.iframe.height / input.iframeClientHeight
  return {
    x: input.iframe.x - input.canvas.x + input.element.x * scaleX,
    y: input.iframe.y - input.canvas.y + input.element.y * scaleY,
    width: input.element.width * scaleX,
    height: input.element.height * scaleY,
  }
}

export function screenDeltaToWorld(dx: number, dy: number, zoom: number): { x: number; y: number } {
  return { x: dx / zoom, y: dy / zoom }
}

export function contentSize(boxes: Box[]): { width: number; height: number } {
  let width = 0
  let height = 0
  for (const box of boxes) {
    width = Math.max(width, box.x + box.width)
    height = Math.max(height, box.y + box.height)
  }
  return {
    width: Math.max(1, Math.ceil(width)),
    height: Math.max(1, Math.ceil(height)),
  }
}
