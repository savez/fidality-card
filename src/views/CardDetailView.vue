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
import LogsTable from '@/components/LogsTable.vue'
import {
  hasBalance,
  balanceGroup,
  formatCents,
  consumedRatio,
  centsFromEuros,
  subtractCents,
} from '@/utils/balance.js'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()
const card = ref(null)
const showShare = ref(false)
const showDelete = ref(false)
const showFull = ref(false)
const showSpend = ref(false)
const spendEuro = ref('')

const showBalance = computed(() => hasBalance(card.value))
const isEmpty = computed(() => balanceGroup(card.value) === 'empty')
const balanceText = computed(() => formatCents(card.value?.balanceCents))
const consumed = computed(() => consumedRatio(card.value))

const logs = useLogsStore()
const showClearLogs = ref(false)

// Registra l'apertura di questa card (gate 3s + GPS). Va chiamato in setup
// perché registra hook di lifecycle. Se la card non esiste, l'onMounted sotto
// fa redirect e lo unmount annulla il timer prima dei 3s → nessun log spurio.
useUsageLogger(route.params.id)

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

async function onSpend() {
  const spent = Math.max(0, centsFromEuros(spendEuro.value || 0))
  const next = subtractCents(card.value.balanceCents, spent)
  const updated = await cards.update(card.value.id, { balanceCents: next })
  card.value = updated
  spendEuro.value = ''
  showSpend.value = false
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

    <div v-if="showBalance" class="balance-panel">
      <div class="balance-panel__row">
        <span class="balance-panel__label">Saldo residuo</span>
        <span v-if="isEmpty" class="balance-panel__badge">Esaurita</span>
      </div>
      <div class="balance-panel__amount">{{ balanceText }}</div>
      <v-progress-linear
        :model-value="consumed * 100"
        color="primary"
        height="6"
        rounded
        class="mb-3"
      />
      <v-btn
        block
        variant="tonal"
        prepend-icon="mdi-cash-minus"
        :disabled="isEmpty"
        @click="showSpend = true"
      >
        Registra spesa
      </v-btn>
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

    <LogsTable v-if="logs.items.length" :logs="logs.items" />
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

    <v-dialog v-model="showSpend" max-width="420">
      <v-card>
        <v-card-title>Registra una spesa</v-card-title>
        <v-card-text>
          <div class="mb-2 text-medium-emphasis">Saldo attuale: {{ balanceText }}</div>
          <v-text-field
            v-model="spendEuro"
            label="Importo speso (€)"
            type="number"
            inputmode="decimal"
            min="0"
            step="0.01"
            prefix="€"
            autofocus
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showSpend = false">Annulla</v-btn>
          <v-btn color="primary" @click="onSpend">Scala saldo</v-btn>
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
.balance-panel {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--r-card);
}
.balance-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.balance-panel__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.balance-panel__badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.12);
}
.balance-panel__amount {
  font-weight: 800;
  font-size: 1.6rem;
  letter-spacing: -0.02em;
  margin: 2px 0 10px;
}
</style>
