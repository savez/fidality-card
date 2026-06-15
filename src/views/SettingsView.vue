<script setup>
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards.js'

const cards = useCardsStore()
const fileInput = ref(null)
const message = ref(null)
const error = ref(null)

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function onExport() {
  error.value = null; message.value = null
  try {
    const dump = await cards.exportBackup()
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fidelity-cards-${todayString()}.json`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    message.value = `Esportate ${dump.cards.length} card.`
  } catch (e) { error.value = e.message }
}

async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  error.value = null; message.value = null
  try {
    const text = await file.text()
    const dump = JSON.parse(text)
    const result = await cards.importBackup(dump)
    message.value = `Importate ${result.inserted} card (${result.skipped} duplicati saltati).`
  } catch (e) { error.value = e.message }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 600px">
    <h2 class="text-h5 mb-3">Impostazioni</h2>

    <h3 class="text-subtitle-1 mb-2">Backup</h3>
    <v-btn block prepend-icon="mdi-download" @click="onExport">Esporta backup JSON</v-btn>
    <v-btn block class="mt-2" variant="outlined" prepend-icon="mdi-upload" @click="fileInput?.click()">
      Importa backup JSON
    </v-btn>
    <input ref="fileInput" type="file" accept="application/json" hidden @change="onImportFile" />

    <v-alert v-if="message" type="success" class="mt-3">{{ message }}</v-alert>
    <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
  </v-container>
</template>
