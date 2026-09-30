import { isDocument } from '@/utils/category.js'
import { buildRanking, sinceFor } from '@/stats/ranking.js'

// Stesso criterio di `sortCards` in src/stores/cards.js: alfabetico locale-aware,
// italiano, case-insensitive. listCards() (Dexie toArray) non garantisce un
// ordine significativo, quindi non ci si può affidare all'ordine di arrivo.
function firstPinned(cards) {
  // La scorciatoia "In primo piano" è pensata per la cassa: i documenti pinnati
  // (es. il codice fiscale) non devono rubarle il posto.
  const pinned = cards.filter((c) => c.pinned && !isDocument(c))
  if (!pinned.length) return null
  pinned.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }))
  return pinned[0].id
}

function topRanked(logs, cards, sinceMs) {
  const ranking = buildRanking(logs, cards, sinceMs)
  return ranking.length ? ranking[0].card.id : null
}

export function resolveTarget(intent, { logs, cards, nowMs }) {
  if (!intent) return null

  if (intent.kind === 'card') {
    return cards.some((c) => c.id === intent.id) ? intent.id : null
  }

  if (intent.kind === 'pinned') {
    return firstPinned(cards)
  }

  // most-used
  return (
    topRanked(logs, cards, sinceFor('month', nowMs)) ??
    topRanked(logs, cards, sinceFor('all', nowMs)) ??
    firstPinned(cards)
  )
}
