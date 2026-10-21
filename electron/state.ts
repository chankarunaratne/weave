import { BrowserWindow, ipcMain } from 'electron'
import { sampleFrames, type FrameRecord } from './sample.js'

export type SelectionState = {
  frameId: string
  selector: string
  tag: string
  text: string
  crumbs: { label: string }[]
} | null

let frames: FrameRecord[] = []
let selection: SelectionState = null
let handlersReady = false

export function attachFrameState(_window: BrowserWindow): void {
  if (frames.length === 0) frames = sampleFrames()
  if (handlersReady) return
  handlersReady = true

  ipcMain.handle('frames:get', () => frames)
  ipcMain.handle('frames:move', (_event, id: string, x: number, y: number) => {
    frames = frames.map((frame) =>
      frame.id === id ? { ...frame, x: Number(x), y: Number(y) } : frame,
    )
    // The renderer already moved the frame. Echoing frames:changed here can
    // arrive late and snap the drag back to an older point.
    return frames
  })
  ipcMain.handle('selection:get', () => selection)
  ipcMain.handle('selection:set', (_event, next: SelectionState) => {
    selection = next
    return selection
  })
}
