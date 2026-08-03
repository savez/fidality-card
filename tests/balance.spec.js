// tests/balance.spec.js
import { describe, it, expect } from 'vitest'
import {
  centsFromEuros,
  formatCents,
  hasBalance,
  balanceGroup,
  matchesBalanceFilter,
  subtractCents,
  consumedRatio,
} from '@/utils/balance.js'

const loyalty = { id: 'a' } // balanceCents assente
const active = { id: 'b', balanceCents: 1230, initialBalanceCents: 5000 }
const empty = { id: 'c', balanceCents: 0, initialBalanceCents: 5000 }
const norm = (s) => s.replace(/[\u00A0 ]/g, ' ') // Intl usa spazi non-breaking

describe('centsFromEuros', () => {
  it('converte euro (number e string) in centesimi interi', () => {
    expect(centsFromEuros(12.3)).toBe(1230)
    expect(centsFromEuros('12,30'.replace(',', '.'))).toBe(1230)
    expect(centsFromEuros(0)).toBe(0)
  })
  it('non introduce deriva float', () => {
    expect(centsFromEuros(0.1 + 0.2)).toBe(30)
  })
})

describe('formatCents', () => {
  it('formatta in euro it-IT', () => {
    expect(norm(formatCents(1230))).toBe('12,30 €')
    expect(norm(formatCents(0))).toBe('0,00 €')
  })
})

describe('hasBalance / balanceGroup', () => {
  it('discrimina sulla presenza del campo, non sul valore', () => {
    expect(hasBalance(loyalty)).toBe(false)
    expect(hasBalance(empty)).toBe(true) // 0 resta gift card
    expect(balanceGroup(loyalty)).toBe('loyalty')
    expect(balanceGroup(active)).toBe('active')
    expect(balanceGroup(empty)).toBe('empty')
  })
})

describe('matchesBalanceFilter', () => {
  it('partiziona i gruppi e "all" prende tutto', () => {
    for (const c of [loyalty, active, empty]) {
      expect(matchesBalanceFilter(c, 'all')).toBe(true)
    }
    expect(matchesBalanceFilter(loyalty, 'loyalty')).toBe(true)
    expect(matchesBalanceFilter(active, 'active')).toBe(true)
    expect(matchesBalanceFilter(empty, 'empty')).toBe(true)
    expect(matchesBalanceFilter(active, 'loyalty')).toBe(false)
    expect(matchesBalanceFilter(empty, 'active')).toBe(false)
  })
})

describe('subtractCents', () => {
  it('sottrae in centesimi e fa clamp a 0', () => {
    expect(subtractCents(1230, 10)).toBe(1220)
    expect(subtractCents(1230, 2000)).toBe(0)
  })
  it('sottrazioni ripetute non derivano', () => {
    let c = 1230
    for (let i = 0; i < 5; i++) c = subtractCents(c, 10)
    expect(c).toBe(1180)
  })
})

describe('consumedRatio', () => {
  it('quota spesa in [0,1]', () => {
    expect(consumedRatio(active)).toBeCloseTo(1 - 1230 / 5000)
    expect(consumedRatio(empty)).toBe(1)
    expect(consumedRatio(loyalty)).toBe(0)
    expect(consumedRatio({ balanceCents: 10, initialBalanceCents: 0 })).toBe(0)
  })
})
