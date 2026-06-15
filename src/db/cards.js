import { v4 as uuidv4 } from 'uuid'
import { db } from './index.js'

const DUMP_VERSION = 1

function nowMs() { return Date.now() }

export async function createCard(input) {
  const t = nowMs()
  const card = {
    id: uuidv4(),
    name: input.name,
    brandId: input.brandId ?? null,
    barcode: input.barcode,
    barcodeFormat: input.barcodeFormat,
    icona: input.icona,
    note: input.note,
    createdAt: t,
    updatedAt: t
  }
  await db.cards.add(card)
  return card
}

export async function getCard(id) {
  return db.cards.get(id)
}

export async function listCards() {
  return db.cards.toArray()
}

export async function updateCard(id, patch) {
  const existing = await db.cards.get(id)
  if (!existing) throw new Error(`Card ${id} non trovata`)
  const next = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowMs()
  }
  await db.cards.put(next)
  return next
}

export async function deleteCard(id) {
  await db.cards.delete(id)
}

export async function exportAll() {
  const cards = await listCards()
  return { version: DUMP_VERSION, exportedAt: nowMs(), cards }
}

export async function importAll(dump) {
  if (!dump || dump.version !== DUMP_VERSION) {
    throw new Error(`Versione backup non supportata: ${dump?.version}`)
  }
  let inserted = 0, skipped = 0
  for (const card of dump.cards ?? []) {
    const existing = await db.cards.get(card.id)
    if (existing) { skipped++; continue }
    // Strip the legacy ownerEmail field if present (artifact from pre-v2 exports)
    const { ownerEmail: _drop, ...clean } = card
    await db.cards.add(clean)
    inserted++
  }
  return { inserted, skipped }
}
