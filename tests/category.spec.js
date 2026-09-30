import { describe, it, expect } from 'vitest'
import { isDocument, showsBarcode, splitByCategory, DOCUMENT } from '@/utils/category.js'

describe('isDocument', () => {
  it('assente → fidelity', () => expect(isDocument({ id: 'a' })).toBe(false))
  it("'document' → documento", () => expect(isDocument({ category: DOCUMENT })).toBe(true))
  it('valore sconosciuto → fidelity', () => expect(isDocument({ category: 'boh' })).toBe(false))
  it('null/undefined → false senza lanciare', () => {
    expect(isDocument(null)).toBe(false)
    expect(isDocument(undefined)).toBe(false)
  })
})

describe('showsBarcode', () => {
  it('assente → true (come oggi)', () => expect(showsBarcode({})).toBe(true))
  it('documento con false → false', () =>
    expect(showsBarcode({ category: DOCUMENT, showBarcode: false })).toBe(false))
  it('true → true', () => expect(showsBarcode({ showBarcode: true })).toBe(true))
  it('card null → true', () => expect(showsBarcode(null)).toBe(true))
  it('non-documento con false (backup a mano/futuro) → true, non deve nascondere il codice', () =>
    expect(showsBarcode({ showBarcode: false })).toBe(true))
})

describe('splitByCategory', () => {
  it("separa conservando l'ordine d'ingresso", () => {
    const list = [
      { id: '1' },
      { id: '2', category: DOCUMENT },
      { id: '3' },
      { id: '4', category: DOCUMENT },
    ]
    const { cards, documents } = splitByCategory(list)
    expect(cards.map((c) => c.id)).toEqual(['1', '3'])
    expect(documents.map((c) => c.id)).toEqual(['2', '4'])
  })
  it('lista vuota', () => expect(splitByCategory([])).toEqual({ cards: [], documents: [] }))
})
