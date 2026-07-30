import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { db } from '@/db/index.js'
import { addOpenLog } from '@/db/logs.js'
import { useLogsStore } from '@/stores/logs.js'

beforeEach(async () => {
  setActivePinia(createPinia())
  await db.logs.clear()
})

describe('logs store — getAll', () => {
  it('lista vuota → []', async () => {
    const logs = useLogsStore()
    expect(await logs.getAll()).toEqual([])
  })

  it('ritorna tutti i log senza toccare items', async () => {
    await addOpenLog({ cardId: 'a', openedAt: 1 })
    await addOpenLog({ cardId: 'b', openedAt: 2 })
    const logs = useLogsStore()
    const all = await logs.getAll()
    expect(all.length).toBe(2)
    expect(logs.items).toEqual([]) // items resta intatto
  })
})
