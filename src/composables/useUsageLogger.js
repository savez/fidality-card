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
    const id = await logs.recordOpen({ cardId, openedAt })
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        logs.attachCoords(id, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
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
