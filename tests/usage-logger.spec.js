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
})
