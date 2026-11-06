<script setup>
import Icon from './Icon.vue'
defineProps({ index: { type: Number, default: 0 } })
</script>

<template>
  <div class="soon" :style="{ '--i': index }">
    <span class="plus"><Icon name="plus" :size="20" /></span>
    <p class="serif">更多工具</p>
    <span class="eyebrow">正在路上</span>
  </div>
</template>

<style scoped>
.soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 220px;
  border-radius: 20px;
  color: var(--text-3);
  border: 1.5px dashed var(--line-strong);
  animation: rise 0.6s calc(var(--i) * 60ms + 80ms) var(--ease-out) backwards;
}
.plus {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-bottom: 6px;
  border-radius: 50%;
  background: var(--sunken);
}
p {
  margin: 0;
  font-size: 17px;
  color: var(--text-2);
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
}
</style>
