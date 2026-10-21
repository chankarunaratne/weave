import { useEffect, useRef, useState } from 'react'
import { applyWheel, panBy, zoomLabel, type Camera } from './camera'

const DOT = 24

export function Canvas() {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const cameraRef = useRef(camera)
  cameraRef.current = camera

  const canvasRef = useRef<HTMLElement>(null)
  const spaceRef = useRef(false)
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [space, setSpace] = useState(false)
  const [panning, setPanning] = useState(false)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      spaceRef.current = true
      setSpace(true)
    }
    const up = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      spaceRef.current = false
      setSpace(false)
    }
    const blur = () => {
      spaceRef.current = false
      setSpace(false)
      dragRef.current = null
      setPanning(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [])

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = element.getBoundingClientRect()
      const next = applyWheel(cameraRef.current, {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        cursorX: event.clientX - rect.left,
        cursorY: event.clientY - rect.top,
      })
      cameraRef.current = next
      setCamera(next)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [])

  const className = ['canvas', space ? 'is-space' : '', panning ? 'is-panning' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <main
      ref={canvasRef}
      className={className}
      onPointerDown={(event) => {
        if (!spaceRef.current || event.button !== 0) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        dragRef.current = { x: event.clientX, y: event.clientY }
        setPanning(true)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        dragRef.current = { x: event.clientX, y: event.clientY }
        const next = panBy(cameraRef.current, dx, dy)
        cameraRef.current = next
        setCamera(next)
      }}
      onPointerUp={() => {
        dragRef.current = null
        setPanning(false)
      }}
    >
      <div
        className="canvas-grid"
        style={{
          backgroundSize: `${DOT * camera.zoom}px ${DOT * camera.zoom}px`,
          backgroundPosition: `${camera.x}px ${camera.y}px`,
        }}
      />
      <div
        className="world"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}
      />
      <p className="zoom">{zoomLabel(camera.zoom)}</p>
    </main>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest('input, textarea, select, [contenteditable="true"]') !== null
}
