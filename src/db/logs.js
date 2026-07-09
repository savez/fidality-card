import { v4 as uuidv4 } from 'uuid'
import { db } from './index.js'

// Registra un'apertura card. Le coordinate partono null e vengono eventualmente
// riempite in un secondo momento da attachCoords (vedi useUsageLogger).
export async function addOpenLog({ cardId, openedAt }) {
  const log = {
    id: uuidv4(),
    cardId,
    openedAt,
    lat: null,
    lng: null,
    accuracy: null,
  }
  await db.logs.add(log)
  return log
}

export async function attachCoords(id, { lat, lng, accuracy }) {
  await db.logs.update(id, { lat, lng, accuracy })
}

// Log di una card, più recente in cima.
export async function listLogsByCard(cardId) {
  const rows = await db.logs.where('cardId').equals(cardId).sortBy('openedAt')
  return rows.reverse()
}

export async function deleteLogsByCard(cardId) {
  await db.logs.where('cardId').equals(cardId).delete()
}

export async function clearAllLogs() {
  await db.logs.clear()
}

export async function countAllLogs() {
  return db.logs.count()
}
