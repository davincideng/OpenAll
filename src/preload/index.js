import { contextBridge, ipcRenderer, webUtils } from 'electron'

/**
 * 暴露给界面的接口：window.openall
 * 界面统一通过 src/renderer/src/api/index.js 调用，不要直接访问 window.openall。
 */
const api = {
  platform: process.platform,

  // 通用
  openFile: (opts) => ipcRenderer.invoke('dialog:openFile', opts),
  selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
  showItem: (path) => ipcRenderer.invoke('shell:showItem', path),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  setTheme: (mode) => ipcRenderer.invoke('window:setTheme', mode),
  getPathForFile: (file) => webUtils.getPathForFile(file),

  /** 订阅任务进度，返回取消订阅函数 */
  onProgress: (cb) => {
    const listener = (_e, data) => cb(data)
    ipcRenderer.on('task:progress', listener)
    return () => ipcRenderer.removeListener('task:progress', listener)
  },

  // 工具
  watermark: {
    remove: (payload) => ipcRenderer.invoke('tool:watermark:remove', payload)
  },
  downloader: {
    parse: (url) => ipcRenderer.invoke('tool:downloader:parse', url),
    download: (payload) => ipcRenderer.invoke('tool:downloader:download', payload)
  }
}

contextBridge.exposeInMainWorld('openall', api)
