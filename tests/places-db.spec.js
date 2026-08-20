import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/index.js'
import { addOpenLog, listAllLogs } from '@/db/logs.js'
import { addPlace, listPlaces, deletePlace, deletePlacesByCard, countPlaces } from '@/db/places.js'

beforeEach(async () => {
  await db.places.clear()
  await db.logs.clear()
})

describe('places DB', () => {
  it('addPlace salva id, coordinate e timestamp', async () => {
    const place = await addPlace({ cardId: 'c1', lat: 45.4642, lng: 9.19, accuracy: 25 })
    expect(place.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(place.cardId).toBe('c1')
    expect(place.lat).toBe(45.4642)
    expect(place.lng).toBe(9.19)
    expect(place.accuracy).toBe(25)
    expect(place.label).toBeNull()
    expect(place.createdAt).toBeTypeOf('number')
  })

  it('cardId assente → luogo ignorato (casa, ufficio)', async () => {
    const place = await addPlace({ lat: 45.4642, lng: 9.19 })
    expect(place.cardId).toBeNull()
    expect(place.accuracy).toBeNull()
  })

  it('una card può avere più luoghi', async () => {
    await addPlace({ cardId: 'c1', lat: 45.46, lng: 9.19 })
    await addPlace({ cardId: 'c1', lat: 45.07, lng: 7.68 })
    const rows = await listPlaces()
    expect(rows.filter((p) => p.cardId === 'c1').length).toBe(2)
  })

  it('listPlaces ordina per creazione decrescente', async () => {
    const a = await addPlace({ cardId: 'c1', lat: 1, lng: 1 })
    const b = await addPlace({ cardId: 'c2', lat: 2, lng: 2 })
    // I due addPlace possono cadere nello stesso millisecondo: si forza
    // l'ordine per rendere l'asserzione deterministica.
    await db.places.update(a.id, { createdAt: 100 })
    await db.places.update(b.id, { createdAt: 200 })
    const rows = await listPlaces()
    expect(rows.map((p) => p.id)).toEqual([b.id, a.id])
  })

  it('deletePlace rimuove solo quel luogo', async () => {
    const a = await addPlace({ cardId: 'c1', lat: 1, lng: 1 })
    await addPlace({ cardId: 'c1', lat: 2, lng: 2 })
    await deletePlace(a.id)
    const rows = await listPlaces()
    expect(rows.length).toBe(1)
    expect(rows[0].id).not.toBe(a.id)
  })

  it('deletePlacesByCard rimuove tutti i luoghi di quella card e lascia gli altri', async () => {
    await addPlace({ cardId: 'c1', lat: 1, lng: 1 })
    await addPlace({ cardId: 'c1', lat: 2, lng: 2 })
    await addPlace({ cardId: 'c2', lat: 3, lng: 3 })
    await addPlace({ lat: 4, lng: 4 }) // ignorato
    await deletePlacesByCard('c1')
    const rows = await listPlaces()
    expect(rows.map((p) => p.cardId).sort()).toEqual(['c2', null])
  })

  it('countPlaces conta tutto, ignorati compresi', async () => {
    expect(await countPlaces()).toBe(0)
    await addPlace({ cardId: 'c1', lat: 1, lng: 1 })
    await addPlace({ lat: 2, lng: 2 })
    expect(await countPlaces()).toBe(2)
  })
})

describe('migrazione v4 → v5', () => {
  it('la nuova tabella convive con i log preesistenti, che restano intatti', async () => {
    await addOpenLog({ cardId: 'c1', openedAt: 1000 })
    await addOpenLog({ cardId: 'c1', openedAt: 2000 })
    await addPlace({ cardId: 'c1', lat: 45.4642, lng: 9.19 })

    const logs = await listAllLogs()
    expect(logs.map((l) => l.openedAt)).toEqual([2000, 1000])
    expect(await countPlaces()).toBe(1)
    expect(db.verno).toBeGreaterThanOrEqual(5)
  })
})
