import { describe, it, expect } from 'vitest'
import { CURATED_ICONS, CATEGORY_ORDER } from '@/icons/curated.js'

describe('curated icons catalog', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(CURATED_ICONS)).toBe(true)
    expect(CURATED_ICONS.length).toBeGreaterThanOrEqual(30)
  })

  it('every icon has id matching mdi-* format and a non-empty label/category', () => {
    for (const ico of CURATED_ICONS) {
      expect(ico.id).toMatch(/^mdi-[a-z0-9-]+$/)
      expect(typeof ico.label).toBe('string')
      expect(ico.label.length).toBeGreaterThan(0)
      expect(typeof ico.category).toBe('string')
      expect(ico.category.length).toBeGreaterThan(0)
    }
  })

  it('all ids are unique', () => {
    const ids = CURATED_ICONS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every category used in icons exists in CATEGORY_ORDER', () => {
    const usedCategories = new Set(CURATED_ICONS.map((i) => i.category))
    for (const cat of usedCategories) {
      expect(CATEGORY_ORDER).toContain(cat)
    }
  })

  it('CATEGORY_ORDER has no duplicates and matches all used categories', () => {
    expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length)
    const used = new Set(CURATED_ICONS.map((i) => i.category))
    expect(used.size).toBe(CATEGORY_ORDER.length)
  })
})
