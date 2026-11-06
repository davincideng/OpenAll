/**
 * 视频 / 图片去水印 —— 待实现
 *
 * @param {object}   payload
 * @param {string}   payload.taskId     任务 ID（界面用来匹配进度）
 * @param {string}   payload.filePath   源文件绝对路径
 * @param {'image'|'video'} payload.kind 文件类型
 * @param {'auto'|'manual'} payload.mode 自动检测 / 手动框选
 * @param {Array<{x:number,y:number,w:number,h:number}>} payload.regions
 *        手动框选的水印区域，均为相对原图宽高的比例值（0~1）
 * @param {string}  [payload.outputDir] 输出目录，不传则与源文件同目录
 * @param {(p:{percent:number,message?:string}) => void} onProgress 进度回调
 *
 * @returns {Promise<{ outputPath: string }>} 处理完成后的文件路径
 */
export async function removeWatermark(payload, onProgress) {
  // TODO: 在这里实现去水印逻辑（例如调用 ffmpeg delogo / OpenCV inpaint / AI 模型等）
  // 处理过程中可多次调用：onProgress({ percent: 42, message: '正在处理第 12 帧' })
  void payload
  void onProgress
  throw new Error('去水印功能尚未实现')
}
