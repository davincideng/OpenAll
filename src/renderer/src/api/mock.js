// 浏览器预览专用的假实现：模拟延迟与进度，便于调试界面交互
const listeners = new Set()
const emit = (data) => listeners.forEach((cb) => cb(data))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fakeProgress(taskId, total = 2400, label = '处理中') {
  const steps = 40
  for (let i = 1; i <= steps; i++) {
    await sleep(total / steps)
    const percent = Math.round((i / steps) * 100)
    emit({ taskId, percent, message: label, speed: `${(2 + Math.random() * 6).toFixed(1)} MB/s` })
  }
}

export const mock = {
  platform: 'web',
  openFile: async () => null,
  selectDir: async () => 'C:\\Users\\you\\Downloads\\OpenAll',
  showItem: async (p) => console.info('[mock] showItem', p),
  openExternal: async (u) => window.open(u, '_blank'),
  setTheme: async () => {},
  getPathForFile: (file) => file?.name ?? '',
  onProgress(cb) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },

  watermark: {
    async remove({ taskId, filePath }) {
      await fakeProgress(taskId, 2600, '正在去除水印')
      return { outputPath: filePath.replace(/(\.\w+)$/, '_clean$1') }
    }
  },

  downloader: {
    async parse(url) {
      await sleep(900)
      if (!/https?:\/\//.test(url)) throw new Error('没有识别到有效链接')
      return {
        title: '傍晚的海边，风很温柔 · 随手记录',
        author: '@一只小海豚',
        cover: '',
        duration: 47,
        formats: [
          { id: 'origin', label: '原画', size: 48.2 * 1024 * 1024 },
          { id: '1080p', label: '1080P', size: 31.6 * 1024 * 1024 },
          { id: '720p', label: '720P', size: 17.9 * 1024 * 1024 }
        ]
      }
    },
    async download({ taskId }) {
      await fakeProgress(taskId, 3200, '下载中')
      return { outputPath: 'C:\\Users\\you\\Downloads\\OpenAll\\video.mp4' }
    }
  }
}
