<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import { useLogsStore } from '@/stores/logs.js'
import { buildRanking, sinceFor } from '@/stats/ranking.js'
import { getBrand } from '@/brands/brands.js'
import PodiumChart from '@/components/PodiumChart.vue'

const cards = useCardsStore()
const logs = useLogsStore()
const allLogs = ref([])
const loaded = ref(false)
const range = ref('week')

const RANGES = [
  { value: 'week', label: 'Settimana' },
  { value: 'month', label: 'Mese' },
  { value: 'year', label: 'Anno' },
  { value: 'all', label: 'Totale' },
]

onMounted(async () => {
  if (cards.items.length === 0) await cards.refresh()
  allLogs.value = await logs.getAll()
  loaded.value = true
})

const ranking = computed(() =>
  buildRanking(allLogs.value, cards.items, sinceFor(range.value, Date.now()))
)
const top = computed(() => ranking.value.slice(0, 3))
const rest = computed(() => ranking.value.slice(3))
const maxCount = computed(() => ranking.value[0]?.count ?? 1)

function barPct(count) {
  return Math.round((count / maxCount.value) * 100)
}
function brandColor(card) {
  return getBrand(card.brandId)?.color ?? '#607D8B'
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 600px">
    <h2 class="text-h5 mb-3">Statistiche</h2>

    <div class="range-toggle mb-5" role="group" aria-label="Periodo">
      <v-btn
        v-for="r in RANGES"
        :key="r.value"
        :variant="range === r.value ? 'flat' : 'tonal'"
        :color="range === r.value ? 'primary' : undefined"
        class="range-toggle__btn"
        rounded="pill"
        size="small"
        @click="range = r.value"
      >
        {{ r.label }}
      </v-btn>
    </div>

    <template v-if="ranking.length > 0">
      <PodiumChart :top="top" />

      <v-list v-if="rest.length > 0" class="mt-4" density="comfortable">
        <v-list-item v-for="(item, i) in rest" :key="item.card.id">
          <template #prepend>
            <span class="mr-3 text-medium-emphasis">{{ i + 4 }}</span>
          </template>
          <v-list-item-title>{{ item.card.name }}</v-list-item-title>
          <v-progress-linear
            :model-value="barPct(item.count)"
            :color="brandColor(item.card)"
            height="6"
            rounded
            class="mt-1"
          />
          <template #append>
            <span class="text-body-2 text-medium-emphasis">{{ item.count }}</span>
          </template>
        </v-list-item>
      </v-list>
    </template>

    <v-card v-else-if="loaded" variant="tonal" class="pa-6 text-center mt-4">
      <v-icon size="48" class="mb-2">mdi-podium</v-icon>
      <div v-if="logs.enabled" class="text-body-1">
        Nessun utilizzo in questo periodo. Usa le tue carte per popolare il podio! 🏆
      </div>
      <div v-else class="text-body-1">
        Il tracciamento degli utilizzi è disattivato. Riattivalo dalle
        <router-link :to="{ name: 'settings' }">Impostazioni</router-link>
        per vedere le statistiche.
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
/* Selettore periodo: pillole spaziate, larghezza equa, vanno a capo su schermi
   stretti così non toccano mai il bordo. L'attivo è pieno (primary), gli altri
   tonali — distinguibili sia in tema chiaro che scuro. */
.range-toggle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.range-toggle__btn {
  flex: 1 1 auto;
  letter-spacing: 0;
}
</style>
