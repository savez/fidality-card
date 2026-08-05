import { describe, it, expect } from 'vitest'
import { parseIntent } from '@/shortcuts/intent.js'

describe('parseIntent', () => {
  it('riconosce most-used', () => {
    expect(parseIntent('?open=most-used')).toEqual({ kind: 'most-used' })
  })

  it('riconosce pinned', () => {
    expect(parseIntent('?open=pinned')).toEqual({ kind: 'pinned' })
  })

  it('riconosce un uuid v4 come carta specifica', () => {
    const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    expect(parseIntent(`?open=${id}`)).toEqual({ kind: 'card', id })
  })

  it('normalizza un uuid v4 maiuscolo in minuscolo', () => {
    const id = '3FA85F64-5717-4562-B3FC-2C963F66AFA6'
    expect(parseIntent(`?open=${id}`)).toEqual({
      kind: 'card',
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
  })

  it('valore non riconosciuto (non keyword, non uuid) → null', () => {
    expect(parseIntent('?open=boh')).toBeNull()
  })

  it('query assente → null', () => {
    expect(parseIntent('')).toBeNull()
  })

  it('param open assente ma altri param presenti → null', () => {
    expect(parseIntent('?utm=x')).toBeNull()
  })

  it('param extra non interferisce col riconoscimento', () => {
    expect(parseIntent('?utm=x&open=pinned')).toEqual({ kind: 'pinned' })
  })

  it('param open ripetuto → prende il primo, deterministico', () => {
    expect(parseIntent('?open=pinned&open=most-used')).toEqual({ kind: 'pinned' })
  })

  it('uuid v1 (non v4) → null', () => {
    expect(parseIntent('?open=3fa85f64-5717-1562-b3fc-2c963f66afa6')).toBeNull()
  })
})
