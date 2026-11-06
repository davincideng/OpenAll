/**
 * 短视频链接解析 —— 待实现
 *
 * @param {string} url 用户粘贴的分享链接或分享文案
 * @returns {Promise<{
 *   title: string,
 *   author?: string,
 *   cover?: string,           // 封面图 URL
 *   duration?: number,        // 时长（秒）
 *   platform?: string,        // 平台 id，如 'douyin'，见界面 platforms.js
 *   formats: Array<{ id: string, label: string, size?: number }>  // 可选清晰度
 * }>}
 */
export async function parseVideo(url) {
  // TODO: 在这里实现链接解析（例如 yt-dlp -J / 各平台接口）
  void url
  throw new Error('链接解析功能尚未实现')
}

/**
 * 下载原视频 —— 待实现
 *
 * @param {object} payload
 * @param {string} payload.taskId
 * @param {string} payload.url        原始链接
 * @param {string} [payload.formatId] parseVideo 返回的清晰度 id
 * @param {string} [payload.outputDir] 保存目录，不传则使用系统“下载”目录
 * @param {(p:{percent:number,message?:string,speed?:string}) => void} onProgress
 *
 * @returns {Promise<{ outputPath: string }>}
 */
export async function downloadVideo(payload, onProgress) {
  // TODO: 在这里实现下载逻辑，过程中调用 onProgress({ percent, speed })
  void payload
  void onProgress
  throw new Error('视频下载功能尚未实现')
}
