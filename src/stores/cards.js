import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  listCards as dbList,
  createCard as dbCreate,
  updateCard as dbUpdate,
  deleteCard as dbDelete,
  getCard as dbGet,
  togglePin as dbTogglePin,
  exportAll as dbExportAll,
  importAll as dbImportAll,
  buildDump as dbBuildDump,
} from '@/db/cards.js'
import { getBrand } from '@/brands/brands.js'

export const useCardsStore = defineStore('cards', () => {
  const items = ref([])
  const loading = ref(false)
  const search = ref('')

  const filtered = computed(() => {
    // search può diventare null col clear (X) di Vuetify: coalescing a '' per non rompere il filtro.
    const q = (search.value ?? '').trim().toLowerCase()

    const matched = items.value.filter((c) => {
      if (!q) return true
      const cardName = c.name.toLowerCase()
      const brandName = getBrand(c.brandId)?.name?.toLowerCase() ?? ''
      return cardName.includes(q) || brandName.includes(q)
    })

    // Sort: pinned first, then alphabetical locale-aware (italian, case-insensitive).
    return matched.slice().sort((a, b) => {
      const ap = a.pinned ? 1 : 0
      const bp = b.pinned ? 1 : 0
      if (ap !== bp) return bp - ap
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' })
    })
  })

  async function refresh() {
    loading.value = true
    try {
      items.value = await dbList()
    } finally {
      loading.value = false
    }
  }

  async function create(input) {
    const card = await dbCreate(input)
    items.value.push(card)
    return card
  }

  async function update(id, patch) {
    const updated = await dbUpdate(id, patch)
    const idx = items.value.findIndex((c) => c.id === id)
    if (idx >= 0) items.value.splice(idx, 1, updated)
    return updated
  }

  async function togglePin(id) {
    const updated = await dbTogglePin(id)
    const idx = items.value.findIndex((c) => c.id === id)
    if (idx >= 0) items.value.splice(idx, 1, updated)
    return updated
  }

  async function remove(id) {
    await dbDelete(id)
    items.value = items.value.filter((c) => c.id !== id)
  }

  async function get(id) {
    const local = items.value.find((c) => c.id === id)
    if (local) return local
    return dbGet(id)
  }

  async function exportBackup() {
    return dbExportAll()
  }

  // Dump sincrono dagli items in memoria (per navigator.share, che esige
  // una transient activation senza await intermedi).
  function exportBackupSync() {
    return dbBuildDump(items.value.map((c) => ({ ...c })))
  }

  async function importBackup(dump) {
    const result = await dbImportAll(dump)
    await refresh()
    return result
  }

  return {
    items,
    filtered,
    loading,
    search,
    refresh,
    create,
    update,
    togglePin,
    remove,
    get,
    exportBackup,
    exportBackupSync,
    importBackup,
  }
})
