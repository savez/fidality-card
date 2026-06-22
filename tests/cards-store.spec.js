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
