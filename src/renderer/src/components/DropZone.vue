<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import { api } from '@/api'
import { toast } from '@/composables/useToast'

/**
 * 文件拖放区：支持拖入或点击选择。
 * 选中后 emit('pick', { path, name, url, size, kind })
 *   path —— 本地绝对路径（交给主进程处理）
 *   url  —— 可在界面里直接预览的地址
 */
const props = defineProps({
  accept: { type: String, default: 'image/*,video/*' },
  title: { type: String, default: '拖入文件，或点击选择' },
  hint: { type: String, default: '' }
})
const emit = defineEmits(['pick'])

const over = ref(false)
const input = ref(null)
let depth = 0

function handle(file) {
  if (!file) return
  // 拖放不受 accept 约束，这里补一道类型校验
  if (file.type && !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    toast.error('只能选择图片或视频文件')
    return
  }
  emit('pick', {
    name: file.name,
    path: api.getPathForFile(file),
    url: URL.createObjectURL(file),
    size: file.size,
    kind: file.type.startsWith('video') ? 'video' : 'image'
  })
}

// 选完就清空 value，否则再次选择同一个文件不会触发 change
function onChange(e) {
  handle(e.target.files?.[0])
  e.target.value = ''
}

function onDrop(e) {
  depth = 0
  over.value = false
  handle(e.dataTransfer.files[0])
}
function onEnter() {
  depth++
  over.value = true
}
function onLeave() {
  if (--depth <= 0) over.value = false
}
</script>

<template>
  <div
    class="drop"
    :class="{ over }"
    role="button"
    tabindex="0"
    @click="input.click()"
    @keydown.enter.space.prevent="input.click()"
    @dragenter.prevent="onEnter"
    @dragover.prevent
    @dragleave="onLeave"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" :accept="props.accept" hidden @change="onChange" />
    <div class="art">
      <span class="sheet back"><Icon name="video" :size="18" /></span>
      <span class="sheet front"><Icon name="image" :size="20" /></span>
      <span class="arrow"><Icon name="arrow-up" :size="14" :stroke="2" /></span>
    </div>
    <p class="title serif">{{ over ? '松手即可' : title }}</p>
    <p v-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 320px;
  padding: 32px;
  border-radius: 20px;
  cursor: pointer;
  background:
    radial-gradient(circle at 50% 42%, var(--accent-soft), transparent 60%) center / 0% 0% no-repeat,
    var(--surface);
  box-shadow: inset 0 0 0 1px var(--line);
  outline: 1.5px dashed var(--line-strong);
  outline-offset: -10px;
  transition:
    background-size 0.5s var(--ease-out),
    outline-color 0.25s,
    outline-offset 0.4s var(--ease-spring),
    transform 0.45s var(--ease-spring);
}
.drop:hover {
  outline-color: var(--text-3);
}
.drop:active {
  transform: scale(0.99);
  transition-duration: 0.12s;
}
.drop.over {
  background-size: 160% 160%, auto;
  outline-color: var(--accent);
  outline-offset: -14px;
}

.art {
  position: relative;
  width: 84px;
  height: 64px;
  margin-bottom: 14px;
}
.sheet {
  position: absolute;
  display: grid;
  place-items: center;
  width: 48px;
  height: 56px;
  border-radius: 10px;
  background: var(--surface-hover);
  box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-md);
  transition: transform 0.55s var(--ease-spring);
}
.back {
  left: 8px;
  top: 6px;
  color: var(--text-3);
  transform: rotate(-10deg);
}
.front {
  right: 8px;
  top: 2px;
  color: var(--accent);
  transform: rotate(6deg);
}
.arrow {
  position: absolute;
  left: 50%;
  bottom: -6px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  border-radius: 50%;
  color: var(--on-accent);
  background: var(--accent);
  box-shadow: 0 0 0 3px var(--surface);
  transition: transform 0.5s var(--ease-spring);
}
.drop:hover .back,
.drop.over .back {
  transform: rotate(-18deg) translate(-6px, 2px);
}
.drop:hover .front,
.drop.over .front {
  transform: rotate(12deg) translate(6px, -2px);
}
.drop:hover .arrow,
.drop.over .arrow {
  transform: translateY(-4px);
}
.title {
  margin: 0;
  font-size: 19px;
  color: var(--text);
}
.hint {
  margin: 0;
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
