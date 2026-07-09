<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decodePayload } from '@/share/payload.js'
import { useCardsStore } from '@/stores/cards.js'
import { getBrand } from '@/brands/brands.js'
import IconaDisplay from '@/components/IconaDisplay.vue'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()

const preview = ref(null)
const error = ref(null)
const saving = ref(false)

const brand = computed(() => getBrand(preview.value?.brandId))

onMounted(() => {
  const d = route.query.d
  if (!d || typeof d !== 'string') {
    error.value = 'Link di condivisione senza dati'
    return
  }
  try {
    preview.value = decodePayload(d)
  } catch (e) {
    error.value = e.message ?? 'Payload non valido'
  }
})

async function save() {
  saving.value = true
  try {
    const created = await cards.create(preview.value)
    router.replace({ name: 'card-detail', params: { id: created.id } })
  } catch (e) {
    error.value = e.message ?? 'Errore di salvataggio'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="pa-4" style="max-width: 600px">
    <h2 class="font-display text-h5 mb-4">Importa card</h2>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card v-if="preview" class="pa-4">
      <div class="d-flex align-center ga-3">
        <IconaDisplay :icona="preview.icona" :brand-id="preview.brandId" :size="56" />
        <div>
          <div class="text-h6">{{ preview.name }}</div>
          <div class="text-caption">
            {{ brand?.name ?? 'Personalizzato' }} · {{ preview.barcodeFormat }}
          </div>
        </div>
      </div>
      <div v-if="preview.note" class="text-body-2 mt-3" style="white-space: pre-wrap">
        {{ preview.note }}
      </div>
      <div class="d-flex mt-4">
        <v-btn variant="text" @click="router.replace({ name: 'cards' })">Annulla</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="save">Salva nel mio DB</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
