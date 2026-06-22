import { describe, it, expect } from 'vitest'
import { readableTextColor } from '@/utils/contrast.js'

describe('readableTextColor', () => {
  it('testo scuro su brand chiari (es. Eni giallo)', () => {
    expect(readableTextColor('#FFCB05')).toBe('#14161a')
    expect(readableTextColor('#FFFFFF')).toBe('#14161a')
  })

  it('testo bianco su brand scuri/saturi', () => {
    expect(readableTextColor('#E30613')).toBe('#ffffff') // Esselunga
    expect(readableTextColor('#003D7A')).toBe('#ffffff') // Coop
    expect(readableTextColor('#000000')).toBe('#ffffff')
  })

  it('fallback al testo chiaro su input non valido', () => {
    expect(readableTextColor(null)).toBe('#ffffff')
    expect(readableTextColor('#abc')).toBe('#ffffff')
    expect(readableTextColor('rosso')).toBe('#ffffff')
  })
})
