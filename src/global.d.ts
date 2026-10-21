import type { FrameRecord, SelectionState } from './shared/model'

declare global {
  interface Window {
    weave: {
      getFrames(): Promise<FrameRecord[]>
      moveFrame(id: string, x: number, y: number): Promise<FrameRecord[]>
      onFramesChanged(listener: (frames: FrameRecord[]) => void): () => void
      setSelection(selection: SelectionState): Promise<SelectionState>
      getSelection(): Promise<SelectionState>
    }
  }
}

export {}
