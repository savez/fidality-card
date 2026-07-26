import { describe, it, expect } from 'vitest'
import { formatCoords, mapUrl, fmtDate, fmtTime } from '@/utils/logFormat.js'

describe('logFormat', () => {
  it('formatCoords arrotonda a 5 decimali', () => {
    expect(formatCoords(45.464211, 9.19)).toBe('45.46421, 9.19000')
  })

  it('mapUrl costruisce un link OpenStreetMap con marker', () => {
    expect(mapUrl(45.5, 9.2)).toBe(
      'https://www.openstreetmap.org/?mlat=45.5&mlon=9.2#map=16/45.5/9.2'
    )
  })

  it('fmtDate ritorna una data in formato italiano gg/mm/aaaa', () => {
    expect(fmtDate(Date.UTC(2026, 2, 5, 12, 0, 0))).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
  })

  it('fmtTime ritorna ore:minuti a 2 cifre', () => {
    expect(fmtTime(Date.UTC(2026, 2, 5, 12, 0, 0))).toMatch(/^\d{2}:\d{2}$/)
  })
})
