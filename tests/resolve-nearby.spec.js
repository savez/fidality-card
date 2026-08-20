import { describe, it, expect } from 'vitest'
import { resolveNearby, DEFAULTS } from '@/geo/resolveNearby.js'

// Geometria dei test, tutta intorno al Duomo di Milano.
const FIX = { lat: 45.4642, lng: 9.19, accuracy: 20 }
const AT_40M = { lat: 45.46456, lng: 9.19 }
const AT_60M = { lat: 45.46474, lng: 9.19 }
const AT_110M = { lat: 45.4652, lng: 9.19 }
const AT_300M = { lat: 45.4669, lng: 9.19 }
const FAR = { lat: 45.4854, lng: 9.204 } // ~2,6 km

const CARDS = [
  { id: 'c1', name: 'Esselunga', brandId: 'esselunga' },
  { id: 'c2', name: 'Decathlon', brandId: 'decathlon' },
  { id: 'c3', name: 'Bar sotto casa', brandId: null },
]

function place(cardId, point, extra = {}) {
  return { id: `p-${cardId ?? 'ignored'}`, cardId, lat: point.lat, lng: point.lng, ...extra }
}

function log(cardId, point, openedAt) {
  return { cardId, openedAt, lat: point.lat, lng: point.lng, accuracy: 20 }
}

function pois(entries) {
  return new Map(entries)
}

describe('resolveNearby — gate di ingresso', () => {
  it('accuratezza oltre la soglia → null (fix da IP o cella, inutile)', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: { ...FIX, accuracy: 1200 },
    })
    expect(result).toBeNull()
  })

  it('nessun dato → null', () => {
    expect(resolveNearby({ fix: FIX })).toBeNull()
  })

  it('fix mancante o senza coordinate → null', () => {
    expect(resolveNearby({ cards: CARDS })).toBeNull()
    expect(resolveNearby({ cards: CARDS, fix: { lat: null, lng: null } })).toBeNull()
  })
})

describe('resolveNearby — luoghi confermati (livello 1)', () => {
  it('luogo confermato entro raggio → apre diretto, senza chiedere', () => {
    const result = resolveNearby({
      places: [place('c1', AT_40M)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toEqual({ action: 'open', cardId: 'c1', placeId: 'p-c1' })
  })

  it('luogo ignorato vince su POI e su cluster — il caso "abito sopra il negozio"', () => {
    const result = resolveNearby({
      places: [place(null, AT_40M)],
      logs: [log('c1', AT_40M, 1), log('c1', AT_40M, 2), log('c1', AT_40M, 3)],
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('il luogo più vicino vince fra due confermati', () => {
    const result = resolveNearby({
      places: [place('c2', AT_110M), place('c1', AT_40M)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result.cardId).toBe('c1')
  })

  it('il raggio si allarga con l’accuratezza del fix', () => {
    const far = { places: [place('c1', AT_300M)], cards: CARDS }
    expect(resolveNearby({ ...far, fix: { ...FIX, accuracy: 20 } })).toBeNull()
    expect(resolveNearby({ ...far, fix: { ...FIX, accuracy: 350 } })).toMatchObject({
      action: 'open',
      cardId: 'c1',
    })
  })

  it('luogo che punta a una card cancellata → si prosegue coi livelli sotto', () => {
    const result = resolveNearby({
      places: [place('fantasma', AT_40M)],
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: FIX,
    })
    expect(result.action).toBe('confirm')
    expect(result.candidates.map((c) => c.cardId)).toEqual(['c1'])
  })

  it('luogo fuori raggio → non conta', () => {
    const result = resolveNearby({ places: [place('c1', FAR)], cards: CARDS, fix: FIX })
    expect(result).toBeNull()
  })
})

describe('resolveNearby — catalogo POI (livello 2, la prima volta)', () => {
  it('POI a 60 m senza nessuno storico → propone quella carta', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: FIX,
    })
    expect(result.action).toBe('confirm')
    expect(result.candidates.length).toBe(1)
    expect(result.candidates[0]).toMatchObject({ cardId: 'c1', source: 'poi' })
    expect(result.candidates[0].distanceM).toBeGreaterThan(40)
    expect(result.candidates[0].distanceM).toBeLessThan(80)
  })

  it('due brand entro raggio → due candidati ordinati per distanza', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([
        ['decathlon', [[AT_110M.lat, AT_110M.lng]]],
        ['esselunga', [[AT_60M.lat, AT_60M.lng]]],
      ]),
      fix: FIX,
    })
    expect(result.candidates.map((c) => c.cardId)).toEqual(['c1', 'c2'])
  })

  it('carta senza brandId → mai candidata via POI', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([[null, [[AT_40M.lat, AT_40M.lng]]]]),
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('brand senza file POI, o con lista vuota → nessun candidato', () => {
    expect(resolveNearby({ cards: CARDS, pois: pois([['esselunga', []]]), fix: FIX })).toBeNull()
    expect(resolveNearby({ cards: CARDS, pois: pois([]), fix: FIX })).toBeNull()
  })

  it('POI del brand giusto ma lontano → nessun candidato', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([['esselunga', [[FAR.lat, FAR.lng]]]]),
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('fra più punti dello stesso brand vince il più vicino', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([
        [
          'esselunga',
          [
            [AT_110M.lat, AT_110M.lng],
            [AT_40M.lat, AT_40M.lng],
          ],
        ],
      ]),
      fix: FIX,
    })
    expect(result.candidates[0].lat).toBe(AT_40M.lat)
  })

  it('POI di un brand che non hai in cassaforte → ignorato', () => {
    const result = resolveNearby({
      cards: [CARDS[0]],
      pois: pois([['decathlon', [[AT_40M.lat, AT_40M.lng]]]]),
      fix: FIX,
    })
    expect(result).toBeNull()
  })
})

describe('resolveNearby — cluster dai log (livello 3)', () => {
  it('una sola apertura → non basta', () => {
    const result = resolveNearby({
      logs: [log('c1', AT_40M, 1)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('due carte 50/50 nello stesso posto → nessuna domina, niente proposta', () => {
    const result = resolveNearby({
      logs: [log('c1', AT_40M, 1), log('c2', AT_40M, 2)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('carta dominante nel cluster → propone, con evidenza "log"', () => {
    const result = resolveNearby({
      logs: [
        log('c1', AT_40M, 1),
        log('c1', AT_40M, 2),
        log('c1', AT_40M, 3),
        log('c2', AT_40M, 4),
      ],
      cards: CARDS,
      fix: FIX,
    })
    expect(result.action).toBe('confirm')
    expect(result.candidates).toEqual([expect.objectContaining({ cardId: 'c1', source: 'log' })])
  })

  it('funziona anche per una carta senza brandId — è il senso del livello 3', () => {
    const result = resolveNearby({
      logs: [log('c3', AT_40M, 1), log('c3', AT_40M, 2)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result.candidates[0]).toMatchObject({ cardId: 'c3', source: 'log' })
  })

  it('cluster dominato da una card cancellata → nessun candidato', () => {
    const result = resolveNearby({
      logs: [log('fantasma', AT_40M, 1), log('fantasma', AT_40M, 2)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('cluster lontano dal fix → non conta', () => {
    const result = resolveNearby({
      logs: [log('c1', FAR, 1), log('c1', FAR, 2)],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toBeNull()
  })

  it('i log senza coordinate non fanno cluster', () => {
    const result = resolveNearby({
      logs: [
        { cardId: 'c1', openedAt: 1, lat: null, lng: null, accuracy: null },
        { cardId: 'c1', openedAt: 2, lat: null, lng: null, accuracy: null },
      ],
      cards: CARDS,
      fix: FIX,
    })
    expect(result).toBeNull()
  })
})

describe('resolveNearby — merge delle evidenze', () => {
  it('per la stessa carta l’evidenza POI prevale su quella dei log', () => {
    const result = resolveNearby({
      logs: [log('c1', AT_110M, 1), log('c1', AT_110M, 2)],
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: FIX,
    })
    expect(result.candidates.length).toBe(1)
    expect(result.candidates[0]).toMatchObject({ cardId: 'c1', source: 'poi' })
    expect(result.candidates[0].lat).toBe(AT_60M.lat)
  })

  it('POI per una carta e cluster per un’altra → due candidati', () => {
    const result = resolveNearby({
      logs: [log('c3', AT_40M, 1), log('c3', AT_40M, 2)],
      cards: CARDS,
      pois: pois([['esselunga', [[AT_110M.lat, AT_110M.lng]]]]),
      fix: FIX,
    })
    expect(result.candidates.map((c) => c.cardId).sort()).toEqual(['c1', 'c3'])
  })

  it('il fix viene restituito così da poterlo salvare come luogo', () => {
    const result = resolveNearby({
      cards: CARDS,
      pois: pois([['esselunga', [[AT_60M.lat, AT_60M.lng]]]]),
      fix: FIX,
    })
    expect(result.fix).toEqual({ lat: FIX.lat, lng: FIX.lng, accuracy: FIX.accuracy })
  })

  it('le soglie sono sovrascrivibili per test e messa a punto', () => {
    const args = { logs: [log('c1', AT_40M, 1)], cards: CARDS, fix: FIX }
    expect(resolveNearby(args)).toBeNull()
    expect(resolveNearby({ ...args, opts: { minOpens: 1 } }).candidates[0].cardId).toBe('c1')
  })

  it('DEFAULTS espone le soglie documentate', () => {
    expect(DEFAULTS).toMatchObject({
      maxAccuracyM: 400,
      placeRadiusM: 150,
      poiRadiusM: 150,
      clusterRadiusM: 120,
      minOpens: 2,
      dominance: 0.6,
    })
  })
})
