export function formatBytes(n) {
  if (n == null) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`
}

export function formatDuration(s) {
  if (s == null) return ''
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

// 同时兼容 Windows 反斜杠与 POSIX 斜杠，末尾的分隔符会被忽略
export const basename = (p = '') => p.split(/[\\/]/).filter(Boolean).pop() ?? ''
