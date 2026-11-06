<script setup>
// OpenAll 的标志：一枚放射星芒
defineProps({ size: { type: [Number, String], default: 22 }, spin: Boolean })
const rays = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5]
const len = (i) => (i % 2 ? 7.2 : 10)
</script>

<template>
  <svg class="spark" :class="{ spin }" :width="size" :height="size" viewBox="-12 -12 24 24" aria-hidden="true">
    <g stroke="currentColor" stroke-linecap="round">
      <line
        v-for="(deg, i) in rays"
        :key="deg"
        x1="0"
        :y1="-len(i)"
        x2="0"
        :y2="len(i)"
        :stroke-width="i % 2 ? 2 : 2.6"
        :transform="`rotate(${deg})`"
      />
    </g>
  </svg>
</template>

<style scoped>
.spark {
  color: var(--accent);
  flex: none;
  transition: transform 0.9s var(--ease-spring);
}
.spin {
  animation: spark-spin 2.4s var(--ease-out) infinite;
}
@keyframes spark-spin {
  to {
    transform: rotate(180deg);
  }
}
</style>
