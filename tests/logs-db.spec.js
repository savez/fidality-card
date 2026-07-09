import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/index.js'
import {
  addOpenLog,
  attachCoords,
  listLogsByCard,
  deleteLogsByCard,
  clearAllLogs,
  countAllLogs,
} from '@/db/logs.js'

beforeEach(async () => {
  await db.logs.clear()
})

describe('logs DB', () => {
  it('addOpenLog salva id, openedAt e coordinate null', async () => {
    const log = await addOpenLog({ cardId: 'c1', openedAt: 1000 })
    expect(log.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(log.cardId).toBe('c1')
    expect(log.openedAt).toBe(1000)
    expect(log.lat).toBeNull()
    expect(log.lng).toBeNull()
    expect(log.accuracy).toBeNull()
  })

  it('attachCoords aggiorna lat/lng/accuracy', async () => {
    const log = await addOpenLog({ cardId: 'c1', openedAt: 1000 })
    await attachCoords(log.id, { lat: 45.1, lng: 9.2, accuracy: 12 })
    const [row] = await listLogsByCard('c1')
    expect(row.lat).toBe(45.1)
    expect(row.lng).toBe(9.2)
    expect(row.accuracy).toBe(12)
  })

  it('listLogsByCard ordina per openedAt decrescente e filtra per card', async () => {
    await addOpenLog({ cardId: 'c1', openedAt: 100 })
    await addOpenLog({ cardId: 'c1', openedAt: 300 })
    await addOpenLog({ cardId: 'c1', openedAt: 200 })
    await addOpenLog({ cardId: 'c2', openedAt: 999 })
    const rows = await listLogsByCard('c1')
    expect(rows.map((r) => r.openedAt)).toEqual([300, 200, 100])
  })

  it('deleteLogsByCard rimuove solo quella card', async () => {
    await addOpenLog({ cardId: 'c1', openedAt: 1 })
    await addOpenLog({ cardId: 'c2', openedAt: 1 })
    await deleteLogsByCard('c1')
    expect(await listLogsByCard('c1')).toEqual([])
    expect((await listLogsByCard('c2')).length).toBe(1)
  })

  it('clearAllLogs svuota tutto e countAllLogs conta', async () => {
    await addOpenLog({ cardId: 'c1', openedAt: 1 })
    await addOpenLog({ cardId: 'c2', openedAt: 1 })
    expect(await countAllLogs()).toBe(2)
    await clearAllLogs()
    expect(await countAllLogs()).toBe(0)
  })
})
