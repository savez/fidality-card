const DAY_MS = 86_400_000
const WINDOWS = { week: 7, month: 30, year: 365 }

// nowMs iniettato per testabilità (niente Date.now() nascosto nella logica).
export function sinceFor(range, nowMs) {
  const days = WINDOWS[range]
  return days ? nowMs - days * DAY_MS : 0
}

export function buildRanking(logs, cards, sinceMs) {
  const byId = new Map(cards.map((c) => [c.id, c]))
  const counts = new Map()
  for (const log of logs) {
    if (log.openedAt < sinceMs) continue
    if (!byId.has(log.cardId)) continue // card cancellata → ignora
    counts.set(log.cardId, (counts.get(log.cardId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([id, count]) => ({ card: byId.get(id), count }))
    .sort((a, b) =>
      b.count !== a.count
        ? b.count - a.count
        : a.card.name.localeCompare(b.card.name, 'it', { sensitivity: 'base' })
    )
}
