import { parseIntent } from './intent.js'
import { resolveTarget } from './target.js'
import { listCards } from '@/db/cards.js'
import { listAllLogs } from '@/db/logs.js'

export async function applyIntent(router, location = window.location) {
  const intent = parseIntent(location.search)
  if (!intent) return

  const [cards, logs] = await Promise.all([listCards(), listAllLogs()])
  const cardId = resolveTarget(intent, { logs, cards, nowMs: Date.now() })

  if (cardId) {
    await router.replace(`/cards/${cardId}?fs=1`)
  }

  // Ripulisce la query reale (prima del `#`) così un refresh non ri-applica
  // l'intento. Va dopo router.replace: quest'ultimo tocca solo l'hash, non
  // la query di primo livello, quindi l'ordine non causa conflitti.
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState(window.history.state, '', url)
}
