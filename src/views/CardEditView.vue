<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import BrandPicker from '@/brands/BrandPicker.vue'
import BarcodeScanner from '@/scan/BarcodeScanner.vue'
import IconPickerField from '@/components/IconPickerField.vue'
import { getBrand } from '@/brands/brands.js'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()

const isEdit = computed(() => !!route.params.id)
const tab = ref('manuale')
const saving = ref(false)
const error = ref(null)

const FORMATS = ['EAN_13', 'EAN_8', 'CODE_128', 'CODE_39', 'UPC_A', 'QR_CODE', 'DATA_MATRIX', 'ITF']

const form = reactive({
  name: '',
  brandId: null,
  barcode: '',
  barcodeFormat: 'CODE_128',
  icona: '',
  note: '',
})

onMounted(async () => {
  if (isEdit.value) {
    const c = await cards.get(route.params.id)
    if (c)
      Object.assign(form, {
        name: c.name,
        brandId: c.brandId,
        barcode: c.barcode,
        barcodeFormat: c.barcodeFormat,
        icona: c.icona ?? '',
        note: c.note ?? '',
      })
  }
})

watch(
  () => form.brandId,
  (newId, oldId) => {
    // Pre-fill name from brand only if name is empty or matches the previous brand's name
    const previousBrand = getBrand(oldId)
    const newBrand = getBrand(newId)
    if (!newBrand) return
    if (form.name.trim() === '' || form.name.trim() === previousBrand?.name) {
      form.name = newBrand.name
    }
  }
)

function onDecoded(payload) {
  form.barcode = payload.barcode
  form.barcodeFormat = payload.barcodeFormat
  tab.value = 'manuale'
}

const NOTE_MAX = 800
const isValid = computed(
  () =>
    form.name.trim().length >= 1 &&
    form.name.length <= 80 &&
    form.barcode.trim().length >= 1 &&
    form.barcode.length <= 256 &&
    (form.note?.length ?? 0) <= NOTE_MAX
)

async function save() {
  if (!isValid.value) return
  saving.value = true
  error.value = null
  try {
    const payload = {
      name: form.name.trim(),
      brandId: form.brandId,
      barcode: form.barcode.trim(),
      barcodeFormat: form.barcodeFormat,
      icona: form.icona?.trim() || undefined,
      note: form.note?.trim() || undefined,
    }
    let saved
    if (isEdit.value) saved = await cards.update(route.params.id, payload)
    else saved = await cards.create(payload)
    router.replace({ name: 'card-detail', params: { id: saved.id } })
  } catch (e) {
    error.value = e.message ?? 'Errore di salvataggio'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 700px">
    <h2 class="text-h5 mb-3">{{ isEdit ? 'Modifica card' : 'Nuova card' }}</h2>

    <v-tabs v-if="!isEdit" v-model="tab" grow class="mb-3">
      <v-tab value="scan">Scan</v-tab>
      <v-tab value="manuale">Manuale</v-tab>
    </v-tabs>

    <v-window v-if="!isEdit" v-model="tab" class="mb-3">
      <v-window-item value="scan">
        <BarcodeScanner v-if="tab === 'scan'" @decoded="onDecoded" />
      </v-window-item>
      <v-window-item value="manuale"><div /></v-window-item>
    </v-window>

    <v-form @submit.prevent="save">
      <v-text-field v-model="form.name" label="Nome card *" :counter="80" maxlength="80" required />
      <BrandPicker v-model="form.brandId" />
      <v-text-field v-model="form.barcode" label="Codice *" maxlength="256" required />
      <v-select v-model="form.barcodeFormat" :items="FORMATS" label="Formato codice" />
      <IconPickerField v-model="form.icona" :brand-id="form.brandId" />
      <v-textarea
        v-model="form.note"
        label="Note"
        :counter="NOTE_MAX"
        :maxlength="NOTE_MAX"
        rows="3"
      />

      <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>

      <div class="d-flex gap-2 mt-3">
        <v-btn variant="text" @click="router.back()">Annulla</v-btn>
        <v-spacer />
        <v-btn type="submit" color="primary" :disabled="!isValid" :loading="saving">Salva</v-btn>
      </div>
    </v-form>
  </v-container>
</template>
