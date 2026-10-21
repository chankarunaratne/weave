import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { contentSize, screenDeltaToWorld } from './geometry'
import { buildSrcdoc } from './srcdoc'
import type { FrameRecord } from '../shared/model'

export function FrameView({
  frame,
  zoomRef,
  spaceRef,
  panningRef,
  onMove,
  onSelect,
  onPanStart,
  onPanMove,
  onPanEnd,
  onWheel,
  iframeRef,
}: {
  frame: FrameRecord
  zoomRef: RefObject<number>
  spaceRef: RefObject<boolean>
  panningRef: RefObject<boolean>
  onMove: (id: string, x: number, y: number) => void
  onSelect: (frameId: string, element: Element) => void
  onPanStart: (clientX: number, clientY: number) => void
  onPanMove: (clientX: number, clientY: number) => void
  onPanEnd: () => void
  onWheel: (
    clientX: number,
    clientY: number,
    deltaX: number,
    deltaY: number,
    deltaMode: number,
    ctrlKey: boolean,
    metaKey: boolean,
  ) => void
  iframeRef: (frameId: string, iframe: HTMLIFrameElement | null) => void
}) {
  const localRef = useRef<HTMLIFrameElement>(null)
  const srcdoc = buildSrcdoc(frame.html, frame.css)
  const dragRef = useRef<{ x: number; y: number; frameX: number; frameY: number } | null>(null)

  useEffect(() => {
    const iframe = localRef.current
    if (!iframe) return
    let detach = () => {}
    const attach = () => {
      detach()
      const doc = iframe.contentDocument
      if (!doc?.body) return
      const fitted = () =>
        contentSize(
          [...doc.body.children].map((child) => {
            const rect = child.getBoundingClientRect()
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          }),
        )
      const first = fitted()
      iframe.style.width = `${frame.width ?? first.width}px`
      iframe.style.height = `${first.height}px`
      const second = fitted()
      iframe.style.width = `${frame.width ?? second.width}px`
      iframe.style.height = `${second.height}px`

      const toParent = (event: { clientX: number; clientY: number }) => {
        const rect = iframe.getBoundingClientRect()
        const scaleX = iframe.clientWidth === 0 ? 1 : rect.width / iframe.clientWidth
        const scaleY = iframe.clientHeight === 0 ? 1 : rect.height / iframe.clientHeight
        return {
          x: rect.left + event.clientX * scaleX,
          y: rect.top + event.clientY * scaleY,
        }
      }
      const down = (event: PointerEvent) => {
        if (!spaceRef.current || event.button !== 0) return
        event.preventDefault()
        const point = toParent(event)
        onPanStart(point.x, point.y)
      }
      const move = (event: PointerEvent) => {
        if (!panningRef.current) return
        const point = toParent(event)
        onPanMove(point.x, point.y)
      }
      const up = () => {
        if (!panningRef.current) return
        onPanEnd()
      }
      const wheel = (event: WheelEvent) => {
        event.preventDefault()
        const point = toParent(event)
        onWheel(point.x, point.y, event.deltaX, event.deltaY, event.deltaMode, event.ctrlKey, event.metaKey)
      }
      const click = (event: MouseEvent) => {
        if (spaceRef.current || panningRef.current) return
        const target = event.target
        const ElementCtor = doc.defaultView?.Element
        if (!ElementCtor || !(target instanceof ElementCtor)) return
        if (target === doc.body || target === doc.documentElement) return
        event.preventDefault()
        onSelect(frame.id, target)
      }
      doc.addEventListener('pointerdown', down)
      doc.addEventListener('pointermove', move)
      doc.addEventListener('pointerup', up)
      doc.addEventListener('wheel', wheel, { passive: false })
      doc.addEventListener('click', click)
      detach = () => {
        doc.removeEventListener('pointerdown', down)
        doc.removeEventListener('pointermove', move)
        doc.removeEventListener('pointerup', up)
        doc.removeEventListener('wheel', wheel)
        doc.removeEventListener('click', click)
      }
    }
    iframe.addEventListener('load', attach)
    attach()
    return () => {
      iframe.removeEventListener('load', attach)
      detach()
    }
  }, [frame.id, frame.width, onPanEnd, onPanMove, onPanStart, onSelect, onWheel, panningRef, spaceRef, srcdoc])

  return (
    <div className="frame" style={{ left: frame.x, top: frame.y }}>
      <div
        className="frame-title"
        onPointerDown={(event) => {
          if (event.button !== 0 || spaceRef.current) return
          event.stopPropagation()
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          dragRef.current = {
            x: event.clientX,
            y: event.clientY,
            frameX: frame.x,
            frameY: frame.y,
          }
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag) return
          const delta = screenDeltaToWorld(
            event.clientX - drag.x,
            event.clientY - drag.y,
            zoomRef.current,
          )
          onMove(frame.id, drag.frameX + delta.x, drag.frameY + delta.y)
        }}
        onPointerUp={() => {
          dragRef.current = null
        }}
      >
        {frame.name}
      </div>
      <iframe
        ref={(node) => {
          localRef.current = node
          iframeRef(frame.id, node)
        }}
        title={frame.name}
        srcDoc={srcdoc}
        scrolling="no"
      />
    </div>
  )
}
