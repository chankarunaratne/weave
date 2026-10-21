import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'

const rendererUrl = process.env.WEAVE_RENDERER_URL

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: '#2c2c2c',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (!rendererUrl) {
    throw new Error('WEAVE_RENDERER_URL is not set')
  }

  void window.loadURL(rendererUrl)
}

Menu.setApplicationMenu(null)

void app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
