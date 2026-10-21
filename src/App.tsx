import { PropertiesPanel } from './panel/PropertiesPanel'
import './panel/panel.css'

export function App() {
  return (
    <div className="app">
      <main className="canvas">
        <p className="zoom">100%</p>
      </main>
      <PropertiesPanel />
    </div>
  )
}
