<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: { type: String, required: true },
  format: { type: String, required: true },
})

const canvas = ref(null)
const error = ref(null)

async function render() {
  error.value = null
  if (!canvas.value) return
  try {
    if (props.format === 'QR_CODE' || props.format === 'DATA_MATRIX') {
      await QRCode.toCanvas(canvas.value, props.value, {
        errorCorrectionLevel: 'M',
        width: Math.min(window.innerWidth - 32, 600),
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
      })
    } else {
      // barcode 1D: usa libreria solo a runtime per evitare bundle bloat
      const { default: JsBarcode } = await import('jsbarcode')
      const fmt = props.format.replace('_', '').toLowerCase() // EAN_13 -> ean13
      // jsbarcode richiede target SVG/canvas. Convertiamo nomi:
      const mapping = {
        ean13: 'EAN13',
        ean8: 'EAN8',
        code128: 'CODE128',
        code39: 'CODE39',
        upca: 'UPC',
        itf: 'ITF',
      }
      const jsbFormat = mapping[fmt] ?? 'CODE128'
      JsBarcode(canvas.value, props.value, {
        format: jsbFormat,
        width: 3,
        height: 160,
        displayValue: true,
        fontSize: 20,
        margin: 12,
        background: '#FFFFFF',
        lineColor: '#000000',
      })
    }
  } catch (e) {
    error.value = `Impossibile renderizzare il codice (${e.message})`
  }
}

onMounted(render)
watch(() => [props.value, props.format], render)
</script>

<template>
  <div class="d-flex flex-column align-center barcode-display">
    <canvas ref="canvas" />
    <v-alert v-if="error" type="warning" density="comfortable" class="mt-2">{{ error }}</v-alert>
  </div>
</template>

<style scoped>
.barcode-display canvas {
  max-width: 100%;
  height: auto;
}
</style>
