import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const needRefresh = ref(false)
const offlineReady = ref(false)
// Possibili valori: 'idle' | 'checking' | 'up-to-date' | 'new-available' | 'error'
const updateCheckStatus = ref('idle')
let updateSW = null

export function initPwa() {
  if (updateSW) return
  updateSW = registerSW({
    onNeedRefresh() {
      needRefresh.value = true
    },
    onOfflineReady() {
      offlineReady.value = true
    },
  })
}

export function applyUpdate() {
  updateSW?.(true)
}

export function dismissUpdate() {
  needRefresh.value = false
}

export async function checkForUpdate() {
  if (!updateSW) {
    updateCheckStatus.value = 'error'
    return
  }
  updateCheckStatus.value = 'checking'
  const hadRefreshBefore = needRefresh.value
  try {
    // updateSW() senza argomenti forza un re-check del SW lato browser.
    // Se trova una nuova versione, l'handler onNeedRefresh impostato in initPwa()
    // metterà needRefresh.value = true. Aspettiamo un tick per dare tempo al callback.
    await updateSW()
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (needRefresh.value && !hadRefreshBefore) {
      updateCheckStatus.value = 'new-available'
    } else {
      updateCheckStatus.value = 'up-to-date'
    }
  } catch (e) {
    console.error('checkForUpdate failed', e)
    updateCheckStatus.value = 'error'
  }
}

export function resetCheckStatus() {
  updateCheckStatus.value = 'idle'
}

export function usePwaUpdate() {
  return {
    needRefresh,
    offlineReady,
    updateCheckStatus,
    applyUpdate,
    dismissUpdate,
    checkForUpdate,
    resetCheckStatus,
  }
}
