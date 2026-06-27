<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import WalletCard from '@/components/WalletCard.vue'

const cards = useCardsStore()
onMounted(cards.refresh)

// Wallet: una sola carta espansa alla volta.
const openId = ref(null)

// Quando i filtri lasciano un solo risultato (es. ricerca con un match),
// la apriamo automaticamente: il codice è pronto senza un tap in più.
// Legato all'id dell'unico match — non si riapre a ogni tasto se lo chiudi.
const soleMatchId = computed(() => (cards.filtered.length === 1 ? cards.filtered[0].id : null))
watch(soleMatchId, (id) => {
  if (id) openId.value = id
})

function onToggle(id) {
  openId.value = openId.value === id ? null : id
}

function onTogglePin(id) {
  cards.togglePin(id)
}
</script>

<template>
  <v-container class="pa-4" style="max-width: 520px">
    <h1 class="font-display text-h5 mb-4">Le tue card</h1>

    <v-text-field
      v-model="cards.search"
      prepend-inner-icon="mdi-magnify"
      placeholder="Cerca per nome o brand"
      bg-color="surface"
      clearable
      hide-details
      class="mb-5"
    />

    <v-progress-linear v-if="cards.loading" indeterminate class="mb-3" />

    <div v-if="cards.filtered.length" class="wallet">
      <WalletCard
        v-for="c in cards.filtered"
        :key="c.id"
        :card="c"
        :open="openId === c.id"
        @toggle="onToggle"
        @toggle-pin="onTogglePin"
      />
    </div>

    <v-empty-state
      v-else-if="!cards.loading"
      icon="mdi-wallet-outline"
      color="primary"
      title="Nessuna card"
      text="Aggiungi la tua prima fidelity card con il pulsante 'Nuova'."
      class="mt-8"
    />
  </v-container>
</template>

<style scoped>
.wallet {
  display: flex;
  flex-direction: column;
  /* spazio per l'ombra della prima carta */
  padding-top: 4px;
}
</style>
