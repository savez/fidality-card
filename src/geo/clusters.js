import { haversineMeters } from './distance.js'

// Raggruppa i log di apertura in "posti", cioè insiemi di coordinate vicine.
// Greedy: il primo log di un gruppo ne fissa il centro e i successivi entro
// `radiusM` gli si attaccano. Non è k-means e non deve esserlo — il dataset è
// personale (decine, forse centinaia di righe) e il greedy ha due proprietà che
// qui contano più della qualità del clustering: è deterministico e leggibile.
//
// I log senza coordinate (apertura registrata ma GPS negato o non arrivato)
// vengono ignorati: non dicono niente sul luogo.
//
// → [{ lat, lng, byCardId: Map<cardId, count>, total, lastOpenedAt }]
export function buildClusters(logs, radiusM) {
  const clusters = []

  for (const log of logs) {
    if (log.lat == null || log.lng == null) continue

    let cluster = clusters.find((c) => haversineMeters(c, log) <= radiusM)
    if (!cluster) {
      cluster = { lat: log.lat, lng: log.lng, byCardId: new Map(), total: 0, lastOpenedAt: 0 }
      clusters.push(cluster)
    }

    cluster.byCardId.set(log.cardId, (cluster.byCardId.get(log.cardId) ?? 0) + 1)
    cluster.total += 1
    if (log.openedAt > cluster.lastOpenedAt) cluster.lastOpenedAt = log.openedAt
  }

  return clusters
}
