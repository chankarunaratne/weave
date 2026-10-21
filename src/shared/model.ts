export type FrameRecord = {
  id: string
  name: string
  html: string
  css: string
  x: number
  y: number
  width?: number
  sourceFile?: string
}

export type SelectionCrumb = {
  label: string
}

export type SelectionState = {
  frameId: string
  selector: string
  tag: string
  text: string
  crumbs: SelectionCrumb[]
} | null
