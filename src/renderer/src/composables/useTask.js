import { ref, onBeforeUnmount } from 'vue'
import { api, newTaskId } from '@/api'

/**
 * 包装一次耗时任务：自动生成 taskId、监听进度、维护状态。
 *   const task = useTask()
 *   await task.run((taskId) => api.watermark.remove({ taskId, ... }))
 * 状态：idle → running → done | error
 */
export function useTask() {
  const status = ref('idle')
  const percent = ref(0)
  const message = ref('')
  const speed = ref('')
  const error = ref(null)
  const result = ref(null)
  let currentId = null

  const off = api.onProgress((p) => {
    if (p.taskId !== currentId) return
    if (p.percent != null) percent.value = p.percent
    if (p.message) message.value = p.message
    if (p.speed) speed.value = p.speed
  })
  onBeforeUnmount(off)

  async function run(fn) {
    currentId = newTaskId()
    status.value = 'running'
    percent.value = 0
    message.value = ''
    speed.value = ''
    error.value = null
    result.value = null
    try {
      result.value = await fn(currentId)
      percent.value = 100
      status.value = 'done'
      return result.value
    } catch (e) {
      // Electron 会把主进程错误包装成 "Error invoking remote method ...: Error: xxx"
      error.value = String(e?.message ?? e).replace(/^.*Error: /, '')
      status.value = 'error'
      return null
    }
  }

  function reset() {
    currentId = null
    status.value = 'idle'
    percent.value = 0
    error.value = null
    result.value = null
  }

  return { status, percent, message, speed, error, result, run, reset }
}
