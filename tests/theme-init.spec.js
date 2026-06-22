import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { initialThemeName } from '@/composables/useTheme.js'

const KEY = 'fidality-card:theme-mode'

function stubMatchMedia(matches) {
  vi.stubGlobal('matchMedia', (q) => ({
    matches,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }))
}

describe('initialThemeName', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.unstubAllGlobals())

  it("ritorna 'dark' se la modalità salvata è dark", () => {
    localStorage.setItem(KEY, 'dark')
    expect(initialThemeName()).toBe('dark')
  })

  it("ritorna 'light' se la modalità salvata è light", () => {
    localStorage.setItem(KEY, 'light')
    expect(initialThemeName()).toBe('light')
  })

  it("'system' con OS scuro → dark", () => {
    localStorage.setItem(KEY, 'system')
    stubMatchMedia(true)
    expect(initialThemeName()).toBe('dark')
  })

  it("'system' con OS chiaro → light", () => {
    localStorage.setItem(KEY, 'system')
    stubMatchMedia(false)
    expect(initialThemeName()).toBe('light')
  })

  it('nessuna preferenza salvata → default system', () => {
    stubMatchMedia(true)
    expect(initialThemeName()).toBe('dark')
  })
})
