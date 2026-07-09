import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { db } from '@/db/index.js'
import { useLogsStore } from '@/stores/logs.js'

beforeEach(async () => {
  setActivePinia(createPinia())
  localStorage.clear()
  await db.logs.clear()
})

describe('logs store', () => {
  it('enabled default true quando localStorage è vuoto', () => {
    const logs = useLogsStore()
    expect(logs.enabled).toBe(true)
  })

  it('setEnabled(false) persiste "off" e disabilita', () => {
    const logs = useLogsStore()
    logs.setEnabled(false)
    expect(logs.enabled).toBe(false)
    expect(localStorage.getItem('fidality-card:usage-logging')).toBe('off')
  })

  it('nuovo store legge enabled=false da localStorage', () => {
    localStorage.setItem('fidality-card:usage-logging', 'off')
    const logs = useLogsStore()
    expect(logs.enabled).toBe(false)
  })

  it('recordOpen scrive e loadForCard rilegge', async () => {
    const logs = useLogsStore()
    const id = await logs.recordOpen({ cardId: 'c1', openedAt: 500 })
    expect(typeof id).toBe('string')
    await logs.loadForCard('c1')
    expect(logs.items.length).toBe(1)
    expect(logs.items[0].openedAt).toBe(500)
  })

  it('clearForCard svuota gli items', async () => {
    const logs = useLogsStore()
    await logs.recordOpen({ cardId: 'c1', openedAt: 1 })
    await logs.loadForCard('c1')
    await logs.clearForCard('c1')
    expect(logs.items).toEqual([])
  })

  it('clearAll rimuove tutti i log', async () => {
    const logs = useLogsStore()
    await logs.recordOpen({ cardId: 'c1', openedAt: 1 })
    await logs.recordOpen({ cardId: 'c2', openedAt: 1 })
    await logs.clearAll()
    expect(await logs.count()).toBe(0)
  })
})
