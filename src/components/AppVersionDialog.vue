<script setup>
import { watch } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?.?.?'
const changelogUrl = 'https://github.com/savez/fidality-card/releases'

const { updateCheckStatus, checkForUpdate, applyUpdate, resetCheckStatus } = usePwaUpdate()

// Quando il dialog si chiude, resettiamo lo stato di check così la prossima apertura è pulita.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) resetCheckStatus()
  }
)

function close() {
  emit('update:modelValue', false)
}
async function onCheckUpdate() {
  await checkForUpdate()
}
function onApplyUpdate() {
  applyUpdate()
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Fidelity Card</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Chiudi" @click="close" />
      </v-card-title>

      <v-card-text>
        <div class="text-h4 font-weight-bold mb-2" style="font-family: ui-monospace, monospace">
          v{{ version }}
        </div>
        <div class="text-caption text-medium-emphasis mb-4">PWA Vue 3 · open source · MIT</div>

        <v-divider class="mb-4" />

        <v-btn
          block
          variant="outlined"
          prepend-icon="mdi-text-box-outline"
          :href="changelogUrl"
          target="_blank"
          rel="noopener"
        >
          Vedi CHANGELOG
        </v-btn>

        <v-btn
          block
          color="primary"
          prepend-icon="mdi-cloud-download"
          class="mt-2"
          :loading="updateCheckStatus === 'checking'"
          :disabled="updateCheckStatus === 'checking'"
          @click="onCheckUpdate"
        >
          Cerca aggiornamenti
        </v-btn>

        <v-alert
          v-if="updateCheckStatus === 'up-to-date'"
          type="success"
          density="comfortable"
          class="mt-3"
        >
          L'app è aggiornata
        </v-alert>

        <v-alert
          v-else-if="updateCheckStatus === 'new-available'"
          type="info"
          density="comfortable"
          class="mt-3"
        >
          Nuova versione disponibile.
          <template #append>
            <v-btn size="small" variant="tonal" @click="onApplyUpdate">Ricarica</v-btn>
          </template>
        </v-alert>

        <v-alert
          v-else-if="updateCheckStatus === 'error'"
          type="error"
          density="comfortable"
          class="mt-3"
        >
          Impossibile verificare. Riprova.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Chiudi</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
