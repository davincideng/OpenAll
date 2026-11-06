<script setup>
import Icon from './Icon.vue'
import { vPress } from '@/composables/vPress'

defineProps({
  tool: { type: Object, required: true },
  index: { type: Number, default: 0 }
})
const emit = defineEmits(['open'])

// 光斑跟随指针
function track(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}
</script>

<template>
  <button
    v-press="'var(--accent)'"
    class="card"
    :style="{ '--i': index }"
    @pointermove="track"
    @click="emit('open', tool, $event.currentTarget)"
  >
    <div class="top">
      <span class="glyph" :data-vt="`glyph-${tool.id}`">
        <Icon :name="tool.icon" :size="22" />
      </span>
      <span class="go"><Icon name="arrow-right" :size="16" /></span>
    </div>

    <div class="body">
      <h3 class="title serif" :data-vt="`title-${tool.id}`">{{ tool.name }}</h3>
      <p class="desc">{{ tool.desc }}</p>
      <div v-if="tool.tags?.length" class="tags">
        <span v-for="t in tool.tags" :key="t" class="tag">{{ t }}</span>
      </div>
    </div>

    <kbd v-if="index < 9" class="key">{{ index + 1 }}</kbd>
  </button>
</template>

<style scoped>
.card {
  --mx: 50%;
  --my: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 220px;
  padding: 20px;
  text-align: left;
  border-radius: 20px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--line), var(--shadow-sm);
  transition:
    transform 0.5s var(--ease-spring),
    box-shadow 0.35s var(--ease-out),
    background-color 0.3s;
  animation: rise 0.6s calc(var(--i) * 60ms + 80ms) var(--ease-out) backwards;
}

/* 指针光斑 */
.card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  background: radial-gradient(260px circle at var(--mx) var(--my), var(--accent-soft), transparent 65%);
  opacity: 0;
  transition: opacity 0.35s;
}

.card:hover {
  transform: translateY(-3px);
  background: var(--surface-hover);
  box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-lg);
}
.card:hover::before {
  opacity: 1;
}
.card:active {
  transform: translateY(-1px) scale(0.975);
  transition-duration: 0.12s;
  transition-timing-function: var(--ease-press);
}

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.glyph {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  color: var(--accent);
  background: var(--accent-soft);
  transition: transform 0.5s var(--ease-spring);
}
.card:hover .glyph {
  transform: rotate(-6deg) scale(1.05);
}

.go {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--text-2);
  background: var(--sunken);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity 0.25s,
    transform 0.45s var(--ease-spring),
    background-color 0.2s,
    color 0.2s;
}
.card:hover .go {
  opacity: 1;
  transform: none;
  color: var(--on-accent);
  background: var(--accent);
}

.body {
  margin-top: 28px;
}
.title {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.2;
  color: var(--text);
  width: fit-content;
}
.desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-2);
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}
.tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  color: var(--text-3);
  box-shadow: inset 0 0 0 1px var(--line);
}

.key {
  position: absolute;
  right: 18px;
  bottom: 18px;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 5px;
  font: 500 11px/20px var(--font-mono);
  text-align: center;
  color: var(--text-3);
  box-shadow: inset 0 0 0 1px var(--line);
  opacity: 0;
  transition: opacity 0.25s;
}
.card:hover .key {
  opacity: 1;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
}
</style>
