<script setup>
defineProps({
  percent: { type: Number, default: 0 },
  label: { type: String, default: '' },
  hint: { type: String, default: '' }
})
</script>

<template>
  <div class="progress">
    <div class="meta">
      <span class="label">{{ label }}</span>
      <span class="num">{{ Math.round(percent) }}<small>%</small></span>
    </div>
    <div class="track">
      <div class="fill" :style="{ width: `${Math.max(2, percent)}%` }" />
    </div>
    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.label {
  font-size: 13px;
  color: var(--text-2);
}
.num {
  font-family: var(--font-serif);
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}
.num small {
  font-size: 13px;
  margin-left: 1px;
  color: var(--text-3);
}
.track {
  height: 6px;
  border-radius: 6px;
  background: var(--sunken);
  overflow: hidden;
}
.fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 0.4s var(--ease-out);
  overflow: hidden;
}
.fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-100%);
  animation: sheen 1.4s ease-in-out infinite;
}
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
@keyframes sheen {
  to {
    transform: translateX(100%);
  }
}
</style>
