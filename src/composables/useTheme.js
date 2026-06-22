import { ref, watch, computed } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

const STORAGE_KEY = 'fidality-card:theme-mode'
const VALID_MODES = ['system', 'light', 'dark']

function readStoredMode() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return VALID_MODES.includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

// Nome del tema Vuetify ('light'|'dark') da applicare all'avvio, risolto dalla
// modalità salvata e dalla preferenza di sistema. Usato come defaultTheme alla
// creazione di Vuetify così il tema corretto è attivo dal primo paint, senza
// dipendere da quale view viene montata.
export function initialThemeName() {
  const m = readStoredMode()
  if (m === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return m
}

let mediaQuery = null
let mediaListenerAttached = false
const mode = ref(readStoredMode())
const systemDark = ref(systemPrefersDark())

function ensureMediaListener() {
  if (mediaListenerAttached) return
  mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!mediaQuery) return
  const handler = (e) => {
    systemDark.value = e.matches
  }
  // addEventListener is preferred; fallback for older Safari
  if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handler)
  else mediaQuery.addListener?.(handler)
  mediaListenerAttached = true
}

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()
  ensureMediaListener()

  const effective = computed(() => {
    if (mode.value === 'system') return systemDark.value ? 'dark' : 'light'
    return mode.value
  })

  watch(
    effective,
    (next) => {
      vuetifyTheme.global.name.value = next
    },
    { immediate: true }
  )
  watch(mode, (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  })

  function setMode(next) {
    if (!VALID_MODES.includes(next)) return
    mode.value = next
  }

  function toggleQuick() {
    // Cycle: light → dark → system → light
    if (mode.value === 'light') setMode('dark')
    else if (mode.value === 'dark') setMode('system')
    else setMode('light')
  }

  return { mode, effective, setMode, toggleQuick }
}
