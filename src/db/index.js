import Dexie from 'dexie'

export const db = new Dexie('fidality-card')

db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta: 'key'
})
