import Dexie from 'dexie'

export const db = new Dexie('fidality-card')

// v1: original schema (kept for migration of existing user data)
db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta: 'key',
})

// v2: drop ownerEmail index — app is now open-access, no per-user partition.
// Existing records keep their ownerEmail field as plain data — just not indexed.
db.version(2).stores({
  cards: 'id, name, brandId, updatedAt',
  meta: 'key',
})

// v3: add `pinned` index for pin-first sort. Backfills existing records with
// pinned:false explicit (Dexie would treat undefined as falsy, but explicit
// makes the index uniform and removes ambiguity from queries).
db.version(3)
  .stores({
    cards: 'id, name, brandId, updatedAt, pinned',
    meta: 'key',
  })
  .upgrade((tx) => {
    return tx
      .table('cards')
      .toCollection()
      .modify((card) => {
        if (card.pinned === undefined) card.pinned = false
      })
  })

// v4: aggiunge la tabella `logs` per il tracciamento aperture card
// (evento apertura + GPS opzionale). Tabella nuova, cards/meta invariate → no upgrade().
db.version(4).stores({
  cards: 'id, name, brandId, updatedAt, pinned',
  meta: 'key',
  logs: 'id, cardId, openedAt',
})

export async function probeDb() {
  try {
    await db.open()
    return null
  } catch (e) {
    return e?.message ?? 'IndexedDB non disponibile'
  }
}
