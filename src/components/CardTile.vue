<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import IconaDisplay from './IconaDisplay.vue'

const props = defineProps({ card: { type: Object, required: true } })
defineEmits(['toggle-pin'])

const brand = computed(() => getBrand(props.card.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
</script>

<template>
  <v-card :to="{ name: 'card-detail', params: { id: card.id } }" class="card-tile" elevation="2">
    <div class="card-tile__band" :style="{ backgroundColor: bgColor }">
      <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="42" />

      <button
        class="pin-btn"
        type="button"
        :class="{ pinned: card.pinned }"
        :aria-label="card.pinned ? 'Rimuovi dal pin' : 'Pin in primo piano'"
        @click.stop.prevent="$emit('toggle-pin', card.id)"
      >
        <v-icon size="18">{{ card.pinned ? 'mdi-pin' : 'mdi-pin-outline' }}</v-icon>
      </button>
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
  position: relative;
}
.pin-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}
.pin-btn:hover {
  background: rgba(0, 0, 0, 0.35);
}
.pin-btn.pinned {
  background: rgba(255, 255, 255, 0.92);
  color: #1976d2;
}
.pin-btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 1px;
}
</style>
