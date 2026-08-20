<script setup>
import { computed } from 'vue'
import { useNearbyOpen } from '@/composables/useNearbyOpen.js'
import { getBrand } from '@/brands/brands.js'
import { readableTextColor } from '@/utils/contrast.js'
import IconaDisplay from '@/components/IconaDisplay.vue'

const { suggestion, accept, ignoreHere, dismiss } = useNearbyOpen()

const candidates = computed(() => suggestion.value?.candidates?.filter((c) => c.card) ?? [])
const single = computed(() => (candidates.value.length === 1 ? candidates.value[0] : null))

// Stessa palette dello sfondo card in CardDetailView: il colore del brand fa
// riconoscere il negozio prima di leggere il nome.
function bg(candidate) {
  return getBrand(candidate.card.brandId)?.color ?? '#607D8B'
}
function fg(candidate) {
  return readableTextColor(bg(candidate))
}

// I metri esatti sarebbero una precisione finta: il fix stesso ha decine di
// metri di incertezza. Basta l'ordine di grandezza.
function distance(candidate) {
  const m = Math.round(candidate.distanceM)
  return m < 100 ? 'a pochi passi' : `a circa ${Math.round(m / 10) * 10} m`
}
</script>

<template>
  <v-bottom-sheet
    :model-value="candidates.length > 0"
    inset
    aria-labelledby="nearby-title"
    @update:model-value="dismiss()"
  >
    <v-card class="nearby">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" aria-hidden="true">mdi-map-marker-radius</v-icon>
        <span id="nearby-title" class="font-display nearby__title">
          {{ single ? `Sei da ${single.card.name}?` : 'Dove sei?' }}
        </span>
      </v-card-title>

      <v-card-text class="pt-0">
        <p class="text-caption text-medium-emphasis mb-4">
          {{
            single
              ? 'Se confermi, la prossima volta la tua carta si aprirà da sola qui.'
              : 'Ci sono più negozi tuoi qui intorno: scegli quale, e la prossima volta ci penso io.'
          }}
        </p>

        <v-btn
          v-for="candidate in candidates"
          :key="candidate.cardId"
          block
          size="large"
          class="nearby__option"
          :style="{ background: bg(candidate), color: fg(candidate) }"
          @click="accept(candidate)"
        >
          <IconaDisplay
            :icona="candidate.card.icona"
            :brand-id="candidate.card.brandId"
            :size="22"
            class="mr-3"
          />
          <span class="nearby__name">{{ candidate.card.name }}</span>
          <v-spacer />
          <span class="nearby__distance">{{ distance(candidate) }}</span>
        </v-btn>
      </v-card-text>

      <v-card-actions class="flex-column align-stretch pt-0">
        <v-btn variant="text" prepend-icon="mdi-map-marker-off" @click="ignoreHere()">
          No, non chiedere qui
        </v-btn>
        <v-btn variant="text" class="ml-0" @click="dismiss()">Non ora</v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<style scoped>
.nearby__title {
  font-size: 1.25rem;
  line-height: 1.2;
}
.nearby__option {
  text-transform: none;
  letter-spacing: normal;
}
/* Senza larghezza piena il contenuto del v-btn resta compatto e il v-spacer
   non spinge la distanza a destra: nome e distanza finiscono appiccicati. */
.nearby__option :deep(.v-btn__content) {
  width: 100%;
}
.nearby__option + .nearby__option {
  margin-top: 8px;
}
.nearby__name {
  font-weight: 600;
}
.nearby__distance {
  font-size: 0.78rem;
  opacity: 0.85;
  font-weight: 400;
}
/* I due pulsanti secondari stanno impilati: "non chiedere qui" è una scelta
   che si ricorda, "non ora" no, e affiancarli li farebbe sembrare equivalenti. */
.nearby :deep(.v-card-actions) > .v-btn + .v-btn {
  margin-top: 2px;
}
</style>
