import { Canvas } from './canvas/Canvas'
import { PropertiesPanel } from './panel/PropertiesPanel'
import './panel/panel.css'

export function App() {
  return (
    <div className="app">
      <Canvas />
      <PropertiesPanel />
    </div>
  )
}
