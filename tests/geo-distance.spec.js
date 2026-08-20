import { describe, it, expect } from 'vitest'
import { haversineMeters } from '@/geo/distance.js'

describe('haversineMeters', () => {
  it('stesso punto → 0', () => {
    expect(haversineMeters({ lat: 45.4642, lng: 9.19 }, { lat: 45.4642, lng: 9.19 })).toBe(0)
  })

  it('un grado di latitudine all’equatore → ~111 km', () => {
    const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })
    expect(d).toBeGreaterThan(110_000)
    expect(d).toBeLessThan(112_000)
  })

  it('Duomo → Milano Centrale ≈ 2,6 km', () => {
    const d = haversineMeters({ lat: 45.4642, lng: 9.19 }, { lat: 45.4854, lng: 9.204 })
    expect(d).toBeGreaterThan(2400)
    expect(d).toBeLessThan(2800)
  })

  it('è simmetrica', () => {
    const a = { lat: 45.4642, lng: 9.19 }
    const b = { lat: 44.4949, lng: 11.3426 }
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6)
  })

  it('attraversa l’antimeridiano senza esplodere', () => {
    // 0.002° di longitudine all’equatore ≈ 222 m: il calcolo non deve
    // interpretare il salto 179.999 → -179.999 come mezzo giro di mondo.
    const d = haversineMeters({ lat: 0, lng: 179.999 }, { lat: 0, lng: -179.999 })
    expect(d).toBeLessThan(300)
  })

  it('scala di quartiere: ~100 m restano ~100 m', () => {
    const d = haversineMeters({ lat: 45.4642, lng: 9.19 }, { lat: 45.4651, lng: 9.19 })
    expect(d).toBeGreaterThan(90)
    expect(d).toBeLessThan(110)
  })
})
