import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const offlineReady = ref(false)
// 'idle' | 'checking' | 'updating' | 'up-to-date' | 'error'
const updateCheckStatus = ref('idle')

let registration = null
let registered = false

// Con registerType:'autoUpdate' il nuovo service worker si attiva da solo e la
// pagina si ricarica automaticamente. Qui aggiungiamo check periodici e al
// ritorno in primo piano, così una PWA installata e sempre aperta non resta
// indietro (era il caso che bloccava gli aggiornamenti col vecchio 'prompt').
const UPDATE_INTERVAL_MS = 60 * 60 * 1000

export function initPwa() {
  if (registered) return
  registered = true
  registerSW({
    immediate: true,
    onOfflineReady() {
      offlineReady.value = true
    },
    onRegisteredSW(_swUrl, r) {
      registration = r || null
      if (!registration) return
      setInterval(() => {
        registration.update().catch(() => {})
      }, UPDATE_INTERVAL_MS)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {})
        }
      })
    },
  })
}

// Check manuale dal dialog versione. Con autoUpdate, se viene trovato un nuovo
// SW la pagina si ricaricherà da sola; segnaliamo lo stato all'utente.
export async function checkForUpdate() {
  if (!registration) {
    updateCheckStatus.value = 'error'
    return
  }
  updateCheckStatus.value = 'checking'
  try {
    await registration.update()
    const hasUpdate = !!(registration.installing || registration.waiting)
    updateCheckStatus.value = hasUpdate ? 'updating' : 'up-to-date'
  } catch {
    updateCheckStatus.value = 'error'
  }
}

export function resetCheckStatus() {
  updateCheckStatus.value = 'idle'
}

export function usePwaUpdate() {
  return { offlineReady, updateCheckStatus, checkForUpdate, resetCheckStatus }
}
