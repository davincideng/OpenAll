<script setup>
import Icon from '@/components/Icon.vue'
import { vPress } from '@/composables/vPress'

defineProps({
  tool: { type: Object, required: true },
  params: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['back', 'busy'])
</script>

<template>
  <section class="tool">
    <header class="head">
      <button v-press class="btn btn-ghost back" title="返回（Esc）" @click="emit('back')">
        <Icon name="arrow-left" :size="16" />
        <span>工具箱</span>
      </button>
      <div class="ident">
        <span class="glyph" :data-vt="`glyph-${tool.id}`"><Icon :name="tool.icon" :size="20" /></span>
        <div>
          <h1 class="title serif" :data-vt="`title-${tool.id}`">{{ tool.name }}</h1>
          <p class="desc">{{ tool.desc }}</p>
        </div>
      </div>
    </header>

    <div class="content">
      <component :is="tool.component" v-bind="params" @busy="emit('busy', $event)" />
    </div>
  </section>
</template>

<style scoped>
.tool {
  max-width: 1040px;
  margin: 0 auto;
  padding: 4px 40px 48px;
}
.head {
  margin-bottom: 28px;
}
.back {
  height: 30px;
  padding: 0 10px 0 8px;
  margin-left: -8px;
  font-size: 13px;
  font-weight: 400;
}
.back :deep(.icon) {
  transition: transform 0.4s var(--ease-spring);
}
.back:hover :deep(.icon) {
  transform: translateX(-3px);
}
.ident {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  animation: in 0.5s var(--ease-out) backwards;
}
.glyph {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  color: var(--accent);
  background: var(--accent-soft);
}
.title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  width: fit-content;
}
.desc {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-2);
}
.content {
  animation: in 0.55s 0.08s var(--ease-out) backwards;
}
@keyframes in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
