/**
 * 界面调用功能的唯一入口。
 *
 * - 运行在 Electron 中时：转发到 preload 暴露的 window.openall（真正的实现在 src/main/tools/*）
 * - 在浏览器里预览界面时（npm run dev:web）：自动使用 ./mock.js 的假数据，方便调 UI
 *
 * 所有耗时任务都接收 taskId，并通过 onProgress 推送 { taskId, percent, message }。
 */
import { mock } from './mock'

const native = typeof window !== 'undefined' ? window.openall : undefined
const impl = native ?? mock

export const isElectron = Boolean(native)
export const platform = impl.platform

export const api = {
  openFile: (opts) => impl.openFile(opts),
  selectDir: () => impl.selectDir(),
  showItem: (path) => impl.showItem(path),
  openExternal: (url) => impl.openExternal(url),
  setTheme: (mode) => impl.setTheme(mode),
  /** 拖拽进来的 File 对象 -> 本地绝对路径（仅 Electron 可用） */
  getPathForFile: (file) => impl.getPathForFile(file),
  onProgress: (cb) => impl.onProgress(cb),

  watermark: {
    /** @see src/main/tools/watermark.js */
    remove: (payload) => impl.watermark.remove(payload)
  },
  downloader: {
    /** @see src/main/tools/downloader.js */
    parse: (url) => impl.downloader.parse(url),
    download: (payload) => impl.downloader.download(payload)
  }
}

export const newTaskId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
