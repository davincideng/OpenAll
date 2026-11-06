<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import Spark from './Spark.vue'
import { platform } from '@/api'
import { useTheme } from '@/composables/useTheme'
import { vPress } from '@/composables/vPress'

defineProps({ busy: Boolean })
const emit = defineEmits(['home'])

const { pref, cycle } = useTheme()
const themeIcon = computed(() => ({ system: 'sparkle', light: 'sun', dark: 'moon' })[pref.value])
const themeLabel = computed(() => ({ system: '跟随系统', light: '浅色', dark: '深色' })[pref.value])
</script>

<template>
  <header class="titlebar" :class="`is-${platform}`">
    <button class="brand" title="回到工具箱" @click="emit('home')">
      <Spark :size="18" :spin="busy" />
      <span class="name serif">OpenAll</span>
    </button>
    <div class="spacer" />
    <button v-press class="btn btn-ghost btn-icon theme" :title="`外观：${themeLabel}`" @click="cycle">
      <Transition name="swap" mode="out-in">
        <Icon :key="pref" :name="themeIcon" :size="17" />
      </Transition>
    </button>
  </header>
</template>

<style scoped>
.titlebar {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  height: var(--titlebar-h);
  padding: 0 16px;
  -webkit-app-region: drag;
}
/* 给系统窗口按钮让位 */
.titlebar.is-darwin {
  padding-left: 84px;
}
.titlebar.is-win32,
.titlebar.is-linux {
  padding-right: 148px;
}
.brand,
.theme {
  -webkit-app-region: no-drag;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.brand:hover {
  background: var(--sunken);
}
.brand:hover :deep(.spark) {
  transform: rotate(45deg);
}
.name {
  font-size: 16px;
  color: var(--text);
}
.spacer {
  flex: 1;
}
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.18s,
    transform 0.3s var(--ease-spring);
}
.swap-enter-from {
  opacity: 0;
  transform: rotate(-60deg) scale(0.6);
}
.swap-leave-to {
  opacity: 0;
  transform: rotate(60deg) scale(0.6);
}
</style>
