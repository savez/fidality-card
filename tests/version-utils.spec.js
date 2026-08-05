import { describe, it, expect } from 'vitest'
import { compareVersions, versionBars } from '@/utils/version.js'

describe('compareVersions', () => {
  it('confronta major, minor e patch', () => {
    expect(compareVersions('3.0.0', '2.9.9')).toBe(1)
    expect(compareVersions('2.9.0', '2.8.5')).toBe(1)
    expect(compareVersions('2.8.1', '2.8.0')).toBe(1)
    expect(compareVersions('2.8.0', '2.8.1')).toBe(-1)
    expect(compareVersions('2.8.0', '2.8.0')).toBe(0)
  })

  it('confronta numericamente, non come stringhe', () => {
    expect(compareVersions('2.10.0', '2.9.0')).toBe(1)
    expect(compareVersions('2.9.0', '2.10.0')).toBe(-1)
  })

  it('accetta versioni con meno di tre campi trattando i mancanti come zero', () => {
    expect(compareVersions('3', '2.9.9')).toBe(1)
    expect(compareVersions('2.8', '2.8.0')).toBe(0)
  })

  it('ritorna null su input non parsabile invece di lanciare', () => {
    expect(compareVersions(null, '2.8.0')).toBeNull()
    expect(compareVersions('2.8.0', undefined)).toBeNull()
    expect(compareVersions('?.?.?', '2.8.0')).toBeNull()
    expect(compareVersions('', '2.8.0')).toBeNull()
    expect(compareVersions('2.x.0', '2.8.0')).toBeNull()
    expect(compareVersions(280, '2.8.0')).toBeNull()
  })
})

describe('versionBars', () => {
  it('è deterministica: stessa versione, stesso disegno', () => {
    expect(versionBars('2.8.0')).toEqual(versionBars('2.8.0'))
  })

  it('produce disegni diversi per versioni diverse', () => {
    expect(versionBars('2.8.0')).not.toEqual(versionBars('2.9.0'))
  })

  it('ritorna solo larghezze positive', () => {
    const bars = versionBars('2.10.3')
    expect(bars.length).toBeGreaterThan(0)
    for (const width of bars) {
      expect(width).toBeGreaterThan(0)
    }
  })

  it('ritorna array vuoto su input non parsabile', () => {
    expect(versionBars('?.?.?')).toEqual([])
    expect(versionBars(null)).toEqual([])
    expect(versionBars('')).toEqual([])
  })
})
