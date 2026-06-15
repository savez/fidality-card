import { describe, it, expect } from 'vitest'
import { BRANDS, getBrand } from '@/brands/brands.js'

describe('brand library', () => {
  it('contiene almeno 20 brand', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(20)
  })

  it('ogni brand ha id, name, color e iconDefault', () => {
    for (const b of BRANDS) {
      expect(b.id).toMatch(/^[a-z0-9_]+$/)
      expect(b.name).toBeTruthy()
      expect(b.color).toMatch(/^#[0-9A-F]{6}$/i)
      expect(b.iconDefault).toMatch(/^mdi-[a-z0-9-]+$/)
    }
  })

  it('id univoci', () => {
    const ids = BRANDS.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getBrand restituisce il brand giusto', () => {
    expect(getBrand('esselunga')?.name).toBe('Esselunga')
  })

  it('getBrand su id sconosciuto restituisce null', () => {
    expect(getBrand('inesistente-xyz')).toBeNull()
  })

  it('getBrand su null restituisce null', () => {
    expect(getBrand(null)).toBeNull()
  })
})
