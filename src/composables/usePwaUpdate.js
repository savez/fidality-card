import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const needRefresh = ref(false)
const offlineReady = ref(false)
let updateSW = null

export function initPwa() {
  if (updateSW) return
  updateSW = registerSW({
    onNeedRefresh() { needRefresh.value = true },
    onOfflineReady() { offlineReady.value = true }
  })
}

export function applyUpdate() {
  updateSW?.(true)
}

export function dismissUpdate() {
  needRefresh.value = false
}

export function usePwaUpdate() {
  return { needRefresh, offlineReady, applyUpdate, dismissUpdate }
}
