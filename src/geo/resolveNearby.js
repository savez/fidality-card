import { haversineMeters } from './distance.js'
import { buildClusters } from './clusters.js'

export const DEFAULTS = {
  // Oltre questa accuratezza il fix arriva da IP o da cella: dice in che città
  // sei, non davanti a quale negozio. Meglio tacere che indovinare.
  maxAccuracyM: 400,
  placeRadiusM: 150,
  poiRadiusM: 150,
  clusterRadiusM: 120,
  // Un posto visto una volta sola non è ancora un posto: potrebbe essere
  // l'unica volta che hai aperto la carta in giro.
  minOpens: 2,
  // Quota di aperture che una carta deve tenere nel cluster per essere "la"
  // carta di quel posto. Sotto, il posto è misto (centro commerciale, casa).
  dominance: 0.6,
}

// Decide cosa fare con un fix GPS, sulla base di tre livelli di evidenza
// valutati in ordine di affidabilità decrescente:
//
//   1. luoghi confermati dall'utente  → si apre, senza chiedere
//   2. POI del catalogo OpenStreetMap → si propone (funziona la prima volta)
//   3. cluster dei log di apertura    → si propone (brand fuori catalogo,
//                                       carte senza brandId, negozi non mappati)
//
// Funzione pura: nessun accesso a DB, rete, orologio. `pois` è una
// Map<brandId, [[lat, lng], …]> già caricata dal chiamante.
//
// Ritorna:
//   { action: 'open',    cardId, placeId }
//   { action: 'confirm', candidates: [{ cardId, distanceM, source, lat, lng }], fix }
//   null
export function resolveNearby({
  places = [],
  logs = [],
  cards = [],
  pois = new Map(),
  fix,
  opts,
} = {}) {
  const o = { ...DEFAULTS, ...opts }

  if (!fix || fix.lat == null || fix.lng == null) return null
  const accuracy = fix.accuracy ?? 0
  if (accuracy > o.maxAccuracyM) return null

  const cardsById = new Map(cards.map((c) => [c.id, c]))

  // --- Livello 1: luoghi confermati -----------------------------------------
  // Si scartano subito i luoghi che puntano a una card cancellata: altrimenti
  // uno di questi, se è il più vicino, zittirebbe i livelli sotto senza
  // aprire niente.
  const placeRadius = Math.max(o.placeRadiusM, accuracy)
  let nearestPlace = null
  for (const place of places) {
    if (place.lat == null || place.lng == null) continue
    if (place.cardId != null && !cardsById.has(place.cardId)) continue
    const distanceM = haversineMeters(fix, place)
    if (distanceM > placeRadius) continue
    if (!nearestPlace || distanceM < nearestPlace.distanceM) nearestPlace = { distanceM, place }
  }
  if (nearestPlace) {
    const { place } = nearestPlace
    // Luogo ignorato (casa, ufficio): silenzio totale, e non si prosegue —
    // è il punto in cui l'utente ha detto "qui non chiedermi niente".
    if (place.cardId == null) return null
    return { action: 'open', cardId: place.cardId, placeId: place.id }
  }

  // --- Livello 2: catalogo POI ----------------------------------------------
  const candidates = new Map()
  const poiRadius = Math.max(o.poiRadiusM, accuracy)
  for (const card of cards) {
    if (!card.brandId) continue
    const points = pois.get(card.brandId)
    if (!points?.length) continue

    let nearest = null
    for (const [lat, lng] of points) {
      const distanceM = haversineMeters(fix, { lat, lng })
      if (distanceM > poiRadius) continue
      if (!nearest || distanceM < nearest.distanceM) nearest = { distanceM, lat, lng }
    }
    if (nearest) {
      candidates.set(card.id, { cardId: card.id, source: 'poi', ...nearest })
    }
  }

  // --- Livello 3: cluster dai log ------------------------------------------
  const clusterRadius = Math.max(o.clusterRadiusM, accuracy)
  for (const cluster of buildClusters(logs, o.clusterRadiusM)) {
    if (cluster.total < o.minOpens) continue
    const distanceM = haversineMeters(fix, cluster)
    if (distanceM > clusterRadius) continue

    let topId = null
    let topCount = 0
    for (const [cardId, count] of cluster.byCardId) {
      if (count > topCount) {
        topCount = count
        topId = cardId
      }
    }
    if (topId == null || !cardsById.has(topId)) continue
    if (topCount / cluster.total < o.dominance) continue
    // L'evidenza POI è più forte: se c'è già, non la si sovrascrive.
    if (candidates.has(topId)) continue

    candidates.set(topId, {
      cardId: topId,
      source: 'log',
      distanceM,
      lat: cluster.lat,
      lng: cluster.lng,
    })
  }

  if (!candidates.size) return null

  // Più vicino prima; a pari distanza, ordine alfabetico italiano — lo stesso
  // criterio di src/stores/cards.js e src/shortcuts/target.js.
  const sorted = [...candidates.values()].sort(
    (a, b) =>
      a.distanceM - b.distanceM ||
      cardsById
        .get(a.cardId)
        .name.localeCompare(cardsById.get(b.cardId).name, 'it', { sensitivity: 'base' })
  )

  return {
    action: 'confirm',
    candidates: sorted,
    fix: { lat: fix.lat, lng: fix.lng, accuracy },
  }
}
