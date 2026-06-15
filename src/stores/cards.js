import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import {
  listCards as dbList,
  createCard as dbCreate,
  updateCard as dbUpdate,
  deleteCard as dbDelete,
  getCard as dbGet,
  exportAll as dbExportAll,
  importAll as dbImportAll
} from '@/db/cards.js'

export const useCardsStore = defineStore('cards', () => {
  const items = ref([])
  const loading = ref(false)
  const filterBrand = ref(null)
  const search = ref('')

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value.filter(c => {
      if (filterBrand.value === '__custom__') {
        if (c.brandId !== null) return false
      } else if (filterBrand.value && c.brandId !== filterBrand.value) {
        return false
      }
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
  })

  async function refresh() {
    const auth = useAuthStore()
    if (!auth.email) { items.value = []; return }
    loading.value = true
    try { items.value = await dbList(auth.email) }
    finally { loading.value = false }
  }

  async function create(input) {
    const auth = useAuthStore()
    const card = await dbCreate(auth.email, input)
    items.value.push(card)
    return card
  }

  async function update(id, patch) {
    const updated = await dbUpdate(id, patch)
    const idx = items.value.findIndex(c => c.id === id)
    if (idx >= 0) items.value.splice(idx, 1, updated)
    return updated
  }

  async function remove(id) {
    await dbDelete(id)
    items.value = items.value.filter(c => c.id !== id)
  }

  async function get(id) {
    const local = items.value.find(c => c.id === id)
    if (local) return local
    return dbGet(id)
  }

  async function exportBackup() {
    const auth = useAuthStore()
    return dbExportAll(auth.email)
  }

  async function importBackup(dump) {
    const auth = useAuthStore()
    const result = await dbImportAll(auth.email, dump)
    await refresh()
    return result
  }

  return {
    items, filtered, loading, filterBrand, search,
    refresh, create, update, remove, get, exportBackup, importBackup
  }
})
