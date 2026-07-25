import { ref } from 'vue'

const DISMISSED_KEY = 'fidality-card:pwa-install-dismissed-at'
const INSTALLED_KEY = 'fidality-card:pwa-install-installed'
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000

const canInstall = ref(false)
const platform = ref(null) // 'android' | 'ios' | null

let deferredPrompt = null
let initialized = false

function isStandalone() {
  const mediaMatch = window.matchMedia?.('(display-mode: standalone)').matches === true
  return mediaMatch || window.navigator.standalone === true
}

function isIos() {
  const ua = window.navigator.userAgent
  const isAppleTouchUa = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ si spaccia per desktop Safari (UA "Macintosh"): si riconosce
  // dalla combinazione platform "MacIntel" + schermo touch, che un vero Mac non ha.
  const isModernIpad =
    window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
  return isAppleTouchUa || isModernIpad
}

function isSnoozed() {
  let raw
  try {
    raw = localStorage.getItem(DISMISSED_KEY)
  } catch {
    return false
  }
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (!Number.isFinite(dismissedAt)) return false
  return Date.now() - dismissedAt < SNOOZE_MS
}

function isPermanentlyInstalled() {
  try {
    return localStorage.getItem(INSTALLED_KEY) === 'true'
  } catch {
    return false
  }
}

// Cattura 'beforeinstallprompt' il prima possibile. L'evento non è garantito
// entro i primi 5s (es. al primo caricamento, mentre il service worker è
// ancora in registrazione, Chrome può ritardarlo oltre): per questo motivo
// ricalcoliamo l'eleggibilità qui stesso, invece di aspettare solo il timer
// del componente. Vedi evaluateEligibility() più sotto e InstallPromptBanner.vue.
export function initInstallPrompt() {
  if (initialized) return
  initialized = true
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    platform.value = 'android'
    evaluateEligibility()
  })
  window.addEventListener('appinstalled', () => {
    try {
      localStorage.setItem(INSTALLED_KEY, 'true')
    } catch {}
    deferredPrompt = null
    canInstall.value = false
  })
}

// Valuta se il banner deve essere mostrato. Chiamata dal componente dopo il
// delay di 5s, non reattivamente: l'eleggibilità dipende da stato letto al
// momento (localStorage, standalone), non serve un watcher continuo.
export function evaluateEligibility() {
  if (isStandalone() || isPermanentlyInstalled() || isSnoozed()) {
    canInstall.value = false
    return false
  }
  if (deferredPrompt) {
    platform.value = 'android'
    canInstall.value = true
    return true
  }
  if (isIos()) {
    platform.value = 'ios'
    canInstall.value = true
    return true
  }
  canInstall.value = false
  return false
}

export async function promptInstall() {
  if (!deferredPrompt) return
  const promptEvent = deferredPrompt
  deferredPrompt = null
  await promptEvent.prompt()
  await promptEvent.userChoice
}

export function dismiss() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  } catch {}
  canInstall.value = false
}

export function usePwaInstall() {
  return { canInstall, platform, evaluateEligibility, promptInstall, dismiss }
}
