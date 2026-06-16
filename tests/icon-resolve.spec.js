import { describe, it, expect } from 'vitest'
import { resolveIcon, FALLBACK_ICON } from '@/icons/resolve.js'

describe('resolveIcon', () => {
  it('returns the custom mdi icon when provided', () => {
    expect(resolveIcon({ icona: 'mdi-train' })).toEqual({
      type: 'mdi',
      value: 'mdi-train',
    })
  })

  it('returns emoji when custom icon is not an mdi-* identifier', () => {
    expect(resolveIcon({ icona: '🛒' })).toEqual({ type: 'emoji', value: '🛒' })
  })

  it('returns the brand iconDefault when no custom icon is provided', () => {
    const out = resolveIcon({ brandId: 'esselunga' })
    expect(out.type).toBe('mdi')
    expect(out.value).toBe('mdi-cart')
  })

  it('does NOT include a color in the resolved icon (regression: brand color leaked to v-icon, causing same-color invisible icon on CardTile band)', () => {
    const out = resolveIcon({ brandId: 'esselunga' })
    expect(out.color).toBeUndefined()
    expect('color' in out).toBe(false)
  })

  it('falls back to FALLBACK_ICON when no custom icon and no recognized brand', () => {
    expect(resolveIcon({})).toEqual({ type: 'mdi', value: FALLBACK_ICON })
    expect(resolveIcon({ brandId: null })).toEqual({ type: 'mdi', value: FALLBACK_ICON })
    expect(resolveIcon({ brandId: 'nonexistent' })).toEqual({
      type: 'mdi',
      value: FALLBACK_ICON,
    })
  })

  it('custom icon takes precedence over brand iconDefault', () => {
    const out = resolveIcon({ icona: 'mdi-pizza', brandId: 'esselunga' })
    expect(out).toEqual({ type: 'mdi', value: 'mdi-pizza' })
  })
})
