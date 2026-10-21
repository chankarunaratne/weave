import { useRef, useState } from 'react'
import { Canvas } from './canvas/Canvas'
import { PropertiesPanel } from './panel/PropertiesPanel'
import type { SelectionCrumb } from './shared/model'
import './panel/panel.css'

export function App() {
  const [crumbs, setCrumbs] = useState<SelectionCrumb[]>([])
  const pickCrumb = useRef<(index: number) => void>(() => {})

  return (
    <div className="app">
      <Canvas
        onCrumbs={setCrumbs}
        onBindCrumb={(pick) => {
          pickCrumb.current = pick
        }}
      />
      <PropertiesPanel crumbs={crumbs} onCrumb={(index) => pickCrumb.current(index)} />
    </div>
  )
}
