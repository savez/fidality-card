import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/index.js'
import { createCard, updateCard, deleteCard, listCards, getCard, exportAll, importAll } from '@/db/cards.js'

const baseInput = {
  name: 'Test card',
  brandId: 'esselunga',
  barcode: '123',
  barcodeFormat: 'EAN_13'
}

beforeEach(async () => {
  await db.cards.clear()
  await db.meta.clear()
})

describe('cards CRUD', () => {
  it('createCard salva con id, timestamp, ownerEmail', async () => {
    const card = await createCard('a@test.it', baseInput)
    expect(card.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(card.ownerEmail).toBe('a@test.it')
    expect(card.createdAt).toBeGreaterThan(0)
    expect(card.updatedAt).toBe(card.createdAt)
  })

  it('listCards filtra per ownerEmail', async () => {
    await createCard('a@test.it', baseInput)
    await createCard('a@test.it', { ...baseInput, name: 'Seconda' })
    await createCard('b@test.it', baseInput)
    const aCards = await listCards('a@test.it')
    const bCards = await listCards('b@test.it')
    expect(aCards.length).toBe(2)
    expect(bCards.length).toBe(1)
  })

  it('updateCard aggiorna campi e bumpa updatedAt', async () => {
    const created = await createCard('a@test.it', baseInput)
    await new Promise(r => setTimeout(r, 5))
    const updated = await updateCard(created.id, { name: 'Nuovo nome' })
    expect(updated.name).toBe('Nuovo nome')
    expect(updated.updatedAt).toBeGreaterThan(created.updatedAt)
  })

  it('updateCard non cambia ownerEmail né createdAt', async () => {
    const created = await createCard('a@test.it', baseInput)
    const updated = await updateCard(created.id, { name: 'X', ownerEmail: 'evil@test.it', createdAt: 0 })
    expect(updated.ownerEmail).toBe('a@test.it')
    expect(updated.createdAt).toBe(created.createdAt)
  })

  it('deleteCard rimuove il record', async () => {
    const c = await createCard('a@test.it', baseInput)
    await deleteCard(c.id)
    expect(await getCard(c.id)).toBeUndefined()
  })

  it('exportAll restituisce solo card del ownerEmail', async () => {
    await createCard('a@test.it', baseInput)
    await createCard('b@test.it', baseInput)
    const dump = await exportAll('a@test.it')
    expect(dump.cards.length).toBe(1)
    expect(dump.cards[0].ownerEmail).toBe('a@test.it')
    expect(dump.version).toBe(1)
  })

  it('importAll inserisce card riassegnando ownerEmail e skipando duplicati per id', async () => {
    const existing = await createCard('a@test.it', baseInput)
    const dump = {
      version: 1,
      cards: [
        { ...existing, name: 'IGNORED_BECAUSE_DUPLICATE_ID' },
        { ...existing, id: 'new-uuid-1', name: 'Nuova' }
      ]
    }
    const result = await importAll('a@test.it', dump)
    expect(result.inserted).toBe(1)
    expect(result.skipped).toBe(1)
    const all = await listCards('a@test.it')
    expect(all.find(c => c.name === 'IGNORED_BECAUSE_DUPLICATE_ID')).toBeUndefined()
  })
})
