import Dexie from 'dexie'

export const db = new Dexie('fidality-card')

// v1: original schema (kept for migration of existing user data)
db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta: 'key'
})

// v2: drop ownerEmail index — app is now open-access, no per-user partition.
// Existing records keep their ownerEmail field as plain data — just not indexed.
db.version(2).stores({
  cards: 'id, name, brandId, updatedAt',
  meta: 'key'
})

export async function probeDb() {
  try {
    await db.open()
    return null
  } catch (e) {
    return e?.message ?? 'IndexedDB non disponibile'
  }
}
