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

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()
const card = ref(null)
const showShare = ref(false)
const showDelete = ref(false)
const showFull = ref(false)

const brand = computed(() => getBrand(card.value?.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
const fg = computed(() => readableTextColor(bgColor.value))

onMounted(async () => {
  card.value = await cards.get(route.params.id)
  if (!card.value) router.replace({ name: 'cards' })
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
    <div
      class="present"
      :style="{
        backgroundColor: bgColor,
        color: fg,
        boxShadow: `0 1px 2px rgba(17,20,26,.05), 0 18px 30px -16px ${bgColor}66`,
      }"
    >
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
  position: relative;
  overflow: hidden;
}
.present::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0) 46%,
    rgba(0, 0, 0, 0.08) 100%
  );
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
  background: rgb(var(--v-theme-surface));
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  padding: 18px 16px 12px;
  cursor: pointer;
  box-shadow: var(--tile-shadow);
  transition: transform 0.12s ease;
}
.scan:active {
  transform: scale(0.985);
}
.scan__hint {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.78rem;
  font-weight: 600;
}

/* Meta come scheda tecnica: etichetta muta in maiuscoletto, valore prominente. */
.meta :deep(.v-list-item-title) {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.6;
}
.meta :deep(.v-list-item-subtitle) {
  font-size: 0.95rem;
  font-weight: 600;
  opacity: 1;
  color: rgb(var(--v-theme-on-surface));
}
</style>
