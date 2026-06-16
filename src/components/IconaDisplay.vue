<script setup>
import { computed } from 'vue'
import { resolveIcon } from '@/icons/resolve.js'

const props = defineProps({
  icona: { type: String, default: null },
  brandId: { type: String, default: null },
  size: { type: [Number, String], default: 32 },
})

const resolved = computed(() => resolveIcon({ icona: props.icona, brandId: props.brandId }))
</script>

<template>
  <v-icon v-if="resolved.type === 'mdi'" :size="size">
    {{ resolved.value }}
  </v-icon>
  <span v-else :style="{ fontSize: typeof size === 'number' ? `${size}px` : size }">
    {{ resolved.value }}
  </span>
</template>
