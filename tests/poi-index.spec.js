import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { loadPois, resetPoiCache } from '@/geo/poiIndex.js'

function ok(points) {
  return {
    ok: true,
    json: async () => ({ brandId: 'x', points }),
  }
}

beforeEach(() => {
  resetPoiCache()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadPois', () => {
  it('scarica un brand e ritorna i suoi punti', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([[45.46, 9.19]]))
    vi.stubGlobal('fetch', fetchMock)

    const pois = await loadPois(['esselunga'])

    expect(pois.get('esselunga')).toEqual([[45.46, 9.19]])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('pois/esselunga.json')
  })

  it('brand senza file (404) → nessun punto e nessun errore propagato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    const pois = await loadPois(['cienne'])
    expect(pois.size).toBe(0)
  })

  it('offline (fetch che rifiuta) → nessun punto e nessun errore propagato', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const pois = await loadPois(['esselunga'])
    expect(pois.size).toBe(0)
  })

  it('JSON senza array points → trattato come vuoto', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
    const pois = await loadPois(['esselunga'])
    expect(pois.size).toBe(0)
  })

  it('il secondo giro è servito dalla cache di sessione, senza rifetchare', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([[45.46, 9.19]]))
    vi.stubGlobal('fetch', fetchMock)

    await loadPois(['esselunga'])
    await loadPois(['esselunga'])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('un 404 viene ricordato: quel brand non ha un file, inutile ritentare', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)

    await loadPois(['cienne'])
    await loadPois(['cienne'])

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('un errore di rete NON viene ricordato: un tentativo offline non spegne il catalogo', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(ok([[45.46, 9.19]]))
    vi.stubGlobal('fetch', fetchMock)

    expect((await loadPois(['esselunga'])).size).toBe(0)
    // Tornata la rete, il secondo tentativo va a buon fine.
    expect((await loadPois(['esselunga'])).get('esselunga')).toEqual([[45.46, 9.19]])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('brand duplicati o nulli → una sola richiesta, niente crash', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([[45.46, 9.19]]))
    vi.stubGlobal('fetch', fetchMock)

    const pois = await loadPois(['esselunga', 'esselunga', null, undefined])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(pois.size).toBe(1)
  })

  it('lista vuota → nessuna richiesta', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect((await loadPois([])).size).toBe(0)
    expect((await loadPois()).size).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('più brand in parallelo, solo quelli con punti finiscono nella Map', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) =>
        String(url).includes('esselunga') ? ok([[45.46, 9.19]]) : { ok: false, status: 404 }
      )
    )

    const pois = await loadPois(['esselunga', 'decathlon'])

    expect([...pois.keys()]).toEqual(['esselunga'])
  })

  it('la URL porta la versione, per invalidare la cache del service worker', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok([[1, 1]]))
    vi.stubGlobal('fetch', fetchMock)
    await loadPois(['esselunga'])
    expect(fetchMock.mock.calls[0][0]).toMatch(/\?v=/)
  })
})
