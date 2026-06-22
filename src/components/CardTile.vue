<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import { readableTextColor } from '@/utils/contrast.js'
import IconaDisplay from './IconaDisplay.vue'

const props = defineProps({ card: { type: Object, required: true } })
defineEmits(['toggle-pin'])

const brand = computed(() => getBrand(props.card.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
const fg = computed(() => readableTextColor(bgColor.value))
</script>

<template>
  <v-card
    :to="{ name: 'card-detail', params: { id: card.id } }"
    class="tile"
    :style="{ backgroundColor: bgColor, color: fg }"
    flat
  >
    <div class="tile__top">
      <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="38" />
      <button
        class="pin"
        type="button"
        :class="{ on: card.pinned }"
        :aria-label="card.pinned ? 'Rimuovi dal primo piano' : 'Metti in primo piano'"
        @click.stop.prevent="$emit('toggle-pin', card.id)"
      >
        <v-icon size="16">{{ card.pinned ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
      </button>
    </div>

    <div class="tile__name">
      <div class="nm text-truncate">{{ card.name }}</div>
      <div class="sub text-truncate">{{ brand?.name ?? 'Personalizzato' }}</div>
    </div>
  </v-card>
</template>

<style scoped>
.tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: var(--r-tile);
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-shadow: var(--tile-shadow);
}
/* sheen: leggero sweep diagonale, dà la sensazione di card fisica */
.tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(255, 255, 255, 0.04) 34%,
    rgba(0, 0, 0, 0.1) 100%
  );
  pointer-events: none;
}
.tile__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}
.tile__name {
  position: relative;
}
.nm {
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.sub {
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.82;
  margin-top: 1px;
}
.pin {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
  color: inherit;
  background: rgba(0, 0, 0, 0.16);
  transition: background-color 0.15s ease;
}
.pin.on {
  background: #ffffff;
  color: #14161a;
}
.pin:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
