import { v4 as uuidv4 } from 'uuid'
import { db } from './index.js'

// Un "luogo" è un punto che l'utente ha confermato una volta: qui c'è il negozio
// di questa card. Con `cardId: null` è invece un luogo da ignorare (casa,
// ufficio): "non chiedermi niente qui".
//
// Una card può avere più luoghi — chi frequenta tre Conad diversi li salva tutti.
// Nessun vincolo di unicità: la relazione è molti-a-uno.
export async function addPlace({ cardId = null, lat, lng, accuracy = null, label = null }) {
  const t = Date.now()
  const place = {
    id: uuidv4(),
    cardId,
    lat,
    lng,
    accuracy,
    label,
    createdAt: t,
    updatedAt: t,
  }
  await db.places.add(place)
  return place
}

// Tutti i luoghi, più recente in cima — come listAllLogs in ./logs.js.
export async function listPlaces() {
  const rows = await db.places.toArray()
  return rows.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deletePlace(id) {
  await db.places.delete(id)
}

export async function deletePlacesByCard(cardId) {
  await db.places.where('cardId').equals(cardId).delete()
}

export async function countPlaces() {
  return db.places.count()
}
