import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCardsStore } from '@/stores/cards.js'

beforeEach(() => setActivePinia(createPinia()))

function card(id, name, pinned = false, brandId = null) {
  return {
    id,
    name,
    brandId,
    pinned,
    barcode: 'X',
    barcodeFormat: 'CODE_128',
    createdAt: 1,
    updatedAt: 1,
  }
}

describe('cards store — filtered sort', () => {
  it('empty list returns empty', () => {
    const cards = useCardsStore()
    expect(cards.filtered).toEqual([])
  })

  it('all unpinned → pure alphabetical sort', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Banana'), card('2', 'Anguria'), card('3', 'Carota')]
    expect(cards.filtered.map((c) => c.name)).toEqual(['Anguria', 'Banana', 'Carota'])
  })

  it('all pinned → alphabetical sort still applies', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Banana', true), card('2', 'Anguria', true)]
    expect(cards.filtered.map((c) => c.name)).toEqual(['Anguria', 'Banana'])
  })

  it('mix: pinned go first, both groups alphabetical', () => {
    const cards = useCardsStore()
    cards.items = [
      card('1', 'Banana', false),
      card('2', 'Albicocca', true),
      card('3', 'Carota', false),
      card('4', 'Zucca', true),
    ]
    expect(cards.filtered.map((c) => c.name)).toEqual(['Albicocca', 'Zucca', 'Banana', 'Carota'])
  })

  it('case-insensitive and locale italian (è sorts between e and f)', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'zucca'), card('2', 'Èxtra'), card('3', 'banana')]
    expect(cards.filtered.map((c) => c.name)).toEqual(['banana', 'Èxtra', 'zucca'])
  })

  it('search = null (clear di Vuetify) → mostra tutte le card senza errori', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Banana'), card('2', 'Anguria')]
    cards.search = null
    expect(cards.filtered.map((c) => c.name)).toEqual(['Anguria', 'Banana'])
  })
})

describe('cards store — filtro saldo', () => {
  it('filter=all è il default e mostra tutto', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'A'), { ...card('2', 'B'), balanceCents: 500 }]
    expect(cards.filter).toBe('all')
    expect(cards.filtered.map((c) => c.name)).toEqual(['A', 'B'])
  })

  it('separa fedeltà / con saldo / esaurite', () => {
    const cards = useCardsStore()
    cards.items = [
      card('1', 'Fedelta'),
      { ...card('2', 'Attiva'), balanceCents: 500 },
      { ...card('3', 'Esaurita'), balanceCents: 0 },
    ]
    cards.filter = 'loyalty'
    expect(cards.filtered.map((c) => c.name)).toEqual(['Fedelta'])
    cards.filter = 'active'
    expect(cards.filtered.map((c) => c.name)).toEqual(['Attiva'])
    cards.filter = 'empty'
    expect(cards.filtered.map((c) => c.name)).toEqual(['Esaurita'])
  })

  it('si combina in AND con la ricerca testuale', () => {
    const cards = useCardsStore()
    cards.items = [
      { ...card('1', 'Coop'), balanceCents: 500 },
      { ...card('2', 'Conad'), balanceCents: 0 },
    ]
    cards.filter = 'active'
    cards.search = 'co'
    expect(cards.filtered.map((c) => c.name)).toEqual(['Coop'])
  })
})

describe('cards store — exportBackupSync', () => {
  it('ritorna il dump in modo sincrono dagli items (non una Promise)', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'A'), card('2', 'B')]
    const dump = cards.exportBackupSync()
    expect(dump).not.toBeInstanceOf(Promise)
    expect(dump.version).toBe(1)
    expect(typeof dump.exportedAt).toBe('number')
    expect(dump.cards.map((c) => c.id)).toEqual(['1', '2'])
  })
})

describe('cards store — documenti', () => {
  const doc = (id, name, pinned = false) => ({ ...card(id, name, pinned), category: 'document' })

  it('Tutte mostra carte e documenti in una lista sola', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Coop'), doc('2', 'Codice fiscale')]
    expect(cards.filtered.map((c) => c.id)).toEqual(['2', '1'])
  })

  it('il chip Documenti mostra solo i documenti', () => {
    const cards = useCardsStore()
    cards.items = [
      card('1', 'Coop'),
      doc('2', 'Codice fiscale'),
      { ...card('3', 'Gift'), balanceCents: 0 },
    ]
    cards.filter = 'documents'
    expect(cards.filtered.map((c) => c.id)).toEqual(['2'])
  })

  it('i chip saldo non mostrano i documenti tra le fedeltà', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Coop'), doc('2', 'Codice fiscale')]
    cards.filter = 'loyalty'
    expect(cards.filtered.map((c) => c.id)).toEqual(['1'])
  })

  it('la ricerca vale su tutto', () => {
    const cards = useCardsStore()
    cards.items = [card('1', 'Coop'), doc('2', 'Codice fiscale'), doc('3', 'Patente')]
    cards.search = 'co'
    expect(cards.filtered.map((c) => c.name)).toEqual(['Codice fiscale', 'Coop'])
  })

  it('i preferiti vanno in cima, carte o documenti che siano', () => {
    const cards = useCardsStore()
    cards.items = [
      card('1', 'Aaa coop'),
      doc('2', 'Tessera', true),
      card('3', 'Zeta', true),
      doc('4', 'IBAN'),
    ]
    expect(cards.filtered.map((c) => c.name)).toEqual(['Tessera', 'Zeta', 'Aaa coop', 'IBAN'])
  })
})
