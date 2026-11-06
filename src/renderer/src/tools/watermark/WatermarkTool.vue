<script setup>
import { ref, computed, watch } from 'vue'
import Icon from '@/components/Icon.vue'
import DropZone from '@/components/DropZone.vue'
import Segmented from '@/components/Segmented.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { api } from '@/api'
import { useTask } from '@/composables/useTask'
import { toast } from '@/composables/useToast'
import { vPress } from '@/composables/vPress'
import { formatBytes, basename } from '@/utils/format'

const emit = defineEmits(['busy'])

const file = ref(null) // { name, path, url, size, kind }
const mode = ref('auto') // 'auto' | 'manual'
const regions = ref([]) // [{ x, y, w, h }]，相对比例 0~1
const outputDir = ref('')
const task = useTask()
const { status, percent, message, error, result } = task

watch(status, (s) => emit('busy', s === 'running'))

const modes = [
  { value: 'auto', label: '自动识别' },
  { value: 'manual', label: '手动框选' }
]
const running = computed(() => status.value === 'running')
const canStart = computed(() => file.value && (mode.value === 'auto' || regions.value.length) && !running.value)

function pick(f) {
  file.value = f
  regions.value = []
  task.reset()
}
function clear() {
  if (file.value?.url) URL.revokeObjectURL(file.value.url)
  file.value = null
  regions.value = []
  task.reset()
}

// ---------- 手动框选 ----------
const stage = ref(null)
const drawing = ref(null)

function rel(e) {
  const r = stage.value.getBoundingClientRect()
  return {
    x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
    y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
  }
}
function down(e) {
  if (mode.value !== 'manual' || running.value || e.button !== 0) return
  e.currentTarget.setPointerCapture(e.pointerId)
  const p = rel(e)
  drawing.value = { ox: p.x, oy: p.y, x: p.x, y: p.y, w: 0, h: 0 }
}
function move(e) {
  const d = drawing.value
  if (!d) return
  const p = rel(e)
  Object.assign(d, { x: Math.min(d.ox, p.x), y: Math.min(d.oy, p.y), w: Math.abs(p.x - d.ox), h: Math.abs(p.y - d.oy) })
}
function up() {
  const d = drawing.value
  drawing.value = null
  if (d && d.w > 0.01 && d.h > 0.01) regions.value.push({ id: Date.now(), x: d.x, y: d.y, w: d.w, h: d.h })
}
const box = (r) => ({ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%` })

// ---------- 处理 ----------
async function chooseDir() {
  const dir = await api.selectDir()
  if (dir) outputDir.value = dir
}

async function start() {
  const res = await task.run((taskId) =>
    api.watermark.remove({
      taskId,
      filePath: file.value.path,
      kind: file.value.kind,
      mode: mode.value,
      regions: mode.value === 'manual' ? regions.value.map(({ x, y, w, h }) => ({ x, y, w, h })) : [],
      outputDir: outputDir.value || undefined
    })
  )
  if (res) toast.success('水印已去除')
  else toast.error(error.value || '处理失败')
}
</script>

<template>
  <Transition name="fade" mode="out-in">
    <DropZone
      v-if="!file"
      key="drop"
      title="拖入图片或视频，或点击选择"
      hint="支持 JPG · PNG · WEBP · MP4 · MOV 等常见格式"
      @pick="pick"
    />

    <div v-else key="work" class="work">
      <!-- 预览区 -->
      <div class="preview panel">
        <div class="canvas">
          <div
            ref="stage"
            class="stage"
            :class="{ drawable: mode === 'manual' && !running }"
            @pointerdown="down"
            @pointermove="move"
            @pointerup="up"
            @pointercancel="up"
          >
            <video v-if="file.kind === 'video'" :src="file.url" muted loop autoplay playsinline />
            <img v-else :src="file.url" alt="" draggable="false" />

            <TransitionGroup name="region">
              <template v-if="mode === 'manual'">
                <div v-for="(r, i) in regions" :key="r.id" class="region" :style="box(r)">
                  <span class="idx">{{ i + 1 }}</span>
                  <button class="del" title="删除" @pointerdown.stop @click="regions.splice(i, 1)">
                    <Icon name="x" :size="11" :stroke="2.2" />
                  </button>
                </div>
              </template>
            </TransitionGroup>
            <div v-if="drawing" class="region drawing" :style="box(drawing)" />
            <div v-if="running" class="scan" />
          </div>
        </div>
        <footer class="file">
          <Icon :name="file.kind" :size="16" />
          <span class="fname">{{ file.name }}</span>
          <span class="fsize">{{ formatBytes(file.size) }}</span>
          <button v-press class="btn btn-ghost btn-icon" title="换一个文件" :disabled="running" @click="clear">
            <Icon name="refresh" :size="15" />
          </button>
        </footer>
      </div>

      <!-- 设置区 -->
      <aside class="side">
        <section>
          <p class="label">识别方式</p>
          <Segmented v-model="mode" :options="modes" />
          <Transition name="fade" mode="out-in">
            <p v-if="mode === 'auto'" key="a" class="tip">自动检测画面中的水印、台标与角标。</p>
            <p v-else key="m" class="tip">
              在左侧画面上拖动，框出水印所在位置。
              <b v-if="regions.length">已框选 {{ regions.length }} 处</b>
            </p>
          </Transition>
        </section>

        <section>
          <p class="label">保存到</p>
          <button v-press class="dir" @click="chooseDir">
            <Icon name="folder" :size="16" />
            <span>{{ outputDir ? basename(outputDir) : '与原文件相同位置' }}</span>
            <small>更改</small>
          </button>
        </section>

        <div class="grow" />

        <Transition name="fade" mode="out-in">
          <ProgressBar v-if="running" key="p" :percent="percent" :label="message || '正在去除水印'" />
          <div v-else-if="status === 'done'" key="d" class="done">
            <span class="ok"><Icon name="check" :size="16" :stroke="2.2" /></span>
            <div class="done-text">
              <b>处理完成</b>
              <span>{{ basename(result?.outputPath) }}</span>
            </div>
            <button v-press class="btn" @click="api.showItem(result.outputPath)">打开位置</button>
          </div>
          <p v-else-if="status === 'error'" key="e" class="err">
            <Icon name="alert" :size="15" />
            <span>{{ error }}</span>
          </p>
        </Transition>

        <button v-press class="btn btn-primary btn-lg start" :disabled="!canStart" @click="start">
          <span v-if="running" class="spinner" />
          <Icon v-else name="wand" :size="17" />
          {{ running ? '处理中…' : status === 'done' ? '再处理一次' : '开始去除' }}
        </button>
      </aside>
    </div>
  </Transition>
</template>

<style scoped>
.work {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 20px;
  min-height: 420px;
}

/* ---------- 预览 ---------- */
.preview {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.canvas {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 24px;
  min-height: 340px;
  background:
    repeating-conic-gradient(var(--sunken) 0 25%, transparent 0 50%) 0 0 / 16px 16px,
    var(--bg);
}
.stage {
  position: relative;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  touch-action: none;
}
.stage.drawable {
  cursor: crosshair;
}
.stage img,
.stage video {
  max-height: 52vh;
  pointer-events: none;
}

.region {
  position: absolute;
  border-radius: 4px;
  border: 1.5px solid var(--accent);
  background: rgba(201, 100, 66, 0.18);
}
.region.drawing {
  border-style: dashed;
}
.idx {
  position: absolute;
  left: -1.5px;
  top: -19px;
  padding: 0 5px;
  border-radius: 4px 4px 4px 0;
  font: 600 11px/18px var(--font-mono);
  color: #fff;
  background: var(--accent);
}
.del {
  position: absolute;
  right: -9px;
  top: -9px;
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: #fff;
  background: var(--text);
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.3s var(--ease-spring);
}
.region:hover .del {
  opacity: 1;
  transform: none;
}
.region-enter-active {
  transition: all 0.4s var(--ease-spring);
}
.region-leave-active {
  transition: all 0.2s;
}
.region-enter-from,
.region-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, var(--accent-soft) 44%, rgba(201, 100, 66, 0.35) 50%, transparent 52%);
  background-size: 100% 220%;
  animation: scan 1.8s var(--ease-out) infinite;
  pointer-events: none;
}
@keyframes scan {
  from {
    background-position: 0 120%;
  }
  to {
    background-position: 0 -40%;
  }
}

.file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px 8px 16px;
  border-top: 1px solid var(--line);
  color: var(--text-2);
}
.fname {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}
.fsize {
  font-size: 12px;
  color: var(--text-3);
}

/* ---------- 设置 ---------- */
.side {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 4px;
}
.label {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-3);
}
.side .segmented {
  display: flex;
}
.side .segmented :deep(button) {
  flex: 1;
}
.tip {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-2);
}
.tip b {
  display: block;
  margin-top: 4px;
  font-weight: 500;
  color: var(--accent);
}
.dir {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  text-align: left;
  color: var(--text-2);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--line);
  transition:
    box-shadow 0.2s,
    transform 0.4s var(--ease-spring);
}
.dir:hover {
  box-shadow: inset 0 0 0 1px var(--line-strong);
}
.dir:active {
  transform: scale(0.98);
  transition-duration: 0.1s;
}
.dir span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}
.dir small {
  font-size: 12px;
  color: var(--accent);
}
.grow {
  flex: 1;
}
.start {
  width: 100%;
}

.done {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ok {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: var(--ok);
  background: var(--ok-soft);
  animation: bounce 0.6s var(--ease-spring);
}
.done-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: var(--text-3);
}
.done-text b {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
}
.done-text span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.done .btn {
  height: 32px;
  padding: 0 12px;
  font-size: 12.5px;
}
.err {
  display: flex;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--danger);
}
.err :deep(.icon) {
  margin-top: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.35s var(--ease-out);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0;
}
@keyframes bounce {
  from {
    transform: scale(0.4);
  }
}

@media (max-width: 860px) {
  .work {
    grid-template-columns: 1fr;
  }
}
</style>
