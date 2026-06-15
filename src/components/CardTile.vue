<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import IconaDisplay from './IconaDisplay.vue'

const props = defineProps({ card: { type: Object, required: true } })
const brand = computed(() => getBrand(props.card.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
</script>

<template>
  <v-card :to="{ name: 'card-detail', params: { id: card.id } }" class="card-tile" elevation="2">
    <div class="card-tile__band" :style="{ backgroundColor: bgColor }">
      <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="42" />
    </div>
    <v-card-text>
      <div class="text-subtitle-1 font-weight-medium text-truncate">{{ card.name }}</div>
      <div class="text-caption text-medium-emphasis text-truncate">
        {{ brand?.name ?? 'Personalizzato' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.card-tile__band {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  color: white;
}
</style>
