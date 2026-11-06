import { ref, watchEffect } from 'vue'
import { api } from '@/api'

// 'system' | 'light' | 'dark'
const pref = ref(localStorage.getItem('openall:theme') || 'system')
const media = window.matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(media.matches)
media.addEventListener('change', (e) => (systemDark.value = e.matches))

const resolved = () => (pref.value === 'system' ? (systemDark.value ? 'dark' : 'light') : pref.value)

watchEffect(() => {
  const mode = resolved()
  document.documentElement.dataset.theme = mode
  localStorage.setItem('openall:theme', pref.value)
  api.setTheme(mode)
})

export function useTheme() {
  const order = ['system', 'light', 'dark']
  const cycle = () => (pref.value = order[(order.indexOf(pref.value) + 1) % order.length])
  return { pref, cycle }
}
