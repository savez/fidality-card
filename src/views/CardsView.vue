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
  <v-container class="pa-3">
    <v-text-field
      v-model="cards.search"
      prepend-inner-icon="mdi-magnify"
      label="Cerca per nome o brand"
      clearable
      hide-details
    />

    <v-progress-linear v-if="cards.loading" indeterminate class="mt-2" />

    <v-row v-if="cards.filtered.length" class="mt-2">
      <v-col v-for="c in cards.filtered" :key="c.id" cols="6" sm="4" md="3">
        <CardTile :card="c" @toggle-pin="onTogglePin" />
      </v-col>
    </v-row>

    <v-empty-state
      v-else-if="!cards.loading"
      icon="mdi-credit-card-off"
      title="Nessuna card"
      text="Aggiungi la tua prima fidelity card con il pulsante 'Nuova'."
      class="mt-8"
    />
  </v-container>
</template>
