/**
 * 工具注册表 —— 首页的每个方块都来自这里。
 *
 * 新增一个工具：
 *   1. 在 ./<id>/ 下新建 <Name>Tool.vue 作为工具页面
 *   2. 在下方数组中追加一项
 *   3. 如需调用本地能力，在 src/main/tools、src/main/ipc.js、src/preload/index.js、src/renderer/src/api 中补充接口
 */
import { defineAsyncComponent } from 'vue'

export const tools = [
  {
    id: 'watermark',
    name: '去水印',
    desc: '抹去图片与视频中的水印、台标和字幕',
    icon: 'eraser',
    tags: ['图片', '视频'],
    keywords: ['水印', 'logo', '台标', 'watermark', '图片', '视频', '去除'],
    component: defineAsyncComponent(() => import('./watermark/WatermarkTool.vue'))
  },
  {
    id: 'downloader',
    name: '视频下载',
    desc: '粘贴短视频分享链接，保存无水印原片',
    icon: 'download',
    tags: ['抖音', 'B站', '小红书'],
    keywords: ['下载', '链接', '抖音', '快手', 'b站', '小红书', 'tiktok', 'youtube', 'download'],
    // 首页搜索框粘贴链接时，会自动打开此工具并带上链接
    acceptsUrl: true,
    component: defineAsyncComponent(() => import('./downloader/DownloaderTool.vue'))
  }
]

export const findTool = (id) => tools.find((t) => t.id === id)
