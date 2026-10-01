import { describe, it, expect } from 'vitest'
import { isDocument, showsBarcode, matchesCategoryFilter, DOCUMENT } from '@/utils/category.js'

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

describe('matchesCategoryFilter', () => {
  const fidelity = { id: 'f' }
  const prepaid = { id: 'p', balanceCents: 500 }
  const empty = { id: 'e', balanceCents: 0 }
  const doc = { id: 'd', category: DOCUMENT }

  it('all → carte e documenti', () => {
    for (const c of [fidelity, prepaid, empty, doc])
      expect(matchesCategoryFilter(c, 'all')).toBe(true)
  })

  it('documents → solo documenti', () => {
    expect(matchesCategoryFilter(doc, 'documents')).toBe(true)
    expect(matchesCategoryFilter(fidelity, 'documents')).toBe(false)
    expect(matchesCategoryFilter(prepaid, 'documents')).toBe(false)
  })

  it('i chip saldo escludono i documenti (niente saldo ≠ fedeltà)', () => {
    expect(matchesCategoryFilter(doc, 'loyalty')).toBe(false)
    expect(matchesCategoryFilter(doc, 'active')).toBe(false)
    expect(matchesCategoryFilter(doc, 'empty')).toBe(false)
  })

  it('i chip saldo sulle carte funzionano come prima', () => {
    expect(matchesCategoryFilter(fidelity, 'loyalty')).toBe(true)
    expect(matchesCategoryFilter(prepaid, 'active')).toBe(true)
    expect(matchesCategoryFilter(empty, 'empty')).toBe(true)
    expect(matchesCategoryFilter(fidelity, 'active')).toBe(false)
  })
})
