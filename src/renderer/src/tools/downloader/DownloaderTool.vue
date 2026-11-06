<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Icon from '@/components/Icon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { api } from '@/api'
import { useTask } from '@/composables/useTask'
import { toast } from '@/composables/useToast'
import { vPress } from '@/composables/vPress'
import { formatBytes, formatDuration, basename } from '@/utils/format'
import { platforms, extractUrl, detectPlatform } from './platforms'

const props = defineProps({
  url: { type: String, default: '' } // 从首页粘贴进来的链接
})
const emit = defineEmits(['busy'])

const input = ref(props.url)
const inputEl = ref(null)
const link = computed(() => extractUrl(input.value))
const platform = computed(() => detectPlatform(input.value))

const parse = useTask()
const dl = useTask()
const info = computed(() => parse.result.value)
const formatId = ref('')
const outputDir = ref('')

watch([parse.status, dl.status], ([a, b]) => emit('busy', a === 'running' || b === 'running'))
watch(info, (v) => (formatId.value = v?.formats?.[0]?.id ?? ''))

async function doParse() {
  if (!link.value) {
    toast.error('没有识别到链接')
    inputEl.value?.focus()
    return
  }
  dl.reset()
  const res = await parse.run(() => api.downloader.parse(link.value))
  if (!res) toast.error(parse.error.value || '解析失败')
}

async function paste() {
  try {
    const text = await navigator.clipboard.readText()
    if (!text) return toast('剪贴板是空的')
    input.value = text.trim()
    if (link.value) doParse()
  } catch {
    inputEl.value?.focus()
    toast('请使用 Ctrl / ⌘ + V 粘贴')
  }
}

function clear() {
  input.value = ''
  parse.reset()
  dl.reset()
  inputEl.value?.focus()
}

async function chooseDir() {
  const dir = await api.selectDir()
  if (dir) outputDir.value = dir
}

async function download() {
  const res = await dl.run((taskId) =>
    api.downloader.download({
      taskId,
      url: link.value,
      formatId: formatId.value || undefined,
      outputDir: outputDir.value || undefined
    })
  )
  if (res) toast.success('已保存到本地')
  else toast.error(dl.error.value || '下载失败')
}

onMounted(() => {
  if (link.value) doParse()
  else inputEl.value?.focus()
})
</script>

<template>
  <div class="dl">
    <!-- 链接输入 -->
    <form class="bar" :class="{ has: link }" @submit.prevent="doParse">
      <span class="lead">
        <Transition name="swap" mode="out-in">
          <span v-if="platform" :key="platform.id" class="chip">{{ platform.name }}</span>
          <Icon v-else name="link" :size="18" />
        </Transition>
      </span>
      <input
        ref="inputEl"
        v-model="input"
        placeholder="粘贴分享链接或整段分享文案"
        spellcheck="false"
        autocomplete="off"
        @paste="$nextTick(() => link && doParse())"
      />
      <button v-if="input" v-press type="button" class="btn btn-ghost btn-icon" title="清空" @click="clear">
        <Icon name="x" :size="15" />
      </button>
      <button v-else v-press type="button" class="btn btn-ghost paste" @click="paste">
        <Icon name="clipboard" :size="15" />
        粘贴
      </button>
      <button v-press type="submit" class="btn btn-primary" :disabled="!input || parse.status.value === 'running'">
        <span v-if="parse.status.value === 'running'" class="spinner" />
        <span v-else>解析</span>
      </button>
    </form>

    <Transition name="fade" mode="out-in">
      <!-- 解析中：骨架屏 -->
      <div v-if="parse.status.value === 'running'" key="skeleton" class="card panel skeleton">
        <div class="cover sk" />
        <div class="meta">
          <div class="sk line" style="width: 78%" />
          <div class="sk line" style="width: 40%" />
          <div class="sk block" />
        </div>
      </div>

      <!-- 解析结果 -->
      <div v-else-if="info" key="info" class="card panel">
        <div class="cover" :style="info.cover ? { backgroundImage: `url(${info.cover})` } : null">
          <span v-if="!info.cover" class="play"><Icon name="play" :size="20" /></span>
          <span v-if="info.duration" class="dur">{{ formatDuration(info.duration) }}</span>
        </div>

        <div class="meta">
          <h2 class="title serif">{{ info.title }}</h2>
          <p v-if="info.author" class="author"><Icon name="user" :size="13" /> {{ info.author }}</p>

          <div v-if="info.formats?.length" class="formats">
            <button
              v-for="f in info.formats"
              :key="f.id"
              v-press
              class="fmt"
              :class="{ on: f.id === formatId }"
              :disabled="dl.status.value === 'running'"
              @click="formatId = f.id"
            >
              <span class="dot" />
              <b>{{ f.label }}</b>
              <small>{{ formatBytes(f.size) }}</small>
            </button>
          </div>

          <div class="foot">
            <button v-press class="dir" :disabled="dl.status.value === 'running'" @click="chooseDir">
              <Icon name="folder" :size="15" />
              <span>{{ outputDir ? basename(outputDir) : '下载文件夹' }}</span>
            </button>

            <Transition name="fade" mode="out-in">
              <ProgressBar
                v-if="dl.status.value === 'running'"
                key="p"
                class="prog"
                :percent="dl.percent.value"
                :label="dl.message.value || '下载中'"
                :hint="dl.speed.value"
              />
              <div v-else-if="dl.status.value === 'done'" key="d" class="actions">
                <span class="saved"><Icon name="check" :size="15" :stroke="2.2" /> 已保存</span>
                <button v-press class="btn" @click="api.showItem(dl.result.value.outputPath)">打开位置</button>
              </div>
              <div v-else key="b" class="actions">
                <button v-press class="btn btn-primary btn-lg" @click="download">
                  <Icon name="download" :size="17" />
                  下载原视频
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 解析失败 -->
      <div v-else-if="parse.status.value === 'error'" key="err" class="empty">
        <span class="badge err"><Icon name="alert" :size="20" /></span>
        <p class="serif">没能解析这个链接</p>
        <span class="eyebrow">{{ parse.error.value }}</span>
        <button v-press class="btn" @click="doParse"><Icon name="refresh" :size="15" /> 重试</button>
      </div>

      <!-- 初始状态 -->
      <div v-else key="empty" class="empty">
        <span class="badge"><Icon name="download" :size="20" /></span>
        <p class="serif">在分享菜单里点「复制链接」，然后粘贴到上方</p>
        <div class="platforms">
          <span v-for="p in platforms" :key="p.id" class="pf">{{ p.name }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dl {
  max-width: 720px;
}

/* ---------- 输入条 ---------- */
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 56px;
  padding: 0 8px 0 16px;
  border-radius: 16px;
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--line-strong), var(--shadow-md);
  transition: box-shadow 0.25s;
}
.bar:focus-within {
  box-shadow:
    inset 0 0 0 1px var(--accent),
    0 0 0 4px var(--accent-soft),
    var(--shadow-md);
}
.lead {
  display: flex;
  align-items: center;
  min-width: 20px;
  color: var(--text-3);
}
.bar.has .lead {
  color: var(--accent);
}
.chip {
  padding: 3px 8px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-soft);
  white-space: nowrap;
}
.bar input {
  flex: 1;
  min-width: 0;
  height: 100%;
  margin-left: 6px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
}
.bar input::placeholder {
  color: var(--text-3);
}
.paste {
  height: 36px;
  padding: 0 12px;
  font-size: 13px;
}
.bar .btn-primary {
  min-width: 72px;
  height: 40px;
}

/* ---------- 结果卡片 ---------- */
.card {
  display: grid;
  grid-template-columns: 168px 1fr;
  gap: 22px;
  margin-top: 20px;
  padding: 16px;
}
.cover {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  background:
    radial-gradient(120% 80% at 20% 10%, rgba(255, 220, 190, 0.55), transparent 60%),
    linear-gradient(160deg, #d98b68, #8c4a33 70%, #4a2a20);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.play {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  padding-left: 3px;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
}
.dur {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 1px 6px;
  border-radius: 5px;
  font: 500 11px/18px var(--font-mono);
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 4px 4px 0 0;
}
.title {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
}
.author {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-3);
}

.formats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}
.fmt {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-2);
  box-shadow: inset 0 0 0 1px var(--line-strong);
  transition:
    box-shadow 0.2s,
    background-color 0.2s,
    color 0.2s,
    transform 0.4s var(--ease-spring);
}
.fmt:hover {
  background: var(--sunken);
}
.fmt:active {
  transform: scale(0.96);
  transition-duration: 0.1s;
}
.fmt b {
  font-weight: 500;
  color: var(--text);
}
.fmt small {
  font-size: 12px;
  color: var(--text-3);
}
.fmt .dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px var(--line-strong);
  transition: box-shadow 0.35s var(--ease-spring);
}
.fmt.on {
  background: var(--accent-soft);
  box-shadow: inset 0 0 0 1.5px var(--accent);
}
.fmt.on .dot {
  box-shadow: inset 0 0 0 4.5px var(--accent);
}

.foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding-top: 20px;
}
.dir {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 45%;
  height: 32px;
  padding: 0 10px;
  margin-left: -10px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-2);
  transition: background-color 0.2s;
}
.dir:hover {
  background: var(--sunken);
}
.dir span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.prog {
  flex: 1;
  max-width: 280px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.saved {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ok);
}

/* ---------- 骨架屏 ---------- */
.sk {
  border-radius: 8px;
  background: linear-gradient(90deg, var(--sunken) 30%, var(--surface-hover) 50%, var(--sunken) 70%) 0 0 / 300% 100%;
  animation: shimmer 1.3s linear infinite;
}
.skeleton .cover {
  background: none;
}
.skeleton .cover.sk {
  background: linear-gradient(90deg, var(--sunken) 30%, var(--surface-hover) 50%, var(--sunken) 70%) 0 0 / 300% 100%;
}
.line {
  height: 18px;
  margin-bottom: 12px;
}
.block {
  height: 36px;
  width: 60%;
  margin-top: 12px;
}
@keyframes shimmer {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

/* ---------- 空状态 ---------- */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 56px;
  text-align: center;
}
.empty p {
  margin: 8px 0 0;
  font-size: 17px;
  color: var(--text-2);
}
.empty .btn {
  margin-top: 12px;
}
.badge {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: var(--text-3);
  background: var(--sunken);
}
.badge.err {
  color: var(--danger);
}
.platforms {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
}
.pf {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: var(--text-3);
  box-shadow: inset 0 0 0 1px var(--line);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.4s var(--ease-out);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
}
.swap-enter-active,
.swap-leave-active {
  transition: all 0.3s var(--ease-spring);
}
.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

@media (max-width: 640px) {
  .card {
    grid-template-columns: 1fr;
  }
  .cover {
    aspect-ratio: 16 / 9;
  }
}
</style>
