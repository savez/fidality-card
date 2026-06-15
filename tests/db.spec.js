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
  it('createCard salva con id e timestamp', async () => {
    const card = await createCard(baseInput)
    expect(card.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(card.createdAt).toBeGreaterThan(0)
    expect(card.updatedAt).toBe(card.createdAt)
  })

  it('listCards restituisce tutte le card', async () => {
    await createCard(baseInput)
    await createCard({ ...baseInput, name: 'Seconda' })
    const all = await listCards()
    expect(all.length).toBe(2)
  })

  it('updateCard aggiorna campi e bumpa updatedAt', async () => {
    const created = await createCard(baseInput)
    await new Promise(r => setTimeout(r, 5))
    const updated = await updateCard(created.id, { name: 'Nuovo nome' })
    expect(updated.name).toBe('Nuovo nome')
    expect(updated.updatedAt).toBeGreaterThan(created.updatedAt)
  })

  it('updateCard non cambia id né createdAt', async () => {
    const created = await createCard(baseInput)
    const updated = await updateCard(created.id, { name: 'X', id: 'evil', createdAt: 0 })
    expect(updated.id).toBe(created.id)
    expect(updated.createdAt).toBe(created.createdAt)
  })

  it('deleteCard rimuove il record', async () => {
    const c = await createCard(baseInput)
    await deleteCard(c.id)
    expect(await getCard(c.id)).toBeUndefined()
  })

  it('exportAll restituisce tutte le card', async () => {
    await createCard(baseInput)
    await createCard({ ...baseInput, name: 'Seconda' })
    const dump = await exportAll()
    expect(dump.cards.length).toBe(2)
    expect(dump.version).toBe(1)
  })

  it('importAll skippa duplicati per id', async () => {
    const existing = await createCard(baseInput)
    const dump = {
      version: 1,
      cards: [
        { ...existing, name: 'IGNORED_BECAUSE_DUPLICATE_ID' },
        { ...existing, id: 'new-uuid-1', name: 'Nuova' }
      ]
    }
    const result = await importAll(dump)
    expect(result.inserted).toBe(1)
    expect(result.skipped).toBe(1)
    const all = await listCards()
    expect(all.find(c => c.name === 'IGNORED_BECAUSE_DUPLICATE_ID')).toBeUndefined()
  })

  it('importAll strippa il campo legacy ownerEmail', async () => {
    const dump = {
      version: 1,
      cards: [{
        id: 'legacy-1',
        ownerEmail: 'foo@bar.com',
        name: 'Legacy',
        brandId: null,
        barcode: '123',
        barcodeFormat: 'CODE_128',
        createdAt: 1, updatedAt: 1
      }]
    }
    await importAll(dump)
    const got = await getCard('legacy-1')
    expect(got.ownerEmail).toBeUndefined()
    expect(got.name).toBe('Legacy')
  })
})
