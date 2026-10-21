import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld('weave', {
  getFrames: () => ipcRenderer.invoke('frames:get'),
  moveFrame: (id: string, x: number, y: number) => ipcRenderer.invoke('frames:move', id, x, y),
  onFramesChanged: (listener: (frames: unknown) => void) => {
    const channel = (_event: IpcRendererEvent, frames: unknown) => listener(frames)
    ipcRenderer.on('frames:changed', channel)
    return () => ipcRenderer.removeListener('frames:changed', channel)
  },
  setSelection: (selection: unknown) => ipcRenderer.invoke('selection:set', selection),
  getSelection: () => ipcRenderer.invoke('selection:get'),
})
