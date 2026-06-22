<script setup>
import { ref, onMounted } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import { useTheme } from '@/composables/useTheme.js'
import { backupFilename, buildBackupFile } from '@/share/backupFile.js'

const { mode: themeMode, setMode: setThemeMode } = useTheme()
const cards = useCardsStore()
const fileInput = ref(null)
const message = ref(null)
const error = ref(null)

// Mostra "Condividi vault" solo dove la condivisione di file è davvero supportata
// (di fatto: mobile Android/iOS). Su desktop resta solo "Esporta backup JSON".
// Feature detection con un file di prova text/plain (lo stesso tipo che condividiamo).
const canShareFiles = (() => {
  try {
    const probe = new File(['{}'], 'probe.txt', { type: 'text/plain' })
    return !!navigator.canShare?.({ files: [probe] })
  } catch {
    return false
  }
})()

// Garantisce che gli items siano in memoria, così onShare può costruire il dump
// in modo sincrono senza await prima di navigator.share().
onMounted(() => {
  if (!cards.items.length) cards.refresh()
})

function downloadFile(file) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function onExport() {
  error.value = null
  message.value = null
  try {
    const dump = await cards.exportBackup()
    downloadFile(buildBackupFile(dump, backupFilename()))
    message.value = `Esportate ${dump.cards.length} card.`
  } catch (e) {
    error.value = e.message
  }
}

// navigator.share() deve partire durante la transient activation del tap: il dump
// è costruito in modo sincrono (dagli items in memoria) e share() è la prima cosa
// invocata, senza await prima. Il file è text/plain perché Chrome Android blocca i
// file application/json nello share (NotAllowedError). Se lo share fallisce per
// qualunque motivo (tipo bloccato, policy…), si ripiega sul download.
async function onShare() {
  error.value = null
  message.value = null
  const dump = cards.exportBackupSync()
  const file = buildBackupFile(dump, backupFilename(new Date(), 'txt'), 'text/plain')
  try {
    await navigator.share({
      files: [file],
      title: 'Fidelity Card',
      text: 'Backup delle mie fidelity card',
    })
    message.value = `Vault condiviso (${dump.cards.length} card).`
  } catch (e) {
    // Annullamento dell'utente: nessun errore.
    if (e?.name === 'AbortError') return
    downloadFile(file)
    message.value = 'Condivisione non riuscita: backup scaricato, invialo manualmente.'
  }
}

async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  error.value = null
  message.value = null
  try {
    const text = await file.text()
    const dump = JSON.parse(text)
    const result = await cards.importBackup(dump)
    message.value = `Importate ${result.inserted} card (${result.skipped} duplicati saltati).`
  } catch (e) {
    error.value = e.message
  }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 600px">
    <h2 class="text-h5 mb-3">Impostazioni</h2>

    <h3 class="text-subtitle-1 mb-2">Tema</h3>
    <v-list density="comfortable" class="mb-4">
      <v-list-item :active="themeMode === 'system'" @click="setThemeMode('system')">
        <template #prepend><v-icon>mdi-theme-light-dark</v-icon></template>
        <v-list-item-title>Sistema</v-list-item-title>
      </v-list-item>
      <v-list-item :active="themeMode === 'light'" @click="setThemeMode('light')">
        <template #prepend><v-icon>mdi-weather-sunny</v-icon></template>
        <v-list-item-title>Chiaro</v-list-item-title>
      </v-list-item>
      <v-list-item :active="themeMode === 'dark'" @click="setThemeMode('dark')">
        <template #prepend><v-icon>mdi-weather-night</v-icon></template>
        <v-list-item-title>Scuro</v-list-item-title>
      </v-list-item>
    </v-list>

    <h3 class="text-subtitle-1 mb-2">Backup</h3>
    <v-btn
      v-if="canShareFiles"
      block
      color="primary"
      prepend-icon="mdi-share-variant"
      @click="onShare"
    >
      Condividi vault
    </v-btn>
    <v-btn block :class="canShareFiles ? 'mt-2' : ''" prepend-icon="mdi-download" @click="onExport">
      Esporta backup JSON
    </v-btn>
    <v-btn
      block
      class="mt-2"
      variant="outlined"
      prepend-icon="mdi-upload"
      @click="fileInput?.click()"
    >
      Importa backup JSON
    </v-btn>
    <input
      ref="fileInput"
      type="file"
      accept="application/json,text/plain,.json,.txt"
      hidden
      @change="onImportFile"
    />

    <v-alert v-if="message" type="success" class="mt-3">{{ message }}</v-alert>
    <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
  </v-container>
</template>
