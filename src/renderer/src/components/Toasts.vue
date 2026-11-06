<script setup>
import Icon from './Icon.vue'
import { toasts } from '@/composables/useToast'
const icon = { info: 'sparkle', success: 'check', error: 'alert' }
</script>

<template>
  <div class="toasts">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <Icon :name="icon[t.type]" :size="16" />
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  left: 50%;
  bottom: 28px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  white-space: nowrap;
  color: var(--bg);
  background: var(--text);
  box-shadow: var(--shadow-lg);
}
.toast.success :deep(.icon) {
  color: #a7c493;
}
.toast.error :deep(.icon),
.toast.info :deep(.icon) {
  color: #e8a184;
}
.toast-enter-active {
  transition: all 0.5s var(--ease-spring);
}
.toast-leave-active {
  transition: all 0.25s var(--ease-out);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.92);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
