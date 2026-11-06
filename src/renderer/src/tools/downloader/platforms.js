// 支持的平台：仅用于界面识别和展示，真正的解析在主进程完成
export const platforms = [
  { id: 'douyin', name: '抖音', match: /douyin\.com|iesdouyin\.com/ },
  { id: 'kuaishou', name: '快手', match: /kuaishou\.com|gifshow\.com/ },
  { id: 'bilibili', name: 'B站', match: /bilibili\.com|b23\.tv/ },
  { id: 'xiaohongshu', name: '小红书', match: /xiaohongshu\.com|xhslink\.com/ },
  { id: 'weibo', name: '微博', match: /weibo\.(com|cn)/ },
  { id: 'tiktok', name: 'TikTok', match: /tiktok\.com/ },
  { id: 'youtube', name: 'YouTube', match: /youtube\.com|youtu\.be/ }
]

/** 从分享文案中提取第一个链接 */
export function extractUrl(text = '') {
  const m = text.match(/https?:\/\/[^\s，。！、"'<>]+/i)
  return m ? m[0] : ''
}

export function detectPlatform(text = '') {
  const url = extractUrl(text)
  return url ? platforms.find((p) => p.match.test(url)) ?? null : null
}
