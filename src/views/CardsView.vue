<script setup>
import { onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import CardTile from '@/components/CardTile.vue'

const cards = useCardsStore()
onMounted(cards.refresh)

function onTogglePin(id) {
  cards.togglePin(id)
}
</script>

<template>
  <v-container class="pa-4" style="max-width: 760px">
    <v-text-field
      v-model="cards.search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Cerca per nome o brand"
      clearable
      hide-details
      class="mb-4"
    />

    <v-chip-group v-model="cards.filter" mandatory selected-class="text-primary" class="mb-3">
      <v-chip value="all" size="small" variant="tonal">Tutte</v-chip>
      <v-chip value="loyalty" size="small" variant="tonal">Fedeltà</v-chip>
      <v-chip value="active" size="small" variant="tonal">Con saldo</v-chip>
      <v-chip value="empty" size="small" variant="tonal">Esaurite</v-chip>
    </v-chip-group>

    <v-progress-linear v-if="cards.loading" indeterminate class="mb-3" />

    <div v-if="cards.filtered.length" class="card-grid">
      <CardTile v-for="c in cards.filtered" :key="c.id" :card="c" @toggle-pin="onTogglePin" />
    </div>

    <v-empty-state
      v-else-if="!cards.loading"
      icon="mdi-credit-card-off"
      title="Nessuna card"
      text="Aggiungi la tua prima fidelity card con il pulsante 'Nuova'."
      class="mt-8"
    />
  </v-container>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 600px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 860px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
