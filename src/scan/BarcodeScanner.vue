<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat } from '@zxing/library'

const emit = defineEmits(['decoded', 'error'])
const videoEl = ref(null)
let reader = null
let controls = null
const cameraError = ref(null)
const status = ref('Inizializzazione…')

onMounted(async () => {
  try {
    reader = new BrowserMultiFormatReader()
    status.value = 'Inquadra il codice'
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
