import { describe, it, expect } from 'vitest'
import { groupLogsByCard } from '@/utils/groupLogsByCard.js'

const CARD_A = { id: 'a', name: 'Card A' }
const CARD_B = { id: 'b', name: 'Card B' }
const CARD_C = { id: 'c', name: 'Card C' }

describe('groupLogsByCard', () => {
  it('esclude le card senza alcun log', () => {
    const result = groupLogsByCard(
      [CARD_A, CARD_B],
      [{ id: 'l1', cardId: 'a', openedAt: 100, lat: null, lng: null }]
    )
    expect(result.map((g) => g.card.id)).toEqual(['a'])
  })

  it('include le card con log ma senza coordinate, con latestWithCoords null', () => {
    const result = groupLogsByCard(
      [CARD_A],
      [{ id: 'l1', cardId: 'a', openedAt: 100, lat: null, lng: null }]
    )
    expect(result[0].logs).toHaveLength(1)
    expect(result[0].latestWithCoords).toBeNull()
  })

  it('sceglie il log più recente CON coordinate come latestWithCoords, anche se non è il primo della lista', () => {
    // I log arrivano già ordinati per openedAt decrescente (come da listAllLogs()):
    // il più recente in assoluto (300) non ha coordinate, quello con coordinate è il secondo (200).
    const result = groupLogsByCard(
      [CARD_A],
      [
        { id: 'l1', cardId: 'a', openedAt: 300, lat: null, lng: null },
        { id: 'l2', cardId: 'a', openedAt: 200, lat: 45.1, lng: 9.2 },
        { id: 'l3', cardId: 'a', openedAt: 100, lat: 45.0, lng: 9.0 },
      ]
    )
    expect(result[0].latestWithCoords.id).toBe('l2')
  })

  it("mantiene l'ordine delle card in input, non l'ordine dei log", () => {
    const result = groupLogsByCard(
      [CARD_B, CARD_A],
      [
        { id: 'l1', cardId: 'a', openedAt: 100, lat: null, lng: null },
        { id: 'l2', cardId: 'b', openedAt: 50, lat: null, lng: null },
      ]
    )
    expect(result.map((g) => g.card.id)).toEqual(['b', 'a'])
  })

  it('ogni gruppo contiene solo i log della propria card', () => {
    const result = groupLogsByCard(
      [CARD_A, CARD_C],
      [
        { id: 'l1', cardId: 'a', openedAt: 100, lat: null, lng: null },
        { id: 'l2', cardId: 'c', openedAt: 90, lat: null, lng: null },
        { id: 'l3', cardId: 'a', openedAt: 80, lat: null, lng: null },
      ]
    )
    const groupA = result.find((g) => g.card.id === 'a')
    expect(groupA.logs.map((l) => l.id)).toEqual(['l1', 'l3'])
  })
})
