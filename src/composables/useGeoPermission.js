import { ref, onMounted, onUnmounted } from 'vue'

// Stato del permesso di geolocalizzazione del browser: 'granted' | 'denied' |
// 'prompt' | 'unsupported'. Best-effort: se l'API Permissions non è
// disponibile per questo permesso in questo browser, resta 'unsupported' e
// la UI lo tratta come stato neutro, mai come "negato".
export function useGeoPermission() {
  const state = ref('unsupported')
  let permissionStatus = null
  let active = true

  function handleChange() {
    state.value = permissionStatus.state
  }

  onMounted(async () => {
    if (!navigator.permissions?.query) return
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' })
      if (!active) return
      permissionStatus = status
      state.value = permissionStatus.state
      permissionStatus.addEventListener?.('change', handleChange)
    } catch {
      // API non supportata per questo permesso in questo browser: resta 'unsupported'.
    }
  })

  onUnmounted(() => {
    active = false
    permissionStatus?.removeEventListener?.('change', handleChange)
  })

  return { state }
}
