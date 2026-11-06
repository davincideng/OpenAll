/**
 * v-press：按下时从指针位置晕开一圈柔和的涟漪，松手后淡出。
 * 用法：<button v-press> 或 <div v-press="'var(--accent)'">
 */
export const vPress = {
  mounted(el, binding) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    el.style.overflow = 'hidden'
    el.style.isolation = 'isolate'

    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || el.disabled) return
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const r = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
      const dot = document.createElement('span')
      dot.className = 'press-ripple'
      Object.assign(dot.style, {
        left: `${x - r}px`,
        top: `${y - r}px`,
        width: `${r * 2}px`,
        height: `${r * 2}px`,
        background: binding.value || 'currentColor'
      })
      el.appendChild(dot)
      const release = () => {
        dot.classList.add('out')
        setTimeout(() => dot.remove(), 600)
        window.removeEventListener('pointerup', release)
        window.removeEventListener('pointercancel', release)
      }
      window.addEventListener('pointerup', release)
      window.addEventListener('pointercancel', release)
    })
  }
}
