<script setup>
import { computed } from 'vue'
import { BRANDS } from './brands.js'

const props = defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const ALTRO = { id: null, name: 'Altro / Personalizzato', color: '#9E9E9E', iconDefault: 'mdi-tag' }
const options = computed(() => [ALTRO, ...BRANDS])

const value = computed({
  get: () => options.value.find(b => b.id === props.modelValue) ?? ALTRO,
  set: (b) => emit('update:modelValue', b?.id ?? null)
})
</script>

<template>
  <v-select
    v-model="value"
    :items="options"
    item-title="name"
    return-object
    label="Brand"
    prepend-inner-icon="mdi-store"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="item.raw.name">
        <template #prepend>
          <v-icon :color="item.raw.color">{{ item.raw.iconDefault }}</v-icon>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>
