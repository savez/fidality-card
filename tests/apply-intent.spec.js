import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/db/index.js'
import { createCard } from '@/db/cards.js'
import { applyIntent } from '@/shortcuts/applyIntent.js'

beforeEach(async () => {
  await db.cards.clear()
  await db.logs.clear()
})

describe('applyIntent — contratto ?fs=1 con CardDetailView', () => {
  it('intento risolvibile → router.replace chiamato con /cards/{id}?fs=1', async () => {
    const card = await createCard({
      name: 'Coop',
      barcode: '123',
      barcodeFormat: 'CODE_128',
      icona: null,
      note: null,
    })
    const replace = vi.fn()
    const router = { replace }

    await applyIntent(router, { search: `?open=${card.id}` })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith(`/cards/${card.id}?fs=1`)
  })

  it('documento senza barcode → apre il dettaglio senza fullscreen', async () => {
    const doc = await createCard({
      name: 'Codice fiscale',
      barcode: 'RSSMRA80A01H501U',
      barcodeFormat: 'CODE_128',
      category: 'document',
      showBarcode: false,
    })
    const replace = vi.fn()
    await applyIntent({ replace }, { search: `?open=${doc.id}` })
    expect(replace).toHaveBeenCalledWith(`/cards/${doc.id}`)
  })

  it('documento con barcode → fullscreen come una fidelity', async () => {
    const doc = await createCard({
      name: 'Tessera sanitaria',
      barcode: 'RSSMRA80A01H501U',
      barcodeFormat: 'CODE_39',
      category: 'document',
    })
    const replace = vi.fn()
    await applyIntent({ replace }, { search: `?open=${doc.id}` })
    expect(replace).toHaveBeenCalledWith(`/cards/${doc.id}?fs=1`)
  })

  it('intento non risolvibile (pinned senza card pinnate, nessun log) → router.replace non chiamato', async () => {
    await createCard({
      name: 'Non pinnata',
      barcode: '456',
      barcodeFormat: 'CODE_128',
      icona: null,
      note: null,
    })
    const replace = vi.fn()
    const router = { replace }

    await applyIntent(router, { search: '?open=pinned' })

    expect(replace).not.toHaveBeenCalled()
  })
})

// Il valore di ritorno governa initNearbyOpen: un default sbagliato qui
// disattiverebbe in silenzio l'apertura in base al posto per chi lancia l'app
// dalle scorciatoie del manifest.
describe('applyIntent — valore di ritorno', () => {
  it('nessun intento nella URL → false', async () => {
    expect(await applyIntent({ replace: vi.fn() }, { search: '' })).toBe(false)
  })

  it('intento che non risolve nessuna card → false, così il geo può partire', async () => {
    await createCard({
      name: 'Non pinnata',
      barcode: '456',
      barcodeFormat: 'CODE_128',
      icona: null,
      note: null,
    })
    expect(await applyIntent({ replace: vi.fn() }, { search: '?open=pinned' })).toBe(false)
  })

  it('navigazione avvenuta → true', async () => {
    const card = await createCard({
      name: 'Coop',
      barcode: '123',
      barcodeFormat: 'CODE_128',
      icona: null,
      note: null,
    })
    expect(await applyIntent({ replace: vi.fn() }, { search: `?open=${card.id}` })).toBe(true)
  })
})
