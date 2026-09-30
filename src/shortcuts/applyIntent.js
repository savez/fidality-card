import { parseIntent } from './intent.js'
import { resolveTarget } from './target.js'
import { listCards } from '@/db/cards.js'
import { listAllLogs } from '@/db/logs.js'
import { showsBarcode } from '@/utils/category.js'

// Ritorna true solo se ha davvero navigato. Il valore conta: initNearbyOpen()
// si tira indietro quando l'intento URL ha già scelto una card, ma deve poter
// partire quando l'intento c'era e non ha risolto niente (es. ?open=most-used
// senza nessun log) — altrimenti lanciare l'app da una scorciatoia del manifest
// disattiverebbe in silenzio l'apertura in base al posto.
export async function applyIntent(router, location = window.location) {
  const intent = parseIntent(location.search)
  if (!intent) return false

  const [cards, logs] = await Promise.all([listCards(), listAllLogs()])
  const cardId = resolveTarget(intent, { logs, cards, nowMs: Date.now() })

  let navigated = false
  if (cardId) {
    // fs=1 mette a schermo pieno il barcode: un documento solo testo non ne ha.
    const target = cards.find((c) => c.id === cardId)
    await router.replace(showsBarcode(target) ? `/cards/${cardId}?fs=1` : `/cards/${cardId}`)
    navigated = true
  }

  // Ripulisce la query reale (prima del `#`) così un refresh non ri-applica
  // l'intento. Va dopo router.replace: quest'ultimo tocca solo l'hash, non
  // la query di primo livello, quindi l'ordine non causa conflitti.
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState(window.history.state, '', url)

  return navigated
}
