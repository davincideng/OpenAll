<script setup>
// 统一的线性图标集（24 网格，1.6 描边），新增图标直接往 paths 里加
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.6 }
})

const paths = {
  eraser:
    'M7.5 19.5h12M4.9 14.6l8.7-8.7a2 2 0 0 1 2.8 0l2.7 2.7a2 2 0 0 1 0 2.8l-7.6 7.6a2 2 0 0 1-1.4.6H8.6a2 2 0 0 1-1.4-.6l-2.3-2.3a1.5 1.5 0 0 1 0-2.1ZM9.2 10.3l5.5 5.5',
  download: 'M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 19.5h14',
  'arrow-left': 'M19 12H5m0 0 6-6m-6 6 6 6',
  'arrow-right': 'M5 12h14m0 0-6-6m6 6-6 6',
  'arrow-up': 'M12 19V5m0 0-6 6m6-6 6 6',
  search: 'm20 20-4.2-4.2M17.5 10.75a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z',
  link: 'M10 14a4 4 0 0 0 5.66 0l3.17-3.17a4 4 0 0 0-5.66-5.66l-1.1 1.1M14 10a4 4 0 0 0-5.66 0l-3.17 3.17a4 4 0 0 0 5.66 5.66l1.1-1.1',
  clipboard:
    'M9 4.5h6M9 4.5a1.5 1.5 0 0 0 0 3h6a1.5 1.5 0 0 0 0-3M9 4.5H7.5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2H15',
  folder: 'M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2.2h7.4a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-10Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  image:
    'M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11ZM4.5 15.5l4-4 4.5 4.5M13 14l2-2 4.5 4.5M15.5 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
  video: 'M4 7.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9ZM16 10.5l4-2.5v8l-4-2.5',
  upload: 'M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v2.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V15',
  sun: 'M12 3v1.5M12 19.5V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.5M19.5 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z',
  wand: 'm4 20 11-11m0 0 2-2m-2 2 2 2M17 4v2M20 7h-2M19.5 4.5 18 6M9 4l.5 1.5L11 6l-1.5.5L9 8l-.5-1.5L7 6l1.5-.5L9 4Z',
  crop: 'M7 3v13a1 1 0 0 0 1 1h13M3 7h13a1 1 0 0 1 1 1v13',
  trash: 'M5 7h14M10 7V5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V7m3.5 0-.7 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 7',
  refresh: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4',
  sparkle: 'M12 3.5c.4 4.2 2.3 6.1 6.5 6.5-4.2.4-6.1 2.3-6.5 6.5-.4-4.2-2.3-6.1-6.5-6.5 4.2-.4 6.1-2.3 6.5-6.5Z',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  clock: 'M12 7.5V12l3 2M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
  user: 'M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 20c.8-3.4 3.6-5.5 7-5.5s6.2 2.1 7 5.5',
  alert: 'M12 8.5v4.5M12 16.5v.01M10.3 4.3 3.2 17a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z'
}
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>

<style scoped>
.icon {
  flex: none;
  display: block;
}
</style>
