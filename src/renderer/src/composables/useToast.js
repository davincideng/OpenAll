import { reactive } from 'vue'

export const toasts = reactive([])
let seed = 0

/** toast('已保存') / toast.success('完成') / toast.error('失败了') */
export function toast(message, { type = 'info', duration = 2600 } = {}) {
  const id = ++seed
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i > -1) toasts.splice(i, 1)
  }, duration)
}
toast.success = (m, o) => toast(m, { ...o, type: 'success' })
toast.error = (m, o) => toast(m, { duration: 4000, ...o, type: 'error' })
