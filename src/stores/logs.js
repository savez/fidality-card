import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  addOpenLog,
  attachCoords as dbAttachCoords,
  listLogsByCard,
  deleteLogsByCard,
  clearAllLogs,
  countAllLogs,
} from '@/db/logs.js'

const STORAGE_KEY = 'fidality-card:usage-logging'

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export const useLogsStore = defineStore('logs', () => {
  const items = ref([])
  const loading = ref(false)
  const enabled = ref(readEnabled())

  async function loadForCard(cardId) {
    loading.value = true
    try {
      items.value = await listLogsByCard(cardId)
    } finally {
      loading.value = false
    }
  }

  async function recordOpen({ cardId, openedAt }) {
    const log = await addOpenLog({ cardId, openedAt })
    return log.id
  }

  async function attachCoords(id, coords) {
    await dbAttachCoords(id, coords)
  }

  async function clearForCard(cardId) {
    await deleteLogsByCard(cardId)
    items.value = []
  }

  async function clearAll() {
    await clearAllLogs()
    items.value = []
  }

  function setEnabled(next) {
    enabled.value = !!next
    try {
      localStorage.setItem(STORAGE_KEY, enabled.value ? 'on' : 'off')
    } catch {}
  }

  function count() {
    return countAllLogs()
  }

  return {
    items,
    loading,
    enabled,
    loadForCard,
    recordOpen,
    attachCoords,
    clearForCard,
    clearAll,
    setEnabled,
    count,
  }
})
