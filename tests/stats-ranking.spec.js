import { describe, it, expect } from 'vitest'
import { sinceFor, buildRanking } from '@/stats/ranking.js'

const NOW = 1_700_000_000_000
const DAY = 86_400_000

function card(id, name, brandId = null) {
  return { id, name, brandId }
}
function log(cardId, openedAt) {
  return { cardId, openedAt }
}

describe('sinceFor', () => {
  it('week = now - 7 giorni', () => {
    expect(sinceFor('week', NOW)).toBe(NOW - 7 * DAY)
  })
  it('month = now - 30 giorni', () => {
    expect(sinceFor('month', NOW)).toBe(NOW - 30 * DAY)
  })
  it('year = now - 365 giorni', () => {
    expect(sinceFor('year', NOW)).toBe(NOW - 365 * DAY)
  })
  it('all = 0 (nessuna soglia)', () => {
    expect(sinceFor('all', NOW)).toBe(0)
  })
  it('range sconosciuto = 0', () => {
    expect(sinceFor('boh', NOW)).toBe(0)
  })
})

describe('buildRanking', () => {
  const cards = [card('a', 'Alfa'), card('b', 'Bravo'), card('c', 'Charlie')]

  it('input vuoto → []', () => {
    expect(buildRanking([], cards, 0)).toEqual([])
  })

  it('conta le aperture per carta, ordine decrescente', () => {
    const logs = [log('a', 10), log('a', 20), log('b', 30)]
    const r = buildRanking(logs, cards, 0)
    expect(r.map((x) => [x.card.id, x.count])).toEqual([
      ['a', 2],
      ['b', 1],
    ])
  })

  it('esclude i log fuori dalla finestra (openedAt < sinceMs)', () => {
    const logs = [log('a', NOW - 2 * DAY), log('a', NOW - 40 * DAY), log('b', NOW - 1 * DAY)]
    const r = buildRanking(logs, cards, sinceFor('week', NOW))
    expect(r.map((x) => [x.card.id, x.count])).toEqual([
      ['a', 1],
      ['b', 1],
    ])
  })

  it('esclude log di carte cancellate (cardId senza card)', () => {
    const logs = [log('zzz', 10), log('a', 10)]
    const r = buildRanking(logs, cards, 0)
    expect(r.map((x) => x.card.id)).toEqual(['a'])
  })

  it('tie-break alfabetico (locale it) a parità di conteggio', () => {
    const logs = [log('c', 1), log('b', 2), log('a', 3)]
    const r = buildRanking(logs, cards, 0)
    expect(r.map((x) => x.card.name)).toEqual(['Alfa', 'Bravo', 'Charlie'])
  })
})
