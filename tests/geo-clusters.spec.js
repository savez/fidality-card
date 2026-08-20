import { describe, it, expect } from 'vitest'
import { buildClusters } from '@/geo/clusters.js'

// Punti di comodo: A e A' distano ~30 m, B è a ~2,6 km da A.
const A = { lat: 45.4642, lng: 9.19 }
const A2 = { lat: 45.46447, lng: 9.19 }
const B = { lat: 45.4854, lng: 9.204 }

function log(cardId, point, openedAt) {
  return { cardId, openedAt, lat: point?.lat ?? null, lng: point?.lng ?? null, accuracy: 20 }
}

describe('buildClusters', () => {
  it('ignora i log senza coordinate', () => {
    const clusters = buildClusters([log('c1', null, 1), log('c1', null, 2)], 120)
    expect(clusters).toEqual([])
  })

  it('due visite allo stesso posto → un cluster con total 2', () => {
    const clusters = buildClusters([log('c1', A, 1), log('c1', A2, 2)], 120)
    expect(clusters.length).toBe(1)
    expect(clusters[0].total).toBe(2)
    expect(clusters[0].byCardId.get('c1')).toBe(2)
  })

  it('due posti distanti → due cluster', () => {
    const clusters = buildClusters([log('c1', A, 1), log('c1', B, 2)], 120)
    expect(clusters.length).toBe(2)
    expect(clusters.every((c) => c.total === 1)).toBe(true)
  })

  it('conta per card e tiene l’apertura più recente', () => {
    const clusters = buildClusters([log('c1', A, 100), log('c2', A2, 300), log('c1', A, 200)], 120)
    expect(clusters.length).toBe(1)
    expect(clusters[0].byCardId.get('c1')).toBe(2)
    expect(clusters[0].byCardId.get('c2')).toBe(1)
    expect(clusters[0].total).toBe(3)
    expect(clusters[0].lastOpenedAt).toBe(300)
  })

  it('il raggio decide: con 10 m A e A’ restano separati', () => {
    const clusters = buildClusters([log('c1', A, 1), log('c1', A2, 2)], 10)
    expect(clusters.length).toBe(2)
  })

  it('il centro del cluster è il primo punto incontrato (greedy, deterministico)', () => {
    const clusters = buildClusters([log('c1', A2, 1), log('c1', A, 2)], 120)
    expect(clusters[0].lat).toBe(A2.lat)
    expect(clusters[0].lng).toBe(A2.lng)
  })

  it('lista vuota → nessun cluster', () => {
    expect(buildClusters([], 120)).toEqual([])
  })
})
