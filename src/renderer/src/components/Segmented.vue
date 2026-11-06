<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  options: { type: Array, required: true }, // [{ value, label }]
  modelValue: { type: [String, Number], default: null }
})
const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const thumb = ref({ left: '3px', width: '0px' })

async function place() {
  await nextTick()
  const i = props.options.findIndex((o) => o.value === props.modelValue)
  const btn = root.value?.querySelectorAll('button')[i]
  if (btn) thumb.value = { left: `${btn.offsetLeft}px`, width: `${btn.offsetWidth}px` }
}
onMounted(place)
watch(() => [props.modelValue, props.options], place, { deep: true })
</script>

<template>
  <div ref="root" class="segmented" role="tablist">
    <span class="thumb" :style="thumb" />
    <button
      v-for="o in options"
      :key="o.value"
      role="tab"
      :aria-selected="o.value === modelValue"
      :class="{ on: o.value === modelValue }"
      @click="emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>
