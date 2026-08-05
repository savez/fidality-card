import { describe, it, expect } from 'vitest'
import { resolveTarget } from '@/shortcuts/target.js'

const NOW = 1_700_000_000_000
const DAY = 86_400_000

function card(id, name, pinned = false) {
  return { id, name, pinned }
}
function log(cardId, openedAt) {
  return { cardId, openedAt }
}

describe('resolveTarget', () => {
  const cards = [card('a', 'Alfa'), card('b', 'Bravo', true), card('c', 'Charlie')]

  it('intent null → null', () => {
    expect(resolveTarget(null, { logs: [], cards, nowMs: NOW })).toBeNull()
  })

  it("kind card con id esistente → quell'id", () => {
    const intent = { kind: 'card', id: 'a' }
    expect(resolveTarget(intent, { logs: [], cards, nowMs: NOW })).toBe('a')
  })

  it('kind card con id inesistente → null', () => {
    const intent = { kind: 'card', id: 'zzz' }
    expect(resolveTarget(intent, { logs: [], cards, nowMs: NOW })).toBeNull()
  })

  it("kind pinned con una carta fissata → quell'id", () => {
    expect(resolveTarget({ kind: 'pinned' }, { logs: [], cards, nowMs: NOW })).toBe('b')
  })

  it('kind pinned senza carte fissate → null', () => {
    const noPin = [card('a', 'Alfa'), card('c', 'Charlie')]
    expect(resolveTarget({ kind: 'pinned' }, { logs: [], cards: noPin, nowMs: NOW })).toBeNull()
  })

  it("kind pinned con due carte fissate → vince l'ordine alfabetico, non l'ordine di input", () => {
    // "Zeta" arriva prima di "Alfa" nell'array (simula l'ordine arbitrario di Dexie),
    // ma deve vincere "Alfa" perché il tie-break è alfabetico, non posizionale.
    const twoPinned = [card('z', 'Zeta', true), card('a', 'Alfa', true), card('m', 'Mu')]
    expect(resolveTarget({ kind: 'pinned' }, { logs: [], cards: twoPinned, nowMs: NOW })).toBe('a')
  })

  it('most-used: vincitore nella finestra di 30 giorni', () => {
    const logs = [log('a', NOW - 1 * DAY), log('a', NOW - 2 * DAY), log('c', NOW - 3 * DAY)]
    expect(resolveTarget({ kind: 'most-used' }, { logs, cards, nowMs: NOW })).toBe('a')
  })

  it('most-used: finestra 30gg vuota ma log più vecchi → degrado ad all-time', () => {
    const logs = [log('c', NOW - 40 * DAY), log('c', NOW - 41 * DAY), log('a', NOW - 45 * DAY)]
    expect(resolveTarget({ kind: 'most-used' }, { logs, cards, nowMs: NOW })).toBe('c')
  })

  it('most-used: nessun log → degrado alla prima carta fissata', () => {
    expect(resolveTarget({ kind: 'most-used' }, { logs: [], cards, nowMs: NOW })).toBe('b')
  })

  it('most-used: nessun log e nessun pin → null', () => {
    const noPin = [card('a', 'Alfa'), card('c', 'Charlie')]
    expect(resolveTarget({ kind: 'most-used' }, { logs: [], cards: noPin, nowMs: NOW })).toBeNull()
  })

  it('most-used: log residui di una carta cancellata non producono un vincitore fantasma', () => {
    const logs = [log('zzz', NOW - 1 * DAY), log('zzz', NOW - 2 * DAY), log('a', NOW - 1 * DAY)]
    expect(resolveTarget({ kind: 'most-used' }, { logs, cards, nowMs: NOW })).toBe('a')
  })
})
