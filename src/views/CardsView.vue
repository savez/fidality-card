<script setup>
import { onMounted, computed } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import { BRANDS } from '@/brands/brands.js'
import CardTile from '@/components/CardTile.vue'

const cards = useCardsStore()
onMounted(cards.refresh)

const brandOptions = computed(() => [
  { id: null, name: 'Tutti i brand' },
  ...BRANDS,
  { id: '__custom__', name: 'Personalizzati' }
])

function setBrand(b) {
  if (b?.id === '__custom__') cards.filterBrand = '__custom__'
  else cards.filterBrand = b?.id ?? null
}
</script>

<template>
  <v-container class="pa-3">
    <v-row dense>
      <v-col cols="12" sm="7">
        <v-text-field
          v-model="cards.search"
          prepend-inner-icon="mdi-magnify"
          label="Cerca per nome"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="5">
        <v-select
          :items="brandOptions"
          item-title="name"
          return-object
          label="Filtra brand"
          hide-details
          @update:model-value="setBrand"
        />
      </v-col>
    </v-row>

    <v-progress-linear v-if="cards.loading" indeterminate class="mt-2" />

    <v-row v-if="cards.filtered.length" class="mt-2">
      <v-col v-for="c in cards.filtered" :key="c.id" cols="6" sm="4" md="3">
        <CardTile :card="c" />
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
