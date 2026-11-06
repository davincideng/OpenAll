import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { removeWatermark } from './tools/watermark'
import { parseVideo, downloadVideo } from './tools/downloader'

/**
 * 所有渲染进程 <-> 主进程的通道都集中注册在这里。
 * 新增工具时：在 ./tools 下新建实现文件，然后在下方 handle 一个新通道，
 * 并在 src/preload/index.js 中暴露对应方法即可。
 */
export function registerIpc({ themes }) {
  // ---------- 通用 ----------
  ipcMain.handle('dialog:openFile', async (e, { filters } = {}) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('dialog:selectDir', async (e) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory']
    })
    return canceled ? null : filePaths[0]
  })

  ipcMain.handle('shell:showItem', (_e, path) => shell.showItemInFolder(path))
  ipcMain.handle('shell:openExternal', (_e, url) => shell.openExternal(url))

  ipcMain.handle('window:setTheme', (e, mode) => {
    const win = BrowserWindow.fromWebContents(e.sender)
    const t = themes[mode] || themes.light
    if (process.platform !== 'darwin') win?.setTitleBarOverlay?.(t)
    win?.setBackgroundColor(t.color)
  })

  // ---------- 工具：去水印 ----------
  ipcMain.handle('tool:watermark:remove', (e, payload) =>
    removeWatermark(payload, progressReporter(e, payload.taskId))
  )

  // ---------- 工具：视频下载 ----------
  ipcMain.handle('tool:downloader:parse', (_e, url) => parseVideo(url))
  ipcMain.handle('tool:downloader:download', (e, payload) =>
    downloadVideo(payload, progressReporter(e, payload.taskId))
  )
}

/** 生成一个进度回调：实现里调用 onProgress({ percent, message }) 即可推送到界面 */
function progressReporter(e, taskId) {
  return (data) => {
    if (!e.sender.isDestroyed()) e.sender.send('task:progress', { taskId, ...data })
  }
}
