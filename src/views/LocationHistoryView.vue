<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import { listAllLogs } from '@/db/logs.js'
import { groupLogsByCard } from '@/utils/groupLogsByCard.js'
import { useGeoPermission } from '@/composables/useGeoPermission.js'
import LogsMap from '@/components/LogsMap.vue'
import LogsTable from '@/components/LogsTable.vue'

const router = useRouter()
const cards = useCardsStore()
const logs = ref([])
const loading = ref(true)

const { state: geoPermission } = useGeoPermission()

onMounted(async () => {
  if (!cards.items.length) await cards.refresh()
  logs.value = await listAllLogs()
  loading.value = false
})

const groups = computed(() => groupLogsByCard(cards.items, logs.value))

const cardsWithPosition = computed(() => groups.value.filter((g) => g.latestWithCoords).length)

const mapPoints = computed(() =>
  groups.value
    .filter((g) => g.latestWithCoords)
    .map((g) => ({
      cardId: g.card.id,
      name: g.card.name,
      brandId: g.card.brandId,
      icona: g.card.icona,
      lat: g.latestWithCoords.lat,
      lng: g.latestWithCoords.lng,
      openedAt: g.latestWithCoords.openedAt,
    }))
)

function panelCount(n) {
  return `${n} apertur${n === 1 ? 'a' : 'e'}`
}
</script>

<template>
  <v-container class="pa-4" style="max-width: 600px">
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.back()" />
      <h2 class="font-display text-h5 ml-1">Storico posizioni</h2>
    </div>

    <template v-if="!loading">
      <p v-if="cards.items.length" class="text-body-2 text-medium-emphasis mb-4">
        {{ cardsWithPosition }} card su {{ cards.items.length }} ha{{
          cardsWithPosition === 1 ? '' : 'nno'
        }}
        una posizione salvata.
      </p>

      <LogsMap v-if="mapPoints.length" :points="mapPoints" class="mb-6" />

      <v-alert
        v-else-if="geoPermission === 'denied'"
        type="warning"
        variant="tonal"
        icon="mdi-map-marker-off"
        class="mb-6"
      >
        Il permesso di posizione è disattivato per questo sito. Attivalo nelle impostazioni del
        browser per iniziare a salvare le posizioni delle prossime aperture.
      </v-alert>

      <div v-else class="logs-empty mb-6">
        <v-icon size="26" class="logs-empty__icon">mdi-map-marker-outline</v-icon>
        <p class="logs-empty__text">Nessuna posizione salvata finora.</p>
      </div>

      <template v-if="groups.length">
        <h3 class="text-subtitle-1 mb-2">Cronologia per card</h3>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel v-for="group in groups" :key="group.card.id">
            <v-expansion-panel-title>
              {{ group.card.name }} ({{ panelCount(group.logs.length) }})
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <LogsTable :logs="group.logs" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>

      <div v-else class="logs-empty">
        <v-icon size="26" class="logs-empty__icon">mdi-history</v-icon>
        <p class="logs-empty__text">Nessuna apertura registrata ancora.</p>
      </div>
    </template>
  </v-container>
</template>

<style scoped>
/* Stesso stile dello stato vuoto già usato in CardDetailView.vue/LogsTable — placeholder
   calmo e centrato, stesso raggio delle altre superfici. */
.logs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px 20px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--r-card);
  text-align: center;
}
.logs-empty__icon {
  color: rgba(var(--v-theme-on-surface), 0.4);
}
.logs-empty__text {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
