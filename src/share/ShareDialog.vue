<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { encodePayload } from './payload.js'

const props = defineProps({ card: { type: Object, required: true } })
const emit = defineEmits(['close'])

const tab = ref('qr')
const qrCanvas = ref(null)
const url = ref('')
const error = ref(null)
const copied = ref(false)

onMounted(async () => {
  try {
    const encoded = encodePayload(props.card)
    url.value = `${window.location.origin}${window.location.pathname}#/import?d=${encoded}`
    if (qrCanvas.value) {
      await QRCode.toCanvas(qrCanvas.value, url.value, {
        errorCorrectionLevel: 'M', width: Math.min(window.innerWidth - 96, 360), margin: 1
      })
    }
  } catch (e) {
    error.value = e.message ?? 'Errore di generazione'
  }
})

async function copyLink() {
  await navigator.clipboard.writeText(url.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <v-dialog model-value="true" max-width="520" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Condividi card</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
      </v-card-title>

      <v-tabs v-model="tab" grow>
        <v-tab value="qr">QR</v-tab>
        <v-tab value="link">Link</v-tab>
      </v-tabs>

      <v-card-text>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-window v-else v-model="tab">
          <v-window-item value="qr">
            <div class="d-flex justify-center"><canvas ref="qrCanvas" /></div>
            <div class="text-caption text-center mt-2">
              Scansiona dall'altro telefono con la stessa app
            </div>
          </v-window-item>
          <v-window-item value="link">
            <v-textarea readonly :model-value="url" rows="4" />
            <v-btn block color="primary" prepend-icon="mdi-content-copy" @click="copyLink">
              {{ copied ? 'Copiato!' : 'Copia link' }}
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
