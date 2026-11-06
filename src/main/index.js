import { app, BrowserWindow, shell, nativeTheme } from 'electron'
import { join } from 'path'
import { registerIpc } from './ipc'

const THEME = {
  light: { color: '#F5F4EE', symbolColor: '#3D3D3A' },
  dark: { color: '#1F1E1D', symbolColor: '#C2C0B6' }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 760,
    minHeight: 560,
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? THEME.dark.color : THEME.light.color,
    // 隐藏原生标题栏，保留系统窗口按钮（Windows 上为右上角 overlay，macOS 上为红绿灯）
    titleBarStyle: 'hidden',
    titleBarOverlay: { ...THEME.light, height: 44 },
    trafficLightPosition: { x: 18, y: 15 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  registerIpc({ themes: THEME })
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
