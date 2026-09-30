import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useLogsStore } from '@/stores/logs.js'
import { useUsageLogger } from '@/composables/useUsageLogger.js'

const Host = defineComponent({
  props: { cardId: { type: String, required: true } },
  setup(props) {
    useUsageLogger(props.cardId)
    return () => null
  },
})

const HostSkip = defineComponent({
  props: { cardId: { type: String, required: true }, skip: { type: Function, required: true } },
  setup(props) {
    useUsageLogger(props.cardId, { skip: props.skip })
    return () => null
  },
})

function setGeolocation(impl) {
  Object.defineProperty(navigator, 'geolocation', {
    value: impl,
    configurable: true,
    writable: true,
  })
}
const grant = (coords) => setGeolocation({ getCurrentPosition: (ok) => ok({ coords }) })
const deny = () =>
  setGeolocation({ getCurrentPosition: (_ok, err) => err({ code: 1, message: 'denied' }) })

let store
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  store = useLogsStore()
  store.recordOpen = vi.fn().mockResolvedValue('log-1')
  store.attachCoords = vi.fn().mockResolvedValue(undefined)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  setGeolocation(undefined)
})

describe('useUsageLogger', () => {
  it('non logga prima dei 3 secondi', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(2999)
    expect(store.recordOpen).not.toHaveBeenCalled()
  })

  it('logga a 3 secondi con il cardId', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).toHaveBeenCalledOnce()
    expect(store.recordOpen).toHaveBeenCalledWith(expect.objectContaining({ cardId: 'c1' }))
  })

  it('unmount prima dei 3s → nessun log', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    const wrapper = mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(1000)
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(3000)
    expect(store.recordOpen).not.toHaveBeenCalled()
  })

  it('permesso concesso → allega le coordinate', async () => {
    grant({ latitude: 45.1, longitude: 9.2, accuracy: 8 })
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.attachCoords).toHaveBeenCalledWith('log-1', {
      lat: 45.1,
      lng: 9.2,
      accuracy: 8,
    })
  })

  it('permesso negato → log scritto ma nessuna coordinata', async () => {
    deny()
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).toHaveBeenCalledOnce()
    expect(store.attachCoords).not.toHaveBeenCalled()
  })

  it('tracciamento disattivato → nessun log', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    store.setEnabled(false)
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).not.toHaveBeenCalled()
  })

  it('recordOpen in errore → nessuna unhandled rejection', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    store.recordOpen = vi.fn().mockRejectedValue(new Error('quota exceeded'))
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).toHaveBeenCalledOnce()
    expect(store.attachCoords).not.toHaveBeenCalled()
  })

  it('getCurrentPosition lancia in modo sincrono → nessuna unhandled rejection', async () => {
    setGeolocation({
      getCurrentPosition: () => {
        throw new Error('geolocation unavailable')
      },
    })
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).toHaveBeenCalledOnce()
    expect(store.attachCoords).not.toHaveBeenCalled()
  })

  it('attachCoords in errore → nessuna unhandled rejection', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    // Nota: NON usiamo `vi.fn(...)` qui. Anche passandogli un'implementazione
    // che ritorna un `Promise.reject(...)` "nudo", lo spy interno di Vitest
    // (tinyspy) allega comunque un proprio `.then(onFulfilled, onRejected)`
    // alla promise per popolare `mock.results`/`mock.resolves` — e questo di
    // per sé la marca come "handled" agli occhi di Node, indipendentemente
    // dal `.catch(() => {})` nel codice sorgente. Usando una funzione
    // "normale" (non wrappata da vi.fn) nessuno intercetta la promise
    // rejection tranne il `.catch()` che il composable deve aggiungere: se lo
    // rimuoviamo, Node segnala davvero una unhandled rejection e il test
    // fallisce, rendendolo un vero test di regressione.
    let called = false
    let calledArgs
    store.attachCoords = (...args) => {
      called = true
      calledArgs = args
      return Promise.reject(new Error('quota exceeded'))
    }
    mount(Host, { props: { cardId: 'c1' } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(called).toBe(true)
    expect(calledArgs).toEqual(['log-1', { lat: 1, lng: 2, accuracy: 5 }])
  })

  it('skip() vero a 3s → nessun log e nessuna richiesta di posizione', async () => {
    const getCurrentPosition = vi.fn()
    setGeolocation({ getCurrentPosition })
    mount(HostSkip, { props: { cardId: 'c1', skip: () => true } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).not.toHaveBeenCalled()
    expect(getCurrentPosition).not.toHaveBeenCalled()
  })

  it('skip valutato al momento del fire, non al mount', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    let isDoc = false
    mount(HostSkip, { props: { cardId: 'c1', skip: () => isDoc } })
    isDoc = true // la card si scopre documento dopo il mount
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).not.toHaveBeenCalled()
  })

  it('skip() falso → logga come sempre', async () => {
    grant({ latitude: 1, longitude: 2, accuracy: 5 })
    mount(HostSkip, { props: { cardId: 'c1', skip: () => false } })
    await vi.advanceTimersByTimeAsync(3000)
    await flushPromises()
    expect(store.recordOpen).toHaveBeenCalledOnce()
  })
})
