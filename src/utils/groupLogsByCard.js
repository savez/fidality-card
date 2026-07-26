// Raggruppa i log per card. Precondizione: `logs` è già ordinato per
// openedAt decrescente (come ritorna listAllLogs() in src/db/logs.js) — il
// raggruppamento preserva quell'ordine all'interno di ogni gruppo, così
// `logs[0]` di ogni gruppo è sempre l'apertura più recente di quella card.
//
// Ritorna un array con una entry per ogni card che ha almeno un log (le
// card senza alcun log non compaiono), nello stesso ordine di `cards` in
// input:
//   { card, logs, latestWithCoords }
// dove `latestWithCoords` è il log più recente con lat/lng non nulli, o
// `null` se nessuno dei log di quella card ha coordinate.
export function groupLogsByCard(cards, logs) {
  const logsByCardId = new Map()
  for (const log of logs) {
    if (!logsByCardId.has(log.cardId)) logsByCardId.set(log.cardId, [])
    logsByCardId.get(log.cardId).push(log)
  }

  const result = []
  for (const card of cards) {
    const cardLogs = logsByCardId.get(card.id)
    if (!cardLogs || cardLogs.length === 0) continue
    const latestWithCoords = cardLogs.find((l) => l.lat != null && l.lng != null) ?? null
    result.push({ card, logs: cardLogs, latestWithCoords })
  }
  return result
}
