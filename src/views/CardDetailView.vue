<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import { getBrand } from '@/brands/brands.js'
import BarcodeDisplay from '@/components/BarcodeDisplay.vue'
import ShareDialog from '@/share/ShareDialog.vue'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()
const card = ref(null)
const showShare = ref(false)
const showDelete = ref(false)

const brand = computed(() => getBrand(card.value?.brandId))

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
  <v-container v-if="card" class="pa-3" style="max-width: 600px">
    <div class="d-flex align-center mb-3">
      <v-btn icon="mdi-arrow-left" @click="router.back()" variant="text" />
      <h2 class="text-h5 ml-2 flex-grow-1 text-truncate">{{ card.name }}</h2>
    </div>

    <v-card class="pa-4 d-flex flex-column align-center" elevation="2">
      <BarcodeDisplay :value="card.barcode" :format="card.barcodeFormat" />
      <div class="text-caption mt-2">{{ card.barcodeFormat }}</div>
    </v-card>

    <v-list class="mt-3" lines="two">
      <v-list-item>
        <v-list-item-title>Brand</v-list-item-title>
        <v-list-item-subtitle>{{ brand?.name ?? 'Personalizzato' }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="card.note">
        <v-list-item-title>Note</v-list-item-title>
        <v-list-item-subtitle style="white-space: pre-wrap">{{ card.note }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <div class="d-flex gap-2 mt-4">
      <v-btn block color="primary" prepend-icon="mdi-share-variant" @click="showShare = true">Condividi</v-btn>
    </div>
    <div class="d-flex gap-2 mt-2">
      <v-btn variant="outlined" prepend-icon="mdi-pencil" :to="{ name: 'card-edit', params: { id: card.id } }">Modifica</v-btn>
      <v-spacer />
      <v-btn variant="text" color="error" prepend-icon="mdi-delete" @click="showDelete = true">Elimina</v-btn>
    </div>

    <ShareDialog v-if="showShare" :card="card" @close="showShare = false" />

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
