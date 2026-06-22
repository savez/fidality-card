<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import BrandPicker from '@/brands/BrandPicker.vue'
import BarcodeScanner from '@/scan/BarcodeScanner.vue'
import IconPickerField from '@/components/IconPickerField.vue'
import { getBrand } from '@/brands/brands.js'
import { inferBarcodeFormat, SUPPORTED_FORMATS, FORMAT_LABELS } from '@/scan/barcodeFormat.js'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()

const isEdit = computed(() => !!route.params.id)
const tab = ref('manuale')
const saving = ref(false)
const error = ref(null)

const form = reactive({
  name: '',
  brandId: null,
  barcode: '',
  barcodeFormat: 'CODE_128',
  icona: undefined,
  note: '',
})

// Il tipo di barcode viene dedotto automaticamente dal valore; resta nascosto
// finché l'utente non apre "Avanzate". autoFormat=false quando il tipo è
// autorevole (scansione, card esistente, override manuale): in quei casi non
// va sovrascritto dalla deduzione.
const advancedFormat = ref(false)
const autoFormat = ref(true)
const formatItems = SUPPORTED_FORMATS.map((value) => ({
  value,
  title: FORMAT_LABELS[value] ?? value,
}))
const formatLabel = computed(() => FORMAT_LABELS[form.barcodeFormat] ?? form.barcodeFormat)

onMounted(async () => {
  if (isEdit.value) {
    const c = await cards.get(route.params.id)
    if (c) {
      Object.assign(form, {
        name: c.name,
        brandId: c.brandId,
        barcode: c.barcode,
        barcodeFormat: c.barcodeFormat,
        icona: c.icona ?? undefined,
        note: c.note ?? '',
      })
      // Card esistente: il formato salvato è autorevole, non auto-dedurre.
      autoFormat.value = false
    }
  }
})

// Auto-deduzione del tipo barcode dal valore digitato (solo finché non è bloccato).
watch(
  () => form.barcode,
  (value) => {
    if (autoFormat.value) form.barcodeFormat = inferBarcodeFormat(value)
  }
)

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
  // Formato auto-rilevato dallo scanner: autorevole, non sovrascrivere.
  autoFormat.value = false
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

      <div class="mb-2">
        <div class="d-flex align-center text-caption text-medium-emphasis">
          <span>Tipo codice: {{ formatLabel }}</span>
          <v-spacer />
          <v-btn
            variant="text"
            size="small"
            density="comfortable"
            @click="advancedFormat = !advancedFormat"
          >
            {{ advancedFormat ? 'Nascondi' : 'Modifica' }}
          </v-btn>
        </div>
        <v-select
          v-if="advancedFormat"
          v-model="form.barcodeFormat"
          :items="formatItems"
          item-title="title"
          item-value="value"
          label="Formato codice"
          density="comfortable"
          class="mt-1"
          @update:model-value="autoFormat = false"
        />
      </div>
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
