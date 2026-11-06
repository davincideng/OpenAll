<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Icon from '@/components/Icon.vue'
import ToolCard from '@/components/ToolCard.vue'
import ComingSoonCard from '@/components/ComingSoonCard.vue'
import { tools } from '@/tools'
import { extractUrl, detectPlatform } from '@/tools/downloader/platforms'

const emit = defineEmits(['open'])

const query = ref('')
const searchEl = ref(null)

const greeting = (() => {
  const h = new Date().getHours()
  if (h < 5) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})()

// 输入框里出现链接时，直接交给能接收链接的工具
const url = computed(() => extractUrl(query.value))
const platform = computed(() => detectPlatform(query.value))
const urlTool = computed(() => (url.value ? tools.find((t) => t.acceptsUrl) : null))

const list = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q || url.value) return tools
  return tools.filter((t) => [t.name, t.desc, ...(t.keywords ?? [])].some((s) => s.toLowerCase().includes(q)))
})

function submit() {
  if (urlTool.value) emit('open', urlTool.value, { url: query.value.trim() })
  else if (list.value.length) emit('open', list.value[0])
}

function onKey(e) {
  if (e.target.closest?.('input')) {
    if (e.key === 'Escape') {
      query.value = ''
      e.target.blur()
    }
    return
  }
  if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
    e.preventDefault()
    searchEl.value?.focus()
    return
  }
  const n = Number(e.key)
  if (n >= 1 && n <= 9 && list.value[n - 1]) emit('open', list.value[n - 1])
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <section class="home">
    <div class="hero">
      <p class="eyebrow">{{ greeting }}</p>
      <h1 class="serif">今天想处理点<em>什么</em>？</h1>
    </div>

    <form class="search" :class="{ link: urlTool }" @submit.prevent="submit">
      <Icon :name="urlTool ? 'link' : 'search'" :size="18" class="lead" />
      <input
        ref="searchEl"
        v-model="query"
        placeholder="搜索工具，或直接粘贴短视频链接"
        spellcheck="false"
        autocomplete="off"
      />
      <Transition name="pop">
        <button v-if="urlTool" key="go" type="submit" class="go">
          <span v-if="platform" class="chip">{{ platform.name }}</span>
          <span>下载这个视频</span>
          <Icon name="arrow-right" :size="15" />
        </button>
        <kbd v-else-if="!query" key="k" class="kbd">/</kbd>
      </Transition>
    </form>

    <TransitionGroup tag="div" name="grid" class="grid">
      <ToolCard v-for="(t, i) in list" :key="t.id" :tool="t" :index="i" @open="emit('open', t)" />
      <ComingSoonCard v-if="!query" key="soon" :index="list.length" />
    </TransitionGroup>

    <p v-if="!list.length" class="empty">没有找到「{{ query }}」相关的工具</p>
  </section>
</template>

<style scoped>
.home {
  max-width: 1040px;
  margin: 0 auto;
  padding: 7vh 40px 56px;
}

.hero {
  text-align: center;
  animation: up 0.7s var(--ease-out) backwards;
}
.hero .eyebrow {
  margin: 0 0 10px;
  font-size: 13px;
}
.hero h1 {
  margin: 0;
  font-size: clamp(30px, 4.2vw, 42px);
  line-height: 1.15;
  color: var(--text);
}
.hero em {
  font-style: italic;
  color: var(--accent);
}

/* ---------- 搜索 / 粘贴 ---------- */
.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 560px;
  height: 52px;
  margin: 32px auto 44px;
  padding: 0 8px 0 18px;
  border-radius: 16px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-md);
  transition:
    box-shadow 0.25s,
    transform 0.4s var(--ease-spring);
  animation: up 0.7s 0.06s var(--ease-out) backwards;
}
.search:focus-within {
  box-shadow:
    inset 0 0 0 1px var(--accent),
    0 0 0 4px var(--accent-soft),
    var(--shadow-md);
}
.search.link {
  transform: scale(1.015);
}
.lead {
  color: var(--text-3);
  transition: color 0.2s;
}
.search:focus-within .lead,
.search.link .lead {
  color: var(--accent);
}
.search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
}
.search input::placeholder {
  color: var(--text-3);
}
.kbd {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-right: 6px;
  border-radius: 6px;
  font: 500 12px var(--font-mono);
  color: var(--text-3);
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.go {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px 0 6px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--on-accent);
  background: var(--accent);
  box-shadow: 0 4px 12px -4px rgba(201, 100, 66, 0.5);
  transition:
    background-color 0.2s,
    transform 0.4s var(--ease-spring);
}
.go:hover {
  background: var(--accent-hover);
}
.go:active {
  transform: scale(0.95);
  transition-duration: 0.1s;
}
.chip {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
}

/* ---------- 方块 ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
  gap: 16px;
}
.empty {
  text-align: center;
  color: var(--text-3);
}

.pop-enter-active {
  transition: all 0.4s var(--ease-spring);
}
.pop-leave-active {
  transition: all 0.15s;
  position: absolute;
  right: 8px;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
.grid-move {
  transition: transform 0.45s var(--ease-spring);
}
.grid-enter-active {
  transition: all 0.35s var(--ease-out);
}
.grid-leave-active {
  transition: all 0.2s;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

@keyframes up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
