<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import { readableTextColor } from '@/utils/contrast.js'
import IconaDisplay from './IconaDisplay.vue'

const props = defineProps({
  // Array ordinato 1°→3° (max 3). Ogni elemento: { card, count }.
  top: { type: Array, required: true },
})

// Ordine visivo dei gradini: 2° a sinistra, 1° al centro, 3° a destra.
// Mostriamo solo le posizioni realmente presenti (1, 2 o 3 carte).
const steps = computed(() => {
  // Ordine visivo dei gradini in base a quante carte ci sono:
  // 3 → 2°·1°·3° (podio classico), 2 → 1°·2°, 1 → 1°.
  const n = props.top.length
  const order = n >= 3 ? [1, 0, 2] : n === 2 ? [0, 1] : [0]
  return order.filter((i) => props.top[i]).map((i) => ({ rank: i + 1, entry: props.top[i] }))
})

function bg(entry) {
  return getBrand(entry.card.brandId)?.color ?? '#607D8B'
}
function fg(entry) {
  return readableTextColor(bg(entry))
}
function heightPx(rank) {
  return rank === 1 ? 132 : rank === 2 ? 104 : 84
}
</script>

<template>
  <div class="podium" role="list" aria-label="Podio carte più usate">
    <div v-for="s in steps" :key="s.entry.card.id" class="col" role="listitem">
      <v-icon v-if="s.rank === 1" class="crown" color="amber" size="28">mdi-crown</v-icon>

      <div class="badge" :style="{ backgroundColor: bg(s.entry), color: fg(s.entry) }">
        <IconaDisplay :icona="s.entry.card.icona" :brand-id="s.entry.card.brandId" :size="34" />
      </div>

      <div class="name text-truncate">{{ s.entry.card.name }}</div>
      <div class="count">{{ s.entry.count }} usi</div>

      <div class="step" :class="`step--${s.rank}`" :style="{ height: heightPx(s.rank) + 'px' }">
        <span class="rank">{{ s.rank }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 8px 4px 0;
}
.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33%;
  max-width: 120px;
}
.crown {
  margin-bottom: 2px;
}
.badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  box-shadow: var(--tile-shadow, 0 2px 8px rgba(0, 0, 0, 0.2));
}
.name {
  font-weight: 700;
  font-size: 0.9rem;
  margin-top: 6px;
  max-width: 100%;
}
.count {
  font-size: 0.75rem;
  opacity: 0.75;
  margin-bottom: 6px;
}
.step {
  width: 100%;
  border-radius: 10px 10px 0 0;
  background: rgba(var(--v-theme-primary), 0.16);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
}
.step--1 {
  background: rgb(var(--v-theme-primary));
}
.step .rank {
  font-weight: 800;
  font-size: 1.1rem;
  color: rgb(var(--v-theme-on-surface));
}
.step--1 .rank {
  color: rgb(var(--v-theme-on-primary));
}
</style>
