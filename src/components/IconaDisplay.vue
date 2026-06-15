<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'

const props = defineProps({
  icona: { type: String, default: null },
  brandId: { type: String, default: null },
  size: { type: [Number, String], default: 32 }
})

const FALLBACK = 'mdi-card-account-details'

const resolved = computed(() => {
  if (props.icona) {
    if (props.icona.startsWith('mdi-')) return { type: 'mdi', value: props.icona }
    return { type: 'emoji', value: props.icona }
  }
  const b = getBrand(props.brandId)
  if (b) return { type: 'mdi', value: b.iconDefault, color: b.color }
  return { type: 'mdi', value: FALLBACK }
})
</script>

<template>
  <v-icon v-if="resolved.type === 'mdi'" :size="size" :color="resolved.color">
    {{ resolved.value }}
  </v-icon>
  <span v-else :style="{ fontSize: typeof size === 'number' ? `${size}px` : size }">
    {{ resolved.value }}
  </span>
</template>
