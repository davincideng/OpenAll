<script setup>
import { ref, shallowRef, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TitleBar from './components/TitleBar.vue'
import Toasts from './components/Toasts.vue'
import HomeView from './views/HomeView.vue'
import ToolView from './views/ToolView.vue'

const current = shallowRef(null) // 当前打开的工具
const params = ref({}) // 打开工具时附带的参数，例如 { url }
const busy = ref(false) // 有任务在跑时，标题栏的星芒会转动
const view = computed(() => (current.value ? 'tool' : 'home'))

// 首页方块 ↔ 工具页标题之间的形变动画（View Transitions API）
function tag(id, on) {
  document.querySelectorAll(`[data-vt$="-${id}"]`).forEach((el) => {
    el.style.viewTransitionName = on ? el.dataset.vt : ''
  })
}
function navigate(update, id) {
  if (!document.startViewTransition || !id) return update()
  tag(id, true)
  const t = document.startViewTransition(async () => {
    update()
    await nextTick()
    tag(id, true)
  })
  t.finished.finally(() => tag(id, false))
}

function open(tool, extra = {}) {
  navigate(() => {
    params.value = extra
    current.value = tool
  }, tool.id)
}
function home() {
  if (!current.value) return
  const id = current.value.id
  navigate(() => {
    current.value = null
    busy.value = false
  }, id)
}

function onKey(e) {
  if (e.key === 'Escape' && current.value && !e.target.closest?.('input')) home()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="app">
    <TitleBar :busy="busy" @home="home" />
    <main class="stage">
      <HomeView v-if="view === 'home'" @open="open" />
      <ToolView v-else :tool="current" :params="params" @back="home" @busy="busy = $event" />
    </main>
    <Toasts />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
