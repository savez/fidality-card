<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import BarcodeDisplay from './BarcodeDisplay.vue'

defineProps({
  value: { type: String, required: true },
  format: { type: String, required: true },
  name: { type: String, default: '' },
  brandColor: { type: String, default: '#4b43f2' },
})
const emit = defineEmits(['close'])

// Tiene lo schermo acceso mentre mostri il codice alla cassa (dove supportato).
let wakeLock = null
onMounted(async () => {
  try {
    wakeLock = await navigator.wakeLock?.request('screen')
  } catch {
    wakeLock = null
  }
})
onBeforeUnmount(() => {
  try {
    wakeLock?.release()
  } catch {
    /* noop */
  }
})

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="fs" @click="emit('close')">
    <div class="fs__strip" :style="{ background: brandColor }" />
    <button class="fs__close" type="button" aria-label="Chiudi" @click.stop="emit('close')">
      <v-icon>mdi-close</v-icon>
    </button>
    <div class="fs__inner" @click.stop>
      <div class="fs__name">{{ name }}</div>
      <BarcodeDisplay :value="value" :format="format" :scale="1.6" />
      <div class="fs__code">{{ value }}</div>
    </div>
    <div class="fs__hint">Avvicina alla cassa · luminosità al massimo</div>
  </div>
</template>

<style scoped>
.fs {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgb(var(--v-theme-background));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  padding: 28px;
}
.fs__strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
}
.fs__close {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 16px);
  right: 16px;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform 0.12s ease;
}
.fs__close:active {
  transform: scale(0.94);
}
/* Il bianco resta confinato qui: lo scanner ottiene una generosa quiet-zone
   bianca attorno al codice anche in dark, senza accecare l'utente. */
.fs__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: var(--r-card);
  padding: 24px;
  /* Separa la card bianca dal backdrop chiaro (#eef1f6) in light; in dark
     aggiunge profondità senza danni. */
  box-shadow: 0 10px 40px -12px rgba(0, 0, 0, 0.35);
}
.fs__name {
  color: #14161a;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.fs__code {
  color: #111;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.18em;
  font-weight: 600;
}
.fs__hint {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 22px);
  color: rgba(var(--v-theme-on-background), 0.6);
  font-size: 0.82rem;
  text-align: center;
}
</style>
