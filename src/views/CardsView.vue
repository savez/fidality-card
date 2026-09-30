<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import CardTile from '@/components/CardTile.vue'

const cards = useCardsStore()
onMounted(cards.refresh)

function onTogglePin(id) {
  cards.togglePin(id)
}

const COLLAPSED_KEY = 'fidality-card:documents-collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

// Comodità di chi guarda, non stato da garantire: se lo storage non c'è, la
// sezione resta semplicemente aperta.
const docsCollapsed = ref(readCollapsed())
function toggleDocs() {
  docsCollapsed.value = !docsCollapsed.value
  try {
    localStorage.setItem(COLLAPSED_KEY, docsCollapsed.value ? '1' : '0')
  } catch {}
}

// I chip filtrano per saldo: con un chip diverso da "Tutte" i documenti non c'entrano.
const showDocs = computed(() => cards.filter === 'all' && cards.filteredDocuments.length > 0)
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

    <section v-if="showDocs" class="docs mt-6">
      <div class="d-flex align-center mb-2">
        <v-btn
          variant="text"
          class="px-1 text-subtitle-1"
          :append-icon="docsCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
          :aria-expanded="!docsCollapsed"
          @click="toggleDocs"
        >
          Documenti ({{ cards.filteredDocuments.length }})
        </v-btn>
        <v-spacer />
        <v-btn
          icon="mdi-plus"
          variant="text"
          size="small"
          aria-label="Nuovo documento"
          :to="{ name: 'card-new', query: { category: 'document' } }"
        />
      </div>
      <div v-if="!docsCollapsed" class="card-grid">
        <CardTile
          v-for="c in cards.filteredDocuments"
          :key="c.id"
          :card="c"
          @toggle-pin="onTogglePin"
        />
      </div>
    </section>

    <v-empty-state
      v-if="!cards.loading && !cards.filtered.length && !showDocs"
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
