<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import { getBrand } from '@/brands/brands.js'
import { readableTextColor } from '@/utils/contrast.js'
import BarcodeDisplay from '@/components/BarcodeDisplay.vue'
import BarcodeFullscreen from '@/components/BarcodeFullscreen.vue'
import IconaDisplay from '@/components/IconaDisplay.vue'
import ShareDialog from '@/share/ShareDialog.vue'
import { useLogsStore } from '@/stores/logs.js'
import { useUsageLogger } from '@/composables/useUsageLogger.js'
import { formatCoords, mapUrl } from '@/utils/logFormat.js'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()
const card = ref(null)
const showShare = ref(false)
const showDelete = ref(false)
const showFull = ref(false)

const logs = useLogsStore()
const showClearLogs = ref(false)

// Registra l'apertura di questa card (gate 3s + GPS). Va chiamato in setup
// perché registra hook di lifecycle. Se la card non esiste, l'onMounted sotto
// fa redirect e lo unmount annulla il timer prima dei 3s → nessun log spurio.
useUsageLogger(route.params.id)

function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('it-IT')
}
function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

async function onClearLogs() {
  await logs.clearForCard(route.params.id)
  showClearLogs.value = false
}

const brand = computed(() => getBrand(card.value?.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
const fg = computed(() => readableTextColor(bgColor.value))

onMounted(async () => {
  card.value = await cards.get(route.params.id)
  if (!card.value) {
    router.replace({ name: 'cards' })
    return
  }
  logs.loadForCard(route.params.id)
})

async function onDelete() {
  await cards.remove(card.value.id)
  router.replace({ name: 'cards' })
}
</script>

<template>
  <v-container v-if="card" class="pa-4" style="max-width: 600px">
    <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="router.push({ name: 'cards' })" />
      <h2 class="font-display text-h5 ml-1 flex-grow-1 text-truncate">{{ card.name }}</h2>
    </div>

    <!-- card presentata -->
    <div class="present" :style="{ backgroundColor: bgColor, color: fg }">
      <div class="present__top">
        <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="40" />
        <span v-if="card.pinned" class="present__chip">
          <v-icon size="13">mdi-star</v-icon>
          In primo piano
        </span>
      </div>
      <div class="present__name">{{ card.name }}</div>
      <div class="present__brand">{{ brand?.name ?? 'Personalizzato' }}</div>
    </div>

    <!-- scan panel: tocca per ingrandire -->
    <button class="scan" type="button" @click="showFull = true">
      <BarcodeDisplay :value="card.barcode" :format="card.barcodeFormat" />
      <div class="scan__hint">
        <v-icon size="16">mdi-arrow-expand</v-icon>
        Tocca per ingrandire
      </div>
    </button>

    <v-list class="meta mt-4" lines="two" bg-color="surface" rounded="lg">
      <v-list-item>
        <v-list-item-title>Brand</v-list-item-title>
        <v-list-item-subtitle>{{ brand?.name ?? 'Personalizzato' }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>Tipo codice</v-list-item-title>
        <v-list-item-subtitle>{{ card.barcodeFormat }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="card.note">
        <v-list-item-title>Note</v-list-item-title>
        <v-list-item-subtitle style="white-space: pre-wrap">{{ card.note }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <v-btn
      class="mt-4"
      block
      color="primary"
      prepend-icon="mdi-share-variant"
      @click="showShare = true"
    >
      Condividi
    </v-btn>
    <div class="d-flex align-center mt-2">
      <v-btn
        variant="outlined"
        prepend-icon="mdi-pencil"
        :to="{ name: 'card-edit', params: { id: card.id } }"
      >
        Modifica
      </v-btn>
      <v-spacer />
      <v-btn variant="text" color="error" prepend-icon="mdi-delete" @click="showDelete = true">
        Elimina
      </v-btn>
    </div>

    <!-- cronologia aperture -->
    <div class="d-flex align-center mt-6 mb-2">
      <h3 class="text-subtitle-1 flex-grow-1">Cronologia aperture</h3>
      <v-btn
        v-if="logs.items.length"
        size="small"
        variant="text"
        color="error"
        prepend-icon="mdi-delete-sweep"
        @click="showClearLogs = true"
      >
        Cancella log
      </v-btn>
    </div>

    <div v-if="logs.items.length" class="logs">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">Data</th>
            <th class="text-left">Ora</th>
            <th class="text-left">Posizione</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs.items" :key="log.id">
            <td class="logs__date">{{ fmtDate(log.openedAt) }}</td>
            <td class="logs__time">{{ fmtTime(log.openedAt) }}</td>
            <td>
              <a
                v-if="log.lat != null && log.lng != null"
                class="log-loc"
                :href="mapUrl(log.lat, log.lng)"
                target="_blank"
                rel="noopener"
              >
                <v-icon size="13">mdi-map-marker</v-icon>
                {{ formatCoords(log.lat, log.lng) }}
              </a>
              <span v-else class="log-loc-empty">—</span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    <div v-else class="logs-empty">
      <v-icon size="26" class="logs-empty__icon">mdi-history</v-icon>
      <p class="logs-empty__text">Nessuna apertura registrata.</p>
    </div>

    <v-dialog v-model="showClearLogs" max-width="420">
      <v-card>
        <v-card-title>Cancellare i log di questa card?</v-card-title>
        <v-card-text>La cronologia delle aperture di questa card verrà eliminata.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showClearLogs = false">Annulla</v-btn>
          <v-btn color="error" @click="onClearLogs">Cancella</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ShareDialog v-if="showShare" :card="card" @close="showShare = false" />

    <BarcodeFullscreen
      v-if="showFull"
      :value="card.barcode"
      :format="card.barcodeFormat"
      :name="card.name"
      :brand-color="bgColor"
      @close="showFull = false"
    />

    <v-dialog v-model="showDelete" max-width="420">
      <v-card>
        <v-card-title>Eliminare la card?</v-card-title>
        <v-card-text>Questa operazione non è reversibile.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDelete = false">Annulla</v-btn>
          <v-btn color="error" @click="onDelete">Elimina</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.present {
  border-radius: var(--r-card);
  padding: 18px;
  box-shadow: var(--tile-shadow);
  position: relative;
  overflow: hidden;
}
.present::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(0, 0, 0, 0.12));
  pointer-events: none;
}
.present__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.present__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 10px;
  border-radius: 999px;
}
.present__name {
  position: relative;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: -0.01em;
  margin-top: 30px;
}
.present__brand {
  position: relative;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.82;
}
.scan {
  display: block;
  width: 100%;
  margin-top: 12px;
  background: #ffffff;
  border: 1px solid var(--line, #e2e6ee);
  border-radius: var(--r-card);
  padding: 18px 16px 12px;
  cursor: pointer;
  box-shadow: var(--tile-shadow);
}
.scan__hint {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #6b7180;
  font-size: 0.78rem;
  font-weight: 600;
}
/* La cronologia è un "surface card" sorella di .meta / .scan: stesso raggio,
   stessa ombra, hairline che si adatta al tema (chiaro/scuro) tramite i token
   di bordo nativi di Vuetify invece del --line (solo chiaro). */
.logs {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--r-card);
  box-shadow: var(--tile-shadow);
  overflow: hidden;
}
.logs :deep(.v-table) {
  background: transparent;
  border-radius: inherit;
}
.logs :deep(.v-table__wrapper) {
  max-height: 340px;
  overflow-y: auto;
}
/* Header = etichette dati: maiuscoletto discreto, sticky durante lo scroll. */
.logs :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 40px !important;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  font-size: 0.68rem !important;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
}
.logs :deep(tbody td) {
  height: 46px !important;
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.55)) !important;
  font-size: 0.9rem;
}
.logs :deep(tbody tr:last-child td) {
  border-bottom: none !important;
}
.logs :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.035);
}
.logs :deep(.logs__date) {
  font-weight: 600;
}
/* Ora con cifre tabellari così le colonne restano allineate. */
.logs :deep(.logs__time) {
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

/* Link GPS: pill indaco tappabile con affordance chiara, non un link blu grezzo. */
.log-loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 7px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  text-decoration: none;
  transition: background 0.15s ease;
}
.log-loc:hover {
  background: rgba(var(--v-theme-primary), 0.18);
}
.log-loc:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.log-loc-empty {
  color: rgba(var(--v-theme-on-surface), 0.38);
}

/* Stato vuoto: placeholder calmo e centrato, stesso raggio delle altre superfici. */
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
