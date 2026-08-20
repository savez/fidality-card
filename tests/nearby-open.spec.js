import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/db/cards.js', () => ({ listCards: vi.fn() }))
vi.mock('@/db/logs.js', () => ({ listAllLogs: vi.fn() }))
vi.mock('@/db/places.js', () => ({ listPlaces: vi.fn(), addPlace: vi.fn() }))
vi.mock('@/geo/poiIndex.js', () => ({ loadPois: vi.fn() }))

import { initNearbyOpen, useNearbyOpen } from '@/composables/useNearbyOpen.js'
import { listCards } from '@/db/cards.js'
import { listAllLogs } from '@/db/logs.js'
import { listPlaces, addPlace } from '@/db/places.js'
import { loadPois } from '@/geo/poiIndex.js'

const FIX = { latitude: 45.4642, longitude: 9.19, accuracy: 20 }
const AT_40M = { lat: 45.46456, lng: 9.19 }
const CARDS = [{ id: 'c1', name: 'Esselunga', brandId: 'esselunga' }]

const { setEnabled, suggestion, dismiss, accept, ignoreHere } = useNearbyOpen()

let getCurrentPosition

function router() {
  return { replace: vi.fn(), afterEach: vi.fn(() => () => {}) }
}

// Il fix arriva sul prossimo tick, così i test possono infilare
// un'interazione dell'utente nel mezzo.
function grantFix(coords = FIX) {
  getCurrentPosition = vi.fn((ok) => setTimeout(() => ok({ coords }), 0))
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition },
    permissions: { query: async () => ({ state: 'granted' }) },
  })
}

function permission(state) {
  getCurrentPosition = vi.fn((ok) => setTimeout(() => ok({ coords: FIX }), 0))
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition },
    permissions: { query: async () => ({ state }) },
  })
}

// Safari non espone 'geolocation' alla Permissions API: la query lancia.
function permissionUnsupported() {
  getCurrentPosition = vi.fn((ok) => setTimeout(() => ok({ coords: FIX }), 0))
  vi.stubGlobal('navigator', {
    geolocation: { getCurrentPosition },
    permissions: {
      query: async () => {
        throw new TypeError('geolocation non supportato')
      },
    },
  })
}

const settle = () => new Promise((r) => setTimeout(r, 5))

beforeEach(() => {
  vi.clearAllMocks()
  dismiss()
  setEnabled(true)
  listCards.mockResolvedValue(CARDS)
  listAllLogs.mockResolvedValue([])
  listPlaces.mockResolvedValue([])
  loadPois.mockResolvedValue(new Map())
  grantFix()
})

describe('initNearbyOpen — guardie', () => {
  it('flag spento → non chiede nemmeno la posizione', async () => {
    setEnabled(false)
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(r.replace).not.toHaveBeenCalled()
  })

  it('intento URL già applicato → si tira indietro, la scorciatoia vince', async () => {
    const r = router()
    await initNearbyOpen(r, { intentApplied: true })
    await settle()
    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(r.replace).not.toHaveBeenCalled()
  })

  it('permesso da chiedere → nessun prompt al boot', async () => {
    permission('prompt')
    await initNearbyOpen(router())
    await settle()
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('permesso negato → niente', async () => {
    permission('denied')
    await initNearbyOpen(router())
    await settle()
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('Permissions API muta e nessuna coordinata in archivio → nessun prompt', async () => {
    permissionUnsupported()
    listAllLogs.mockResolvedValue([{ cardId: 'c1', openedAt: 1, lat: null, lng: null }])
    await initNearbyOpen(router())
    await settle()
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('Permissions API muta ma coordinate già in archivio → si procede (caso Safari)', async () => {
    permissionUnsupported()
    listAllLogs.mockResolvedValue([{ cardId: 'c1', openedAt: 1, lat: 45.4, lng: 9.1 }])
    await initNearbyOpen(router())
    await settle()
    expect(getCurrentPosition).toHaveBeenCalled()
  })

  it('browser senza geolocalizzazione → esce senza errori', async () => {
    vi.stubGlobal('navigator', { permissions: { query: async () => ({ state: 'granted' }) } })
    const r = router()
    await expect(initNearbyOpen(r)).resolves.toBeUndefined()
    expect(r.replace).not.toHaveBeenCalled()
  })
})

describe('initNearbyOpen — esiti', () => {
  it('luogo confermato → apre la card a schermo pieno, senza chiedere', async () => {
    listPlaces.mockResolvedValue([{ id: 'p1', cardId: 'c1', ...AT_40M }])
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(r.replace).toHaveBeenCalledWith('/cards/c1?fs=1')
    expect(suggestion.value).toBeNull()
  })

  it('POI del catalogo → propone, senza navigare', async () => {
    loadPois.mockResolvedValue(new Map([['esselunga', [[AT_40M.lat, AT_40M.lng]]]]))
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(r.replace).not.toHaveBeenCalled()
    expect(suggestion.value.candidates[0]).toMatchObject({ cardId: 'c1', source: 'poi' })
    // Il candidato porta con sé la card, così il bottom sheet ha nome e brand.
    expect(suggestion.value.candidates[0].card.name).toBe('Esselunga')
  })

  it('carica solo i POI dei brand che hai in cassaforte', async () => {
    await initNearbyOpen(router())
    await settle()
    expect(loadPois).toHaveBeenCalledWith(['esselunga'])
  })

  it('nessuna evidenza → silenzio totale', async () => {
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(r.replace).not.toHaveBeenCalled()
    expect(suggestion.value).toBeNull()
  })

  it('fix non disponibile → silenzio', async () => {
    getCurrentPosition = vi.fn((_ok, err) => setTimeout(() => err({ code: 1 }), 0))
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      permissions: { query: async () => ({ state: 'granted' }) },
    })
    listPlaces.mockResolvedValue([{ id: 'p1', cardId: 'c1', ...AT_40M }])
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(r.replace).not.toHaveBeenCalled()
  })

  it('DB illeggibile → nessuna eccezione propagata', async () => {
    listAllLogs.mockRejectedValue(new Error('IndexedDB non disponibile'))
    await expect(initNearbyOpen(router())).resolves.toBeUndefined()
  })

  it('chiede il fix con budget corto e accetta un fix recente in cache', async () => {
    await initNearbyOpen(router())
    await settle()
    const opts = getCurrentPosition.mock.calls[0][2]
    expect(opts.timeout).toBeLessThanOrEqual(3000)
    expect(opts.maximumAge).toBeGreaterThan(0)
    expect(opts.enableHighAccuracy).toBe(false)
  })
})

describe('initNearbyOpen — annullamento', () => {
  it('un tap prima che arrivi il fix annulla tutto', async () => {
    listPlaces.mockResolvedValue([{ id: 'p1', cardId: 'c1', ...AT_40M }])
    const r = router()

    const running = initNearbyOpen(r)
    window.dispatchEvent(new Event('pointerdown'))
    await running
    await settle()

    expect(r.replace).not.toHaveBeenCalled()
    expect(suggestion.value).toBeNull()
  })

  it('un tasto premuto prima del fix annulla tutto', async () => {
    loadPois.mockResolvedValue(new Map([['esselunga', [[AT_40M.lat, AT_40M.lng]]]]))
    const r = router()

    const running = initNearbyOpen(r)
    window.dispatchEvent(new Event('keydown'))
    await running
    await settle()

    expect(suggestion.value).toBeNull()
  })

  it('si registra sui cambi di route per annullare la navigazione in corso', async () => {
    const r = router()
    await initNearbyOpen(r)
    await settle()
    expect(r.afterEach).toHaveBeenCalled()
  })
})

describe('risposte alla proposta', () => {
  async function withSuggestion() {
    loadPois.mockResolvedValue(new Map([['esselunga', [[AT_40M.lat, AT_40M.lng]]]]))
    const r = router()
    await initNearbyOpen(r)
    await settle()
    return r
  }

  it('conferma → salva il posto sulle coordinate del POI e apre la card', async () => {
    const r = await withSuggestion()
    const candidate = suggestion.value.candidates[0]

    await accept(candidate)

    expect(addPlace).toHaveBeenCalledWith({
      cardId: 'c1',
      lat: AT_40M.lat,
      lng: AT_40M.lng,
      accuracy: 20,
    })
    expect(r.replace).toHaveBeenCalledWith('/cards/c1?fs=1')
    expect(suggestion.value).toBeNull()
  })

  it('"non chiedere qui" → salva un luogo ignorato dove sei, e non naviga', async () => {
    const r = await withSuggestion()

    await ignoreHere()

    expect(addPlace).toHaveBeenCalledWith({
      cardId: null,
      lat: FIX.latitude,
      lng: FIX.longitude,
      accuracy: FIX.accuracy,
    })
    expect(r.replace).not.toHaveBeenCalled()
    expect(suggestion.value).toBeNull()
  })

  it('"non ora" → nessuna scrittura, si richiederà la prossima volta', async () => {
    await withSuggestion()
    dismiss()
    expect(addPlace).not.toHaveBeenCalled()
    expect(suggestion.value).toBeNull()
  })

  it('se il salvataggio del posto fallisce, la card si apre comunque', async () => {
    const r = await withSuggestion()
    addPlace.mockRejectedValue(new Error('quota superata'))

    await accept(suggestion.value.candidates[0])

    expect(r.replace).toHaveBeenCalledWith('/cards/c1?fs=1')
  })
})
