<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat } from '@zxing/library'

const SCAN_TIMEOUT_MS = 20000

const emit = defineEmits(['decoded', 'error'])
const videoEl = ref(null)
let reader = null
let controls = null
let timeoutHandle = null
const cameraError = ref(null)
const status = ref('Inizializzazione…')
const timedOut = ref(false)

onMounted(async () => {
  try {
    reader = new BrowserMultiFormatReader()
    status.value = 'Inquadra il codice'
    timeoutHandle = setTimeout(() => {
      timedOut.value = true
      status.value = 'Difficoltà a riconoscere il codice — prova l\'inserimento manuale'
    }, SCAN_TIMEOUT_MS)
    controls = await reader.decodeFromVideoDevice(undefined, videoEl.value, (result, err) => {
      if (result) {
        const fmtNum = result.getBarcodeFormat?.()
        const fmtName = (fmtNum != null && BarcodeFormat[fmtNum]) || 'UNKNOWN'
        emit('decoded', {
          barcode: result.getText(),
          barcodeFormat: fmtName
        })
      }
    })
  } catch (e) {
    cameraError.value = e?.message ?? 'Impossibile accedere alla fotocamera'
    emit('error', e)
  }
})

onBeforeUnmount(() => {
  if (timeoutHandle) clearTimeout(timeoutHandle)
  try { controls?.stop() } catch {}
  try { reader?.reset?.() } catch {}
})
</script>

<template>
  <div class="scanner">
    <v-alert v-if="cameraError" type="error" density="comfortable">
      {{ cameraError }}
    </v-alert>
    <video v-show="!cameraError" ref="videoEl" class="scanner__video" playsinline muted autoplay />
    <div class="text-caption text-center mt-2">{{ status }}</div>
    <v-alert v-if="timedOut && !cameraError" type="warning" density="comfortable" class="mt-2">
      Non riusciamo a leggere il codice. Passa alla tab "Manuale" per inserirlo a mano.
    </v-alert>
  </div>
</template>

<style scoped>
.scanner__video {
  width: 100%;
  max-height: 60dvh;
  background: #000;
  border-radius: 8px;
}
</style>
