import { onMounted, onUnmounted } from 'vue'
import { useLogsStore } from '@/stores/logs.js'

const DWELL_MS = 3000

// Registra l'apertura di una card se la permanenza supera i 3 secondi.
// A 3s scrive il log (coordinate null), poi chiede il GPS e — se concesso —
// aggiorna la riga con le coordinate. Se si esce prima dei 3s, niente log.
export function useUsageLogger(cardId) {
  const logs = useLogsStore()
  let timer = null
  let openedAt = 0

  async function fire() {
    if (!logs.enabled) return
    let id
    try {
      id = await logs.recordOpen({ cardId, openedAt })
    } catch {
      // Best-effort logging: swallow write failures (quota, private mode, etc.)
      return
    }
    if (!navigator.geolocation) return
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          logs
            .attachCoords(id, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            })
            .catch(() => {})
        },
        () => {},
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      )
    } catch {
      // Some non-compliant embedded browsers throw synchronously instead of
      // invoking the error callback; ignore since GPS enrichment is optional.
    }
  }

  onMounted(() => {
    openedAt = Date.now()
    timer = setTimeout(fire, DWELL_MS)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    timer = null
  })
}
