<script setup>
import { computed, ref } from 'vue'
import IconaDisplay from './IconaDisplay.vue'
import IconPicker from './IconPicker.vue'

const props = defineProps({
  modelValue: { type: String, default: undefined },
  brandId: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)

const subtitle = computed(() => {
  if (props.modelValue) return props.modelValue
  if (props.brandId) return 'Predefinita del brand'
  return 'Generica (nessun brand)'
})

function onPick(value) {
  emit('update:modelValue', value)
}

function onClear() {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div class="icon-picker-field mb-3">
    <div class="d-flex align-center ga-3">
      <div class="icon-preview">
        <IconaDisplay :icona="modelValue" :brand-id="brandId" :size="36" />
      </div>
      <div class="flex-grow-1">
        <div class="text-subtitle-2">Icona</div>
        <div class="text-caption text-medium-emphasis text-truncate">{{ subtitle }}</div>
      </div>
      <v-btn variant="outlined" prepend-icon="mdi-image-edit" @click="open = true">Scegli</v-btn>
      <v-btn
        v-if="modelValue"
        variant="text"
        icon="mdi-close"
        size="small"
        aria-label="Resetta a default brand"
        @click="onClear"
      />
    </div>

    <IconPicker v-model:open="open" :model-value="modelValue" @update:model-value="onPick" />
  </div>
</template>

<style scoped>
.icon-preview {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
