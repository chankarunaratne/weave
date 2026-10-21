import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { applyWheel, panBy, zoomLabel, type Camera } from './camera'
import { FrameView } from './FrameView'
import { elementOverlay } from './geometry'
import { ancestorChain, cssSelector, selectorNodeFromElement } from './selector'
import type { FrameRecord, SelectionCrumb, SelectionState } from '../shared/model'

const DOT = 24

export function Canvas({
  onCrumbs,
  onBindCrumb,
}: {
  onCrumbs: (crumbs: SelectionCrumb[]) => void
  onBindCrumb: (pick: (index: number) => void) => void
}) {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 })
  const cameraRef = useRef(camera)
  cameraRef.current = camera
  const zoomRef = useRef(camera.zoom)
  zoomRef.current = camera.zoom

  const canvasRef = useRef<HTMLElement>(null)
  const spaceRef = useRef(false)
  const panningRef = useRef(false)
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const beginPan = useCallback((clientX: number, clientY: number) => {
    dragRef.current = { x: clientX, y: clientY }
    panningRef.current = true
    setPanning(true)
  }, [])
  const movePan = useCallback((clientX: number, clientY: number) => {
    const drag = dragRef.current
    if (!drag) return
    const next = panBy(cameraRef.current, clientX - drag.x, clientY - drag.y)
    dragRef.current = { x: clientX, y: clientY }
    cameraRef.current = next
    zoomRef.current = next.zoom
    setCamera(next)
  }, [])
  const endPan = useCallback(() => {
    dragRef.current = null
    panningRef.current = false
    setPanning(false)
  }, [])
  const [space, setSpace] = useState(false)
  const [panning, setPanning] = useState(false)
  const [frames, setFrames] = useState<FrameRecord[]>([])
  const framesRef = useRef(frames)
  framesRef.current = frames
  const iframeRefs = useRef(new Map<string, HTMLIFrameElement>())
  const chainRef = useRef<{ frameId: string; elements: Element[] } | null>(null)
  const [overlay, setOverlay] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  )

  const measure = useCallback(() => {
    const live = chainRef.current
    const canvas = canvasRef.current
    if (!live || !canvas) {
      setOverlay(null)
      return
    }
    const element = live.elements[live.elements.length - 1]
    const iframe = iframeRefs.current.get(live.frameId)
    if (!element || !iframe || !element.isConnected) {
      setOverlay(null)
      return
    }
    setOverlay(
      elementOverlay({
        canvas: toBox(canvas.getBoundingClientRect()),
        iframe: toBox(iframe.getBoundingClientRect()),
        iframeClientWidth: iframe.clientWidth,
        iframeClientHeight: iframe.clientHeight,
        element: toBox(element.getBoundingClientRect()),
      }),
    )
  }, [])

  const publishSelection = useCallback(
    (frameId: string, element: Element) => {
      const chain = ancestorChain(element)
      chainRef.current = { frameId, elements: chain }
      const frame = framesRef.current.find((item) => item.id === frameId)
      const crumbs: SelectionCrumb[] = [
        { label: frame?.name ?? frameId },
        ...chain.map((item) => ({ label: item.tagName.toLowerCase() })),
      ]
      onCrumbs(crumbs)
      const selection: SelectionState = {
        frameId,
        selector: cssSelector(selectorNodeFromElement(element)),
        tag: element.tagName.toLowerCase(),
        text: (element.textContent ?? '').trim().slice(0, 80),
        crumbs,
      }
      void window.weave.setSelection(selection)
      measure()
    },
    [measure, onCrumbs],
  )

  useEffect(() => {
    onBindCrumb((index) => {
      const live = chainRef.current
      if (!live) return
      const element = index === 0 ? live.elements[0] : live.elements[index - 1]
      if (!element) return
      publishSelection(live.frameId, element)
    })
  }, [onBindCrumb, publishSelection])

  useEffect(() => {
    let cancelled = false
    void window.weave.getFrames().then((next) => {
      if (!cancelled) setFrames(next)
    })
    const unsubscribe = window.weave.onFramesChanged((next) => {
      setFrames(next)
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

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
      panningRef.current = false
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

  const wheelAt = useCallback(
    (
      clientX: number,
      clientY: number,
      deltaX: number,
      deltaY: number,
      deltaMode: number,
      ctrlKey: boolean,
      metaKey: boolean,
    ) => {
      const element = canvasRef.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const next = applyWheel(cameraRef.current, {
        deltaX,
        deltaY,
        deltaMode,
        ctrlKey,
        metaKey,
        cursorX: clientX - rect.left,
        cursorY: clientY - rect.top,
      })
      cameraRef.current = next
      zoomRef.current = next.zoom
      setCamera(next)
    },
    [],
  )

  useEffect(() => {
    const element = canvasRef.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      wheelAt(
        event.clientX,
        event.clientY,
        event.deltaX,
        event.deltaY,
        event.deltaMode,
        event.ctrlKey,
        event.metaKey,
      )
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [wheelAt])

  useLayoutEffect(() => {
    measure()
  }, [camera, frames, measure])

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
        beginPan(event.clientX, event.clientY)
      }}
      onPointerMove={(event) => {
        if (!panningRef.current) return
        movePan(event.clientX, event.clientY)
      }}
      onPointerUp={endPan}
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
      >
        {frames.map((frame) => (
          <FrameView
            key={frame.id}
            frame={frame}
            zoomRef={zoomRef}
            spaceRef={spaceRef}
            panningRef={panningRef}
            onMove={(id, x, y) => {
              setFrames((current) =>
                current.map((item) => (item.id === id ? { ...item, x, y } : item)),
              )
              void window.weave.moveFrame(id, x, y)
            }}
            onSelect={publishSelection}
            onPanStart={beginPan}
            onPanMove={movePan}
            onPanEnd={endPan}
            onWheel={wheelAt}
            iframeRef={(id, iframe) => {
              if (iframe) iframeRefs.current.set(id, iframe)
              else iframeRefs.current.delete(id)
            }}
          />
        ))}
      </div>
      {overlay ? (
        <div
          className="selection-box"
          style={{
            left: overlay.x,
            top: overlay.y,
            width: overlay.width,
            height: overlay.height,
          }}
        />
      ) : null}
      <p className="zoom">{zoomLabel(camera.zoom)}</p>
    </main>
  )
}

function toBox(rect: DOMRect) {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest('input, textarea, select, [contenteditable="true"]') !== null
}
