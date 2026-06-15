import Dexie from 'dexie'

export const db = new Dexie('fidality-card')

db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta: 'key'
})

export async function probeDb() {
  // Touch the DB to force open and surface errors early.
  try {
    await db.open()
    return null
  } catch (e) {
    return e?.message ?? 'IndexedDB non disponibile'
  }
}
