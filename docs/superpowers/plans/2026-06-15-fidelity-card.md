# Fidelity Card WebApp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PWA Vue 3 per salvare, visualizzare e condividere fidelity card (barcode/QR), con DB locale IndexedDB partizionato per utente Google e zero backend custom.

**Architecture:** SPA statica Vue 3 + Vuetify 3 servita da GitHub Pages. Firebase Auth solo per identity (no Firestore). Dati card in IndexedDB via Dexie, filtrati per `ownerEmail`. Share via QR e link con payload base64url nel fragment URL. AI fuori MVP, libreria brand precostituita hardcoded.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`) · Vite · Vuetify 3 · Pinia · vue-router (hash mode) · Firebase Auth · Dexie.js (IndexedDB) · @zxing/browser · qrcode · vite-plugin-pwa · Vitest + fake-indexeddb · GitHub Actions · GitHub Pages.

**Spec di riferimento:** `docs/superpowers/specs/2026-06-15-fidelity-card-design.md`

---

## Fase 0 — Setup repo e dipendenze

### Task 0.1: Inizializzare package.json e tooling base

**Files:**
- Create: `package.json`
- Create: `.nvmrc`
- Create: `jsconfig.json`
- Create: `.editorconfig`

- [ ] **Step 1: Creare `.nvmrc`**

```
20
```

- [ ] **Step 2: Creare `package.json`**

```json
{
  "name": "fidality-card",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

- [ ] **Step 3: Creare `jsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve"
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 4: Creare `.editorconfig`**

```ini
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

- [ ] **Step 5: Commit**

```bash
git add package.json jsconfig.json .nvmrc .editorconfig
git commit -m "chore: initialize package.json and base tooling"
```

---

### Task 0.2: Installare dipendenze runtime e dev

**Files:**
- Modify: `package.json`
- Create: `package-lock.json` (generato)

- [ ] **Step 1: Installare runtime deps**

```bash
npm install vue@^3.4 vue-router@^4.4 pinia@^2.2 vuetify@^3.6 @mdi/font@^7.4 firebase@^10.13 dexie@^4.0 @zxing/browser@^0.1 @zxing/library@^0.21 qrcode@^1.5 uuid@^10.0
```

- [ ] **Step 2: Installare dev deps**

```bash
npm install -D vite@^5.4 @vitejs/plugin-vue@^5.1 vite-plugin-pwa@^0.20 vite-plugin-vuetify@^2.0 sass-embedded@^1.78 vitest@^2.0 @vue/test-utils@^2.4 happy-dom@^15 fake-indexeddb@^6.0
```

- [ ] **Step 3: Verificare versioni in `package.json`**

Run: `cat package.json | head -40`
Expected: `dependencies` e `devDependencies` popolati con i pacchetti sopra.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install runtime and dev dependencies"
```

---

### Task 0.3: Configurare Vite

**Files:**
- Create: `vite.config.js`
- Create: `index.html`

- [ ] **Step 1: Creare `vite.config.js`**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/fidality-card/',
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Fidelity Card',
        short_name: 'Fidelity',
        description: 'Le tue fidelity card sempre con te',
        lang: 'it',
        theme_color: '#1976D2',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/fidality-card/',
        start_url: '/fidality-card/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/fidality-card/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(googleapis|firebaseapp|firebaseio)\.com\/.*/,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  }
})
```

- [ ] **Step 2: Creare `index.html`**

```html
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1976D2" />
    <link rel="icon" type="image/svg+xml" href="/fidality-card/favicon.svg" />
    <title>Fidelity Card</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.js index.html
git commit -m "chore: configure Vite with Vuetify and PWA plugins"
```

---

### Task 0.4: Setup test infrastructure

**Files:**
- Create: `tests/setup.js`

- [ ] **Step 1: Creare `tests/setup.js`** (carica fake-indexeddb e shim globali necessari)

```js
import 'fake-indexeddb/auto'

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = await import('node:crypto').then(m => m.webcrypto)
}
```

- [ ] **Step 2: Verificare che Vitest parta a vuoto**

Run: `npx vitest run`
Expected: `No test files found, exiting with code 0` (o equivalente — nessun test ancora).

- [ ] **Step 3: Commit**

```bash
git add tests/setup.js
git commit -m "test: setup Vitest with fake-indexeddb"
```

---

### Task 0.5: Asset statici PWA (placeholder)

**Files:**
- Create: `public/favicon.svg`
- Create: `public/icons/icon-192.png` (placeholder)
- Create: `public/icons/icon-512.png` (placeholder)

- [ ] **Step 1: Creare `public/favicon.svg`** (icona temporanea — Material "credit-card-outline")

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976D2">
  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
</svg>
```

- [ ] **Step 2: Generare icone PNG placeholder 192 e 512**

Usare un comando di conversione disponibile (es. ImageMagick `convert public/favicon.svg -resize 192x192 public/icons/icon-192.png`). Se non disponibile, mettere PNG mono-colore 192x192 e 512x512 generati con qualsiasi tool (es. `node -e "..."` con `sharp`, oppure inserire manualmente). Le icone finali si rifiniscono in fase di polish.

- [ ] **Step 3: Verificare presenza file**

Run: `ls public/ public/icons/`
Expected: `favicon.svg`, `icon-192.png`, `icon-512.png` presenti.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "chore: add PWA placeholder icons"
```

---

## Fase 1 — Domain logic puro (TDD-first)

### Task 1.1: Brand library (`src/brands/brands.js`)

**Files:**
- Create: `src/brands/brands.js`
- Test: `tests/brands.spec.js`

- [ ] **Step 1: Scrivere il test che fallisce**

`tests/brands.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { BRANDS, getBrand } from '@/brands/brands.js'

describe('brand library', () => {
  it('contiene almeno 20 brand', () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(20)
  })

  it('ogni brand ha id, name, color e iconDefault', () => {
    for (const b of BRANDS) {
      expect(b.id).toMatch(/^[a-z0-9_]+$/)
      expect(b.name).toBeTruthy()
      expect(b.color).toMatch(/^#[0-9A-F]{6}$/i)
      expect(b.iconDefault).toMatch(/^mdi-[a-z0-9-]+$/)
    }
  })

  it('id univoci', () => {
    const ids = BRANDS.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getBrand restituisce il brand giusto', () => {
    expect(getBrand('esselunga')?.name).toBe('Esselunga')
  })

  it('getBrand su id sconosciuto restituisce null', () => {
    expect(getBrand('inesistente-xyz')).toBeNull()
  })

  it('getBrand su null restituisce null', () => {
    expect(getBrand(null)).toBeNull()
  })
})
```

- [ ] **Step 2: Verificare che il test fallisca**

Run: `npx vitest run tests/brands.spec.js`
Expected: FAIL — modulo `@/brands/brands.js` non esiste.

- [ ] **Step 3: Implementare `src/brands/brands.js`**

```js
export const BRANDS = [
  { id: 'esselunga',     name: 'Esselunga',     color: '#E30613', iconDefault: 'mdi-cart' },
  { id: 'conad',         name: 'Conad',         color: '#E2001A', iconDefault: 'mdi-cart' },
  { id: 'coop',          name: 'Coop',          color: '#003D7A', iconDefault: 'mdi-cart' },
  { id: 'pam',           name: 'Pam',           color: '#005CA9', iconDefault: 'mdi-cart' },
  { id: 'lidl',          name: 'Lidl',          color: '#0050AA', iconDefault: 'mdi-cart' },
  { id: 'eurospin',      name: 'Eurospin',      color: '#E30613', iconDefault: 'mdi-cart' },
  { id: 'carrefour',     name: 'Carrefour',     color: '#004E9F', iconDefault: 'mdi-cart' },
  { id: 'ikea',          name: 'IKEA',          color: '#0058A3', iconDefault: 'mdi-sofa' },
  { id: 'decathlon',     name: 'Decathlon',     color: '#0082C3', iconDefault: 'mdi-soccer' },
  { id: 'mediaworld',    name: 'MediaWorld',    color: '#E30613', iconDefault: 'mdi-television' },
  { id: 'unieuro',       name: 'Unieuro',       color: '#E20613', iconDefault: 'mdi-television' },
  { id: 'trony',         name: 'Trony',         color: '#005CA9', iconDefault: 'mdi-television' },
  { id: 'obi',           name: 'OBI',           color: '#FF7900', iconDefault: 'mdi-hammer-screwdriver' },
  { id: 'leroy_merlin',  name: 'Leroy Merlin',  color: '#78BE20', iconDefault: 'mdi-hammer-screwdriver' },
  { id: 'mondadori',     name: 'Mondadori',     color: '#003366', iconDefault: 'mdi-book-open-variant' },
  { id: 'feltrinelli',   name: 'Feltrinelli',   color: '#E30613', iconDefault: 'mdi-book-open-variant' },
  { id: 'q8',            name: 'Q8',            color: '#F39200', iconDefault: 'mdi-gas-station' },
  { id: 'eni',           name: 'Eni',           color: '#FFCB05', iconDefault: 'mdi-gas-station' },
  { id: 'trenitalia',    name: 'Trenitalia',    color: '#CC0000', iconDefault: 'mdi-train' },
  { id: 'italo',         name: 'Italo',         color: '#A6192E', iconDefault: 'mdi-train' }
]

const BY_ID = new Map(BRANDS.map(b => [b.id, b]))

export function getBrand(id) {
  if (!id) return null
  return BY_ID.get(id) ?? null
}
```

- [ ] **Step 4: Verificare che i test passino**

Run: `npx vitest run tests/brands.spec.js`
Expected: PASS — 6 test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/brands/brands.js tests/brands.spec.js
git commit -m "feat(brands): add brand library with 20 italian chains"
```

---

### Task 1.2: Payload share — serializzazione

**Files:**
- Create: `src/share/payload.js`
- Test: `tests/payload.spec.js`

- [ ] **Step 1: Scrivere il test che fallisce**

`tests/payload.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { encodePayload, decodePayload, MAX_PAYLOAD_BYTES } from '@/share/payload.js'

const sampleCard = {
  name: 'Esselunga Fìdaty',
  brandId: 'esselunga',
  barcode: '1234567890123',
  barcodeFormat: 'EAN_13',
  icona: '🛒',
  note: 'Carta intestata a Mario'
}

describe('share payload', () => {
  it('roundtrip serialize/deserialize preserva i campi', () => {
    const encoded = encodePayload(sampleCard)
    const decoded = decodePayload(encoded)
    expect(decoded).toMatchObject(sampleCard)
  })

  it('encode produce solo caratteri base64url (no +, /, =)', () => {
    const encoded = encodePayload(sampleCard)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('decode di stringa invalida lancia errore', () => {
    expect(() => decodePayload('non valido!!!')).toThrow()
  })

  it('decode di payload con versione futura lancia errore con info versione', () => {
    const future = encodePayload({ ...sampleCard, _vOverride: 999 })
    expect(() => decodePayload(future)).toThrow(/versione/i)
  })

  it('omette campi opzionali vuoti', () => {
    const minimal = { name: 'A', brandId: null, barcode: 'X', barcodeFormat: 'CODE_128' }
    const encoded = encodePayload(minimal)
    const decoded = decodePayload(encoded)
    expect(decoded.icona).toBeUndefined()
    expect(decoded.note).toBeUndefined()
  })

  it('encode lancia errore se name manca', () => {
    expect(() => encodePayload({ barcode: 'X', barcodeFormat: 'EAN_13', brandId: null })).toThrow(/name/i)
  })

  it('encode lancia errore se barcode manca', () => {
    expect(() => encodePayload({ name: 'A', barcodeFormat: 'EAN_13', brandId: null })).toThrow(/barcode/i)
  })

  it('MAX_PAYLOAD_BYTES è definito e ragionevole', () => {
    expect(MAX_PAYLOAD_BYTES).toBeGreaterThan(1000)
    expect(MAX_PAYLOAD_BYTES).toBeLessThan(3000)
  })

  it('encode di payload troppo grande lancia errore', () => {
    const big = { ...sampleCard, note: 'X'.repeat(5000) }
    expect(() => encodePayload(big)).toThrow(/troppo/i)
  })
})
```

- [ ] **Step 2: Verificare che i test falliscano**

Run: `npx vitest run tests/payload.spec.js`
Expected: FAIL — modulo non esiste.

- [ ] **Step 3: Implementare `src/share/payload.js`**

```js
const VERSION = 1
export const MAX_PAYLOAD_BYTES = 1800

function toBase64Url(uint8) {
  let str = ''
  for (let i = 0; i < uint8.length; i++) str += String.fromCharCode(uint8[i])
  return btoa(str).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replaceAll('-', '+').replaceAll('_', '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function encodePayload(card) {
  if (!card?.name) throw new Error('Campo obbligatorio mancante: name')
  if (!card.barcode) throw new Error('Campo obbligatorio mancante: barcode')
  if (!card.barcodeFormat) throw new Error('Campo obbligatorio mancante: barcodeFormat')

  const obj = {
    v: card._vOverride ?? VERSION,
    n: card.name,
    br: card.brandId ?? null,
    b: card.barcode,
    bf: card.barcodeFormat
  }
  if (card.icona) obj.i = card.icona
  if (card.note) obj.nt = card.note

  const json = JSON.stringify(obj)
  const bytes = new TextEncoder().encode(json)
  if (bytes.length > MAX_PAYLOAD_BYTES) {
    throw new Error(`Payload troppo grande (${bytes.length}B > ${MAX_PAYLOAD_BYTES}B). Accorcia le note.`)
  }
  return toBase64Url(bytes)
}

export function decodePayload(encoded) {
  let json
  try {
    const bytes = fromBase64Url(encoded)
    json = new TextDecoder().decode(bytes)
  } catch {
    throw new Error('Payload non valido')
  }
  let obj
  try {
    obj = JSON.parse(json)
  } catch {
    throw new Error('Payload non valido (JSON malformato)')
  }
  if (obj.v !== VERSION) {
    throw new Error(`Versione payload non supportata: ${obj.v}. Aggiorna l'app.`)
  }
  return {
    name: obj.n,
    brandId: obj.br ?? null,
    barcode: obj.b,
    barcodeFormat: obj.bf,
    icona: obj.i,
    note: obj.nt
  }
}
```

- [ ] **Step 4: Verificare che i test passino**

Run: `npx vitest run tests/payload.spec.js`
Expected: PASS — 9 test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/share/payload.js tests/payload.spec.js
git commit -m "feat(share): encode/decode card payload as base64url"
```

---

### Task 1.3: Dexie DB — schema e CRUD

**Files:**
- Create: `src/db/index.js`
- Create: `src/db/cards.js`
- Test: `tests/db.spec.js`

- [ ] **Step 1: Scrivere il test che fallisce**

`tests/db.spec.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db/index.js'
import { createCard, updateCard, deleteCard, listCards, getCard, exportAll, importAll } from '@/db/cards.js'

const baseInput = {
  name: 'Test card',
  brandId: 'esselunga',
  barcode: '123',
  barcodeFormat: 'EAN_13'
}

beforeEach(async () => {
  await db.cards.clear()
  await db.meta.clear()
})

describe('cards CRUD', () => {
  it('createCard salva con id, timestamp, ownerEmail', async () => {
    const card = await createCard('a@test.it', baseInput)
    expect(card.id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(card.ownerEmail).toBe('a@test.it')
    expect(card.createdAt).toBeGreaterThan(0)
    expect(card.updatedAt).toBe(card.createdAt)
  })

  it('listCards filtra per ownerEmail', async () => {
    await createCard('a@test.it', baseInput)
    await createCard('a@test.it', { ...baseInput, name: 'Seconda' })
    await createCard('b@test.it', baseInput)
    const aCards = await listCards('a@test.it')
    const bCards = await listCards('b@test.it')
    expect(aCards.length).toBe(2)
    expect(bCards.length).toBe(1)
  })

  it('updateCard aggiorna campi e bumpa updatedAt', async () => {
    const created = await createCard('a@test.it', baseInput)
    await new Promise(r => setTimeout(r, 5))
    const updated = await updateCard(created.id, { name: 'Nuovo nome' })
    expect(updated.name).toBe('Nuovo nome')
    expect(updated.updatedAt).toBeGreaterThan(created.updatedAt)
  })

  it('updateCard non cambia ownerEmail né createdAt', async () => {
    const created = await createCard('a@test.it', baseInput)
    const updated = await updateCard(created.id, { name: 'X', ownerEmail: 'evil@test.it', createdAt: 0 })
    expect(updated.ownerEmail).toBe('a@test.it')
    expect(updated.createdAt).toBe(created.createdAt)
  })

  it('deleteCard rimuove il record', async () => {
    const c = await createCard('a@test.it', baseInput)
    await deleteCard(c.id)
    expect(await getCard(c.id)).toBeUndefined()
  })

  it('exportAll restituisce solo card del ownerEmail', async () => {
    await createCard('a@test.it', baseInput)
    await createCard('b@test.it', baseInput)
    const dump = await exportAll('a@test.it')
    expect(dump.cards.length).toBe(1)
    expect(dump.cards[0].ownerEmail).toBe('a@test.it')
    expect(dump.version).toBe(1)
  })

  it('importAll inserisce card riassegnando ownerEmail e skipando duplicati per id', async () => {
    const existing = await createCard('a@test.it', baseInput)
    const dump = {
      version: 1,
      cards: [
        { ...existing, name: 'IGNORED_BECAUSE_DUPLICATE_ID' },
        { ...existing, id: 'new-uuid-1', name: 'Nuova' }
      ]
    }
    const result = await importAll('a@test.it', dump)
    expect(result.inserted).toBe(1)
    expect(result.skipped).toBe(1)
    const all = await listCards('a@test.it')
    expect(all.find(c => c.name === 'IGNORED_BECAUSE_DUPLICATE_ID')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Verificare che i test falliscano**

Run: `npx vitest run tests/db.spec.js`
Expected: FAIL — moduli non esistono.

- [ ] **Step 3: Implementare `src/db/index.js`**

```js
import Dexie from 'dexie'

export const db = new Dexie('fidality-card')

db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta: 'key'
})
```

- [ ] **Step 4: Implementare `src/db/cards.js`**

```js
import { v4 as uuidv4 } from 'uuid'
import { db } from './index.js'

const DUMP_VERSION = 1

function nowMs() { return Date.now() }

export async function createCard(ownerEmail, input) {
  if (!ownerEmail) throw new Error('ownerEmail richiesto')
  const t = nowMs()
  const card = {
    id: uuidv4(),
    ownerEmail,
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

export async function listCards(ownerEmail) {
  return db.cards.where('ownerEmail').equals(ownerEmail).toArray()
}

export async function updateCard(id, patch) {
  const existing = await db.cards.get(id)
  if (!existing) throw new Error(`Card ${id} non trovata`)
  const next = {
    ...existing,
    ...patch,
    id: existing.id,
    ownerEmail: existing.ownerEmail,
    createdAt: existing.createdAt,
    updatedAt: nowMs()
  }
  await db.cards.put(next)
  return next
}

export async function deleteCard(id) {
  await db.cards.delete(id)
}

export async function exportAll(ownerEmail) {
  const cards = await listCards(ownerEmail)
  return { version: DUMP_VERSION, exportedAt: nowMs(), ownerEmail, cards }
}

export async function importAll(ownerEmail, dump) {
  if (!dump || dump.version !== DUMP_VERSION) {
    throw new Error(`Versione backup non supportata: ${dump?.version}`)
  }
  let inserted = 0, skipped = 0
  for (const card of dump.cards ?? []) {
    const existing = await db.cards.get(card.id)
    if (existing) { skipped++; continue }
    await db.cards.add({ ...card, ownerEmail })
    inserted++
  }
  return { inserted, skipped }
}
```

- [ ] **Step 5: Verificare che i test passino**

Run: `npx vitest run tests/db.spec.js`
Expected: PASS — 7 test verdi.

- [ ] **Step 6: Commit**

```bash
git add src/db/ tests/db.spec.js
git commit -m "feat(db): Dexie schema and cards CRUD with owner partitioning"
```

---

## Fase 2 — Auth (Firebase)

### Task 2.1: Inizializzazione Firebase

**Files:**
- Create: `src/firebase.js`
- Create: `src/firebase.config.example.js`

- [ ] **Step 1: Creare `src/firebase.config.example.js`**

```js
// Copia questo file in `src/firebase.config.js` e inserisci la config del tuo Firebase project.
// Questa config è PUBBLICA by design (Firebase la espone nei client web).
export const firebaseConfig = {
  apiKey: '...',
  authDomain: '....firebaseapp.com',
  projectId: '...',
  storageBucket: '....appspot.com',
  messagingSenderId: '...',
  appId: '1:...:web:...'
}
```

- [ ] **Step 2: Creare `src/firebase.js`**

```js
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { firebaseConfig } from './firebase.config.js'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

const provider = new GoogleAuthProvider()

function isMobileLike() {
  return /Mobi|Android/i.test(navigator.userAgent)
}

export async function signInWithGoogle() {
  if (isMobileLike()) {
    await signInWithRedirect(auth, provider)
    return null
  }
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function consumeRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch (e) {
    console.error('Redirect result error', e)
    return null
  }
}

export async function signOut() {
  await fbSignOut(auth)
}

export { onAuthStateChanged }
```

- [ ] **Step 3: Aggiornare `.gitignore` per escludere la config reale**

Modificare `.gitignore` aggiungendo:
```
src/firebase.config.js
```

- [ ] **Step 4: Verificare che il modulo si carichi (smoke)**

Per ora non c'è ancora `src/firebase.config.js` perché l'utente deve crearla. Skip esecuzione: il test sarà manuale dopo la creazione della config.

- [ ] **Step 5: Commit**

```bash
git add src/firebase.js src/firebase.config.example.js .gitignore
git commit -m "feat(auth): firebase init with Google provider and redirect fallback"
```

---

### Task 2.2: Auth store (Pinia)

**Files:**
- Create: `src/stores/auth.js`

- [ ] **Step 1: Implementare `src/stores/auth.js`**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, signInWithGoogle, signOut, consumeRedirectResult, onAuthStateChanged } from '@/firebase.js'
import { db } from '@/db/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const isLoggedIn = computed(() => !!user.value)
  const email = computed(() => user.value?.email ?? null)

  async function init() {
    await consumeRedirectResult()
    onAuthStateChanged(auth, async (u) => {
      user.value = u
      if (u?.email) {
        await db.meta.put({ key: 'lastOwnerEmail', value: u.email })
      }
      ready.value = true
    })
  }

  async function login() {
    await signInWithGoogle()
  }

  async function logout() {
    await signOut()
    user.value = null
  }

  return { user, ready, isLoggedIn, email, init, login, logout }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/auth.js
git commit -m "feat(auth): pinia auth store with Firebase state listener"
```

---

## Fase 3 — Bootstrap app, routing, layout

### Task 3.1: Vuetify plugin

**Files:**
- Create: `src/plugins/vuetify.js`

- [ ] **Step 1: Implementare `src/plugins/vuetify.js`**

```js
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252'
        }
      }
    }
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VCombobox: { variant: 'outlined', density: 'comfortable' }
  },
  icons: { defaultSet: 'mdi' }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/plugins/vuetify.js
git commit -m "feat(ui): vuetify plugin with theme and defaults"
```

---

### Task 3.2: Vue Router (hash mode)

**Files:**
- Create: `src/router.js`

- [ ] **Step 1: Implementare `src/router.js`**

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  { path: '/', redirect: '/cards' },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/cards', name: 'cards', component: () => import('@/views/CardsView.vue') },
  { path: '/cards/new', name: 'card-new', component: () => import('@/views/CardEditView.vue') },
  { path: '/cards/:id', name: 'card-detail', component: () => import('@/views/CardDetailView.vue') },
  { path: '/cards/:id/edit', name: 'card-edit', component: () => import('@/views/CardEditView.vue') },
  { path: '/import', name: 'import', component: () => import('@/views/ImportView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.ready) {
    await new Promise((resolve) => {
      const stop = setInterval(() => {
        if (authStore.ready) { clearInterval(stop); resolve() }
      }, 30)
    })
  }
  if (to.meta.public) return true
  if (!authStore.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  return true
})
```

- [ ] **Step 2: Commit**

```bash
git add src/router.js
git commit -m "feat(router): hash routing with auth guard"
```

---

### Task 3.3: `main.js` e `App.vue`

**Files:**
- Create: `src/main.js`
- Create: `src/App.vue`

- [ ] **Step 1: Implementare `src/main.js`**

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router.js'
import { vuetify } from './plugins/vuetify.js'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)

const authStore = useAuthStore()
authStore.init().then(() => app.mount('#app'))
```

- [ ] **Step 2: Implementare `src/App.vue`**

```vue
<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const showShell = computed(() => auth.isLoggedIn)

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
    <v-app-bar v-if="showShell" color="primary" density="comfortable">
      <v-app-bar-title>Fidelity Card</v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-cog" :to="{ name: 'settings' }" />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-account-circle" v-bind="props" />
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ auth.email }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="onLogout">
            <template #prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Esci</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation v-if="showShell" grow>
      <v-btn :to="{ name: 'cards' }" value="cards">
        <v-icon>mdi-credit-card-multiple</v-icon>
        <span>Card</span>
      </v-btn>
      <v-btn :to="{ name: 'card-new' }" value="new">
        <v-icon>mdi-plus-circle</v-icon>
        <span>Nuova</span>
      </v-btn>
      <v-btn :to="{ name: 'settings' }" value="settings">
        <v-icon>mdi-cog</v-icon>
        <span>Impostazioni</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>
```

- [ ] **Step 3: Verificare build sintattica**

Run: `npx vite build --mode development`
Expected: build completa senza errori di sintassi (potrebbe fallire al runtime se `firebase.config.js` manca — accettabile in questa fase).

- [ ] **Step 4: Commit**

```bash
git add src/main.js src/App.vue
git commit -m "feat(app): main entry, app shell with bottom navigation"
```

---

### Task 3.4: LoginView

**Files:**
- Create: `src/views/LoginView.vue`

- [ ] **Step 1: Implementare `src/views/LoginView.vue`**

```vue
<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const error = ref(null)
const loading = ref(false)

async function onLogin() {
  loading.value = true
  error.value = null
  try {
    await auth.login()
  } catch (e) {
    error.value = e.message ?? 'Errore di login'
  } finally {
    loading.value = false
  }
}

watch(() => auth.isLoggedIn, (v) => {
  if (v) {
    const target = route.query.redirect && typeof route.query.redirect === 'string'
      ? route.query.redirect : '/cards'
    router.replace(target)
  }
}, { immediate: true })
</script>

<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100dvh">
    <v-card class="pa-6" max-width="420" width="100%">
      <v-card-title class="text-h5 text-center">Benvenuto</v-card-title>
      <v-card-subtitle class="text-center">Accedi per gestire le tue fidelity card</v-card-subtitle>
      <v-card-text>
        <v-btn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-google"
          :loading="loading"
          @click="onLogin"
        >Accedi con Google</v-btn>
        <v-alert v-if="error" type="error" class="mt-4" density="comfortable">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/LoginView.vue
git commit -m "feat(auth): login view with Google sign-in button"
```

---

## Fase 4 — Card management (lista, dettaglio, form)

### Task 4.1: Cards Pinia store

**Files:**
- Create: `src/stores/cards.js`

- [ ] **Step 1: Implementare `src/stores/cards.js`**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.js'
import {
  listCards as dbList,
  createCard as dbCreate,
  updateCard as dbUpdate,
  deleteCard as dbDelete,
  getCard as dbGet,
  exportAll as dbExportAll,
  importAll as dbImportAll
} from '@/db/cards.js'

export const useCardsStore = defineStore('cards', () => {
  const items = ref([])
  const loading = ref(false)
  const filterBrand = ref(null)
  const search = ref('')

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value.filter(c => {
      if (filterBrand.value && c.brandId !== filterBrand.value) return false
      if (q && !c.name.toLowerCase().includes(q)) return false
      return true
    })
  })

  async function refresh() {
    const auth = useAuthStore()
    if (!auth.email) { items.value = []; return }
    loading.value = true
    try { items.value = await dbList(auth.email) }
    finally { loading.value = false }
  }

  async function create(input) {
    const auth = useAuthStore()
    const card = await dbCreate(auth.email, input)
    items.value.push(card)
    return card
  }

  async function update(id, patch) {
    const updated = await dbUpdate(id, patch)
    const idx = items.value.findIndex(c => c.id === id)
    if (idx >= 0) items.value.splice(idx, 1, updated)
    return updated
  }

  async function remove(id) {
    await dbDelete(id)
    items.value = items.value.filter(c => c.id !== id)
  }

  async function get(id) {
    const local = items.value.find(c => c.id === id)
    if (local) return local
    return dbGet(id)
  }

  async function exportBackup() {
    const auth = useAuthStore()
    return dbExportAll(auth.email)
  }

  async function importBackup(dump) {
    const auth = useAuthStore()
    const result = await dbImportAll(auth.email, dump)
    await refresh()
    return result
  }

  return {
    items, filtered, loading, filterBrand, search,
    refresh, create, update, remove, get, exportBackup, importBackup
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/cards.js
git commit -m "feat(cards): pinia store with filtering and CRUD"
```

---

### Task 4.2: Componente `BrandPicker`

**Files:**
- Create: `src/brands/BrandPicker.vue`

- [ ] **Step 1: Implementare `src/brands/BrandPicker.vue`**

```vue
<script setup>
import { computed } from 'vue'
import { BRANDS } from './brands.js'

const props = defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const ALTRO = { id: null, name: 'Altro / Personalizzato', color: '#9E9E9E', iconDefault: 'mdi-tag' }
const options = computed(() => [ALTRO, ...BRANDS])

const value = computed({
  get: () => options.value.find(b => b.id === props.modelValue) ?? ALTRO,
  set: (b) => emit('update:modelValue', b?.id ?? null)
})
</script>

<template>
  <v-select
    v-model="value"
    :items="options"
    item-title="name"
    return-object
    label="Brand"
    prepend-inner-icon="mdi-store"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="item.raw.name">
        <template #prepend>
          <v-icon :color="item.raw.color">{{ item.raw.iconDefault }}</v-icon>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/brands/BrandPicker.vue
git commit -m "feat(brands): brand picker select component"
```

---

### Task 4.3: Componente `IconaDisplay`

**Files:**
- Create: `src/components/IconaDisplay.vue`

- [ ] **Step 1: Implementare `src/components/IconaDisplay.vue`**

```vue
<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'

const props = defineProps({
  icona: { type: String, default: null },
  brandId: { type: String, default: null },
  size: { type: [Number, String], default: 32 }
})

const FALLBACK = 'mdi-card-account-details'

const resolved = computed(() => {
  if (props.icona) {
    if (props.icona.startsWith('mdi-')) return { type: 'mdi', value: props.icona }
    return { type: 'emoji', value: props.icona }
  }
  const b = getBrand(props.brandId)
  if (b) return { type: 'mdi', value: b.iconDefault, color: b.color }
  return { type: 'mdi', value: FALLBACK }
})
</script>

<template>
  <v-icon v-if="resolved.type === 'mdi'" :size="size" :color="resolved.color">
    {{ resolved.value }}
  </v-icon>
  <span v-else :style="{ fontSize: typeof size === 'number' ? `${size}px` : size }">
    {{ resolved.value }}
  </span>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/IconaDisplay.vue
git commit -m "feat(ui): IconaDisplay component with cascade resolution"
```

---

### Task 4.4: Componente `CardTile`

**Files:**
- Create: `src/components/CardTile.vue`

- [ ] **Step 1: Implementare `src/components/CardTile.vue`**

```vue
<script setup>
import { computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import IconaDisplay from './IconaDisplay.vue'

const props = defineProps({ card: { type: Object, required: true } })
const brand = computed(() => getBrand(props.card.brandId))
const bgColor = computed(() => brand.value?.color ?? '#607D8B')
</script>

<template>
  <v-card :to="{ name: 'card-detail', params: { id: card.id } }" class="card-tile" elevation="2">
    <div class="card-tile__band" :style="{ backgroundColor: bgColor }">
      <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="42" />
    </div>
    <v-card-text>
      <div class="text-subtitle-1 font-weight-medium text-truncate">{{ card.name }}</div>
      <div class="text-caption text-medium-emphasis text-truncate">
        {{ brand?.name ?? 'Personalizzato' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.card-tile__band {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  color: white;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CardTile.vue
git commit -m "feat(ui): CardTile component for card grid"
```

---

### Task 4.5: CardsView (lista + filtri)

**Files:**
- Create: `src/views/CardsView.vue`

- [ ] **Step 1: Implementare `src/views/CardsView.vue`**

```vue
<script setup>
import { onMounted, computed } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import { BRANDS } from '@/brands/brands.js'
import CardTile from '@/components/CardTile.vue'

const cards = useCardsStore()
onMounted(cards.refresh)

const brandOptions = computed(() => [
  { id: null, name: 'Tutti i brand' },
  ...BRANDS,
  { id: '__custom__', name: 'Personalizzati' }
])

function setBrand(b) {
  if (b?.id === '__custom__') cards.filterBrand = '__custom__'
  else cards.filterBrand = b?.id ?? null
}
</script>

<template>
  <v-container class="pa-3">
    <v-row dense>
      <v-col cols="12" sm="7">
        <v-text-field
          v-model="cards.search"
          prepend-inner-icon="mdi-magnify"
          label="Cerca per nome"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" sm="5">
        <v-select
          :items="brandOptions"
          item-title="name"
          return-object
          label="Filtra brand"
          hide-details
          @update:model-value="setBrand"
        />
      </v-col>
    </v-row>

    <v-progress-linear v-if="cards.loading" indeterminate class="mt-2" />

    <v-row v-if="cards.filtered.length" class="mt-2">
      <v-col v-for="c in cards.filtered" :key="c.id" cols="6" sm="4" md="3">
        <CardTile :card="c" />
      </v-col>
    </v-row>

    <v-empty-state
      v-else-if="!cards.loading"
      icon="mdi-credit-card-off"
      title="Nessuna card"
      text="Aggiungi la tua prima fidelity card con il pulsante 'Nuova'."
      class="mt-8"
    />
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/CardsView.vue
git commit -m "feat(cards): CardsView with grid, search and brand filter"
```

---

### Task 4.6: Componente `BarcodeScanner` (camera + ZXing)

**Files:**
- Create: `src/scan/BarcodeScanner.vue`

- [ ] **Step 1: Implementare `src/scan/BarcodeScanner.vue`**

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'

const emit = defineEmits(['decoded', 'error'])
const videoEl = ref(null)
let reader = null
let controls = null
const cameraError = ref(null)
const status = ref('Inizializzazione…')

onMounted(async () => {
  try {
    reader = new BrowserMultiFormatReader()
    status.value = 'Inquadra il codice'
    controls = await reader.decodeFromVideoDevice(undefined, videoEl.value, (result, err) => {
      if (result) {
        emit('decoded', {
          barcode: result.getText(),
          barcodeFormat: String(result.getBarcodeFormat?.() ?? 'UNKNOWN')
        })
      }
    })
  } catch (e) {
    cameraError.value = e?.message ?? 'Impossibile accedere alla fotocamera'
    emit('error', e)
  }
})

onBeforeUnmount(() => {
  try { controls?.stop() } catch {}
  try { reader?.reset?.() } catch {}
})
</script>

<template>
  <div class="scanner">
    <v-alert v-if="cameraError" type="error" density="comfortable">
      {{ cameraError }}
    </v-alert>
    <video v-show="!cameraError" ref="videoEl" class="scanner__video" playsinline muted autoplay />
    <div class="text-caption text-center mt-2">{{ status }}</div>
  </div>
</template>

<style scoped>
.scanner__video {
  width: 100%;
  max-height: 60dvh;
  background: #000;
  border-radius: 8px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/scan/BarcodeScanner.vue
git commit -m "feat(scan): BarcodeScanner component with ZXing camera decoding"
```

---

### Task 4.7: CardEditView (nuova + modifica) con tab Scan/Manuale

**Files:**
- Create: `src/views/CardEditView.vue`

- [ ] **Step 1: Implementare `src/views/CardEditView.vue`**

```vue
<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import BrandPicker from '@/brands/BrandPicker.vue'
import BarcodeScanner from '@/scan/BarcodeScanner.vue'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()

const isEdit = computed(() => !!route.params.id)
const tab = ref('manuale')
const saving = ref(false)
const error = ref(null)

const FORMATS = ['EAN_13', 'EAN_8', 'CODE_128', 'CODE_39', 'UPC_A', 'QR_CODE', 'DATA_MATRIX', 'ITF']

const form = reactive({
  name: '',
  brandId: null,
  barcode: '',
  barcodeFormat: 'CODE_128',
  icona: '',
  note: ''
})

onMounted(async () => {
  if (isEdit.value) {
    const c = await cards.get(route.params.id)
    if (c) Object.assign(form, {
      name: c.name, brandId: c.brandId, barcode: c.barcode,
      barcodeFormat: c.barcodeFormat, icona: c.icona ?? '', note: c.note ?? ''
    })
  }
})

function onDecoded(payload) {
  form.barcode = payload.barcode
  form.barcodeFormat = payload.barcodeFormat
  tab.value = 'manuale'
}

const NOTE_MAX = 800
const isValid = computed(() =>
  form.name.trim().length >= 1 && form.name.length <= 80 &&
  form.barcode.trim().length >= 1 && form.barcode.length <= 256 &&
  (form.note?.length ?? 0) <= NOTE_MAX
)

async function save() {
  if (!isValid.value) return
  saving.value = true; error.value = null
  try {
    const payload = {
      name: form.name.trim(),
      brandId: form.brandId,
      barcode: form.barcode.trim(),
      barcodeFormat: form.barcodeFormat,
      icona: form.icona?.trim() || undefined,
      note: form.note?.trim() || undefined
    }
    let saved
    if (isEdit.value) saved = await cards.update(route.params.id, payload)
    else saved = await cards.create(payload)
    router.replace({ name: 'card-detail', params: { id: saved.id } })
  } catch (e) {
    error.value = e.message ?? 'Errore di salvataggio'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 700px">
    <h2 class="text-h5 mb-3">{{ isEdit ? 'Modifica card' : 'Nuova card' }}</h2>

    <v-tabs v-model="tab" v-if="!isEdit" grow class="mb-3">
      <v-tab value="scan">Scan</v-tab>
      <v-tab value="manuale">Manuale</v-tab>
    </v-tabs>

    <v-window v-model="tab" v-if="!isEdit" class="mb-3">
      <v-window-item value="scan">
        <BarcodeScanner @decoded="onDecoded" />
      </v-window-item>
      <v-window-item value="manuale"><div /></v-window-item>
    </v-window>

    <v-form @submit.prevent="save">
      <v-text-field
        v-model="form.name" label="Nome card *" :counter="80" maxlength="80" required
      />
      <BrandPicker v-model="form.brandId" />
      <v-text-field v-model="form.barcode" label="Codice *" maxlength="256" required />
      <v-select v-model="form.barcodeFormat" :items="FORMATS" label="Formato codice" />
      <v-text-field
        v-model="form.icona" label="Icona (emoji o mdi-…)"
        hint='Es. "🛒" oppure "mdi-cart". Lascia vuoto per icona del brand.'
        persistent-hint maxlength="64"
      />
      <v-textarea
        v-model="form.note" label="Note" :counter="NOTE_MAX" :maxlength="NOTE_MAX" rows="3"
      />

      <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>

      <div class="d-flex gap-2 mt-3">
        <v-btn variant="text" @click="router.back()">Annulla</v-btn>
        <v-spacer />
        <v-btn type="submit" color="primary" :disabled="!isValid" :loading="saving">
          Salva
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/CardEditView.vue
git commit -m "feat(cards): CardEditView with scan/manual tabs"
```

---

### Task 4.8: Componente `BarcodeDisplay` (rendering grande del codice)

**Files:**
- Create: `src/components/BarcodeDisplay.vue`

- [ ] **Step 1: Implementare `src/components/BarcodeDisplay.vue`**

```vue
<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: { type: String, required: true },
  format: { type: String, required: true }
})

const canvas = ref(null)
const error = ref(null)

async function render() {
  error.value = null
  if (!canvas.value) return
  try {
    if (props.format === 'QR_CODE' || props.format === 'DATA_MATRIX') {
      await QRCode.toCanvas(canvas.value, props.value, {
        errorCorrectionLevel: 'M', width: Math.min(window.innerWidth - 64, 480), margin: 1
      })
    } else {
      // barcode 1D: usa libreria solo a runtime per evitare bundle bloat
      const { default: JsBarcode } = await import('jsbarcode')
      const fmt = props.format.replace('_', '').toLowerCase() // EAN_13 -> ean13
      // jsbarcode richiede target SVG/canvas. Convertiamo nomi:
      const mapping = { ean13: 'EAN13', ean8: 'EAN8', code128: 'CODE128', code39: 'CODE39', upca: 'UPC', itf: 'ITF' }
      const jsbFormat = mapping[fmt] ?? 'CODE128'
      JsBarcode(canvas.value, props.value, {
        format: jsbFormat, width: 2, height: 110, displayValue: true, margin: 8
      })
    }
  } catch (e) {
    error.value = `Impossibile renderizzare il codice (${e.message})`
  }
}

onMounted(render)
watch(() => [props.value, props.format], render)
</script>

<template>
  <div class="d-flex flex-column align-center">
    <canvas ref="canvas" />
    <v-alert v-if="error" type="warning" density="comfortable" class="mt-2">{{ error }}</v-alert>
  </div>
</template>
```

- [ ] **Step 2: Aggiungere `jsbarcode` ai package**

Run: `npm install jsbarcode@^3.11`

- [ ] **Step 3: Commit**

```bash
git add src/components/BarcodeDisplay.vue package.json package-lock.json
git commit -m "feat(cards): BarcodeDisplay with QR and 1D barcode rendering"
```

---

### Task 4.9: CardDetailView (visualizzazione + azioni)

**Files:**
- Create: `src/views/CardDetailView.vue`

- [ ] **Step 1: Implementare `src/views/CardDetailView.vue`**

```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards.js'
import { getBrand } from '@/brands/brands.js'
import BarcodeDisplay from '@/components/BarcodeDisplay.vue'
import ShareDialog from '@/share/ShareDialog.vue'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()
const card = ref(null)
const showShare = ref(false)
const showDelete = ref(false)

const brand = computed(() => getBrand(card.value?.brandId))

onMounted(async () => {
  card.value = await cards.get(route.params.id)
  if (!card.value) router.replace({ name: 'cards' })
})

async function onDelete() {
  await cards.remove(card.value.id)
  router.replace({ name: 'cards' })
}
</script>

<template>
  <v-container v-if="card" class="pa-3" style="max-width: 600px">
    <div class="d-flex align-center mb-3">
      <v-btn icon="mdi-arrow-left" @click="router.back()" variant="text" />
      <h2 class="text-h5 ml-2 flex-grow-1 text-truncate">{{ card.name }}</h2>
    </div>

    <v-card class="pa-4 d-flex flex-column align-center" elevation="2">
      <BarcodeDisplay :value="card.barcode" :format="card.barcodeFormat" />
      <div class="text-caption mt-2">{{ card.barcodeFormat }}</div>
    </v-card>

    <v-list class="mt-3" lines="two">
      <v-list-item>
        <v-list-item-title>Brand</v-list-item-title>
        <v-list-item-subtitle>{{ brand?.name ?? 'Personalizzato' }}</v-list-item-subtitle>
      </v-list-item>
      <v-list-item v-if="card.note">
        <v-list-item-title>Note</v-list-item-title>
        <v-list-item-subtitle style="white-space: pre-wrap">{{ card.note }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <div class="d-flex gap-2 mt-4">
      <v-btn block color="primary" prepend-icon="mdi-share-variant" @click="showShare = true">Condividi</v-btn>
    </div>
    <div class="d-flex gap-2 mt-2">
      <v-btn variant="outlined" prepend-icon="mdi-pencil" :to="{ name: 'card-edit', params: { id: card.id } }">Modifica</v-btn>
      <v-spacer />
      <v-btn variant="text" color="error" prepend-icon="mdi-delete" @click="showDelete = true">Elimina</v-btn>
    </div>

    <ShareDialog v-if="showShare" :card="card" @close="showShare = false" />

    <v-dialog v-model="showDelete" max-width="420">
      <v-card>
        <v-card-title>Eliminare la card?</v-card-title>
        <v-card-text>Questa operazione non è reversibile.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDelete = false">Annulla</v-btn>
          <v-btn color="error" @click="onDelete">Elimina</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/CardDetailView.vue
git commit -m "feat(cards): CardDetailView with barcode display and actions"
```

---

## Fase 5 — Share e import

### Task 5.1: ShareDialog (QR + link)

**Files:**
- Create: `src/share/ShareDialog.vue`

- [ ] **Step 1: Implementare `src/share/ShareDialog.vue`**

```vue
<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { encodePayload } from './payload.js'

const props = defineProps({ card: { type: Object, required: true } })
const emit = defineEmits(['close'])

const tab = ref('qr')
const qrCanvas = ref(null)
const url = ref('')
const error = ref(null)
const copied = ref(false)

onMounted(async () => {
  try {
    const encoded = encodePayload(props.card)
    url.value = `${window.location.origin}${window.location.pathname}#/import?d=${encoded}`
    if (qrCanvas.value) {
      await QRCode.toCanvas(qrCanvas.value, url.value, {
        errorCorrectionLevel: 'M', width: Math.min(window.innerWidth - 96, 360), margin: 1
      })
    }
  } catch (e) {
    error.value = e.message ?? 'Errore di generazione'
  }
})

async function copyLink() {
  await navigator.clipboard.writeText(url.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <v-dialog model-value="true" max-width="520" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Condividi card</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="emit('close')" />
      </v-card-title>

      <v-tabs v-model="tab" grow>
        <v-tab value="qr">QR</v-tab>
        <v-tab value="link">Link</v-tab>
      </v-tabs>

      <v-card-text>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-window v-else v-model="tab">
          <v-window-item value="qr">
            <div class="d-flex justify-center"><canvas ref="qrCanvas" /></div>
            <div class="text-caption text-center mt-2">
              Scansiona dall'altro telefono con la stessa app
            </div>
          </v-window-item>
          <v-window-item value="link">
            <v-textarea readonly :model-value="url" rows="4" />
            <v-btn block color="primary" prepend-icon="mdi-content-copy" @click="copyLink">
              {{ copied ? 'Copiato!' : 'Copia link' }}
            </v-btn>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/share/ShareDialog.vue
git commit -m "feat(share): ShareDialog with QR canvas and copy link"
```

---

### Task 5.2: ImportView (apertura link condiviso)

**Files:**
- Create: `src/views/ImportView.vue`

- [ ] **Step 1: Implementare `src/views/ImportView.vue`**

```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decodePayload } from '@/share/payload.js'
import { useCardsStore } from '@/stores/cards.js'
import { getBrand } from '@/brands/brands.js'
import IconaDisplay from '@/components/IconaDisplay.vue'

const route = useRoute()
const router = useRouter()
const cards = useCardsStore()

const preview = ref(null)
const error = ref(null)
const saving = ref(false)

const brand = computed(() => getBrand(preview.value?.brandId))

onMounted(() => {
  const d = route.query.d
  if (!d || typeof d !== 'string') {
    error.value = 'Link di condivisione senza dati'
    return
  }
  try {
    preview.value = decodePayload(d)
  } catch (e) {
    error.value = e.message ?? 'Payload non valido'
  }
})

async function save() {
  saving.value = true
  try {
    const created = await cards.create(preview.value)
    router.replace({ name: 'card-detail', params: { id: created.id } })
  } catch (e) {
    error.value = e.message ?? 'Errore di salvataggio'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 600px">
    <h2 class="text-h5 mb-3">Importa card</h2>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>

    <v-card v-if="preview" class="pa-4">
      <div class="d-flex align-center gap-3">
        <IconaDisplay :icona="preview.icona" :brand-id="preview.brandId" :size="56" />
        <div>
          <div class="text-h6">{{ preview.name }}</div>
          <div class="text-caption">{{ brand?.name ?? 'Personalizzato' }} · {{ preview.barcodeFormat }}</div>
        </div>
      </div>
      <div class="text-body-2 mt-3" v-if="preview.note" style="white-space: pre-wrap">{{ preview.note }}</div>
      <div class="d-flex mt-4">
        <v-btn variant="text" @click="router.replace({ name: 'cards' })">Annulla</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="save">Salva nel mio DB</v-btn>
      </div>
    </v-card>
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/ImportView.vue
git commit -m "feat(share): ImportView for incoming share links"
```

---

## Fase 6 — Settings (backup)

### Task 6.1: SettingsView (export/import backup)

**Files:**
- Create: `src/views/SettingsView.vue`

- [ ] **Step 1: Implementare `src/views/SettingsView.vue`**

```vue
<script setup>
import { ref } from 'vue'
import { useCardsStore } from '@/stores/cards.js'
import { useAuthStore } from '@/stores/auth.js'

const cards = useCardsStore()
const auth = useAuthStore()
const fileInput = ref(null)
const message = ref(null)
const error = ref(null)

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function onExport() {
  error.value = null; message.value = null
  try {
    const dump = await cards.exportBackup()
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fidelity-cards-${todayString()}.json`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
    message.value = `Esportate ${dump.cards.length} card.`
  } catch (e) { error.value = e.message }
}

async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  error.value = null; message.value = null
  try {
    const text = await file.text()
    const dump = JSON.parse(text)
    const result = await cards.importBackup(dump)
    message.value = `Importate ${result.inserted} card (${result.skipped} duplicati saltati).`
  } catch (e) { error.value = e.message }
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <v-container class="pa-3" style="max-width: 600px">
    <h2 class="text-h5 mb-3">Impostazioni</h2>

    <v-list lines="two">
      <v-list-subheader>Account</v-list-subheader>
      <v-list-item :subtitle="auth.email" title="Email loggata">
        <template #prepend><v-icon>mdi-account</v-icon></template>
      </v-list-item>
    </v-list>

    <v-divider class="my-3" />

    <h3 class="text-subtitle-1 mb-2">Backup</h3>
    <v-btn block prepend-icon="mdi-download" @click="onExport">Esporta backup JSON</v-btn>
    <v-btn block class="mt-2" variant="outlined" prepend-icon="mdi-upload" @click="fileInput?.click()">
      Importa backup JSON
    </v-btn>
    <input ref="fileInput" type="file" accept="application/json" hidden @change="onImportFile" />

    <v-alert v-if="message" type="success" class="mt-3">{{ message }}</v-alert>
    <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
  </v-container>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/SettingsView.vue
git commit -m "feat(settings): SettingsView with backup export and import"
```

---

## Fase 7 — Deploy

### Task 7.1: GitHub Actions workflow per GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Creare il workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - name: Create firebase config
        run: |
          cat > src/firebase.config.js <<'EOF'
          export const firebaseConfig = {
            apiKey: "${{ secrets.FIREBASE_API_KEY }}",
            authDomain: "${{ secrets.FIREBASE_AUTH_DOMAIN }}",
            projectId: "${{ secrets.FIREBASE_PROJECT_ID }}",
            storageBucket: "${{ secrets.FIREBASE_STORAGE_BUCKET }}",
            messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
            appId: "${{ secrets.FIREBASE_APP_ID }}"
          }
          EOF
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: GitHub Actions deploy to GitHub Pages with Firebase secrets"
```

---

### Task 7.2: README con istruzioni setup

**Files:**
- Create: `README.md`

- [ ] **Step 1: Creare `README.md`**

```markdown
# Fidelity Card

PWA Vue 3 per salvare e condividere le proprie fidelity card.

🌐 https://savez.github.io/fidality-card/

## Setup locale

1. `nvm use` (Node 20)
2. `npm install`
3. Copia `src/firebase.config.example.js` → `src/firebase.config.js` e inserisci la config del tuo Firebase project.
4. `npm run dev` → http://localhost:5173/fidality-card/

## Setup Firebase

1. Console Firebase → nuovo progetto (piano gratuito Spark).
2. Authentication → Sign-in method → abilitare provider Google.
3. Authorized domains → aggiungere `savez.github.io` e `localhost`.
4. Project Settings → "Le tue app" → Web → copiare la config in `src/firebase.config.js`.

## Setup GitHub Pages

1. Settings → Pages → Source = "GitHub Actions".
2. Settings → Secrets and variables → Actions → aggiungere:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
3. Push su `main` → il workflow `.github/workflows/deploy.yml` builda e pubblica.

## Script

- `npm run dev` — dev server
- `npm run build` — build produzione
- `npm test` — Vitest
- `npm run preview` — preview build

## Architettura

Vedi `docs/superpowers/specs/2026-06-15-fidelity-card-design.md`.

## Installazione come app (PWA)

Su Android Chrome: menu → "Installa app". Su iOS Safari: condividi → "Aggiungi a Home".
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with Firebase and Pages setup"
```

---

## Fase 8 — Verifica end-to-end manuale

### Task 8.1: Smoke locale

- [ ] **Step 1: Creare `src/firebase.config.js` con valori reali del Firebase project di savez.**

- [ ] **Step 2: Avviare dev server**

Run: `npm run dev`
Expected: dev server su http://localhost:5173/fidality-card/

- [ ] **Step 3: Smoke test** seguendo l'elenco della sezione 11 del design doc:
  1. Login Google → email visibile.
  2. Nuova card → scan barcode reale → valore corretto.
  3. Salvataggio → card in lista → sopravvive a refresh.
  4. Dettaglio → barcode grande → scansionabile da app esterna.
  5. Edit nome → aggiornato.
  6. Share QR → secondo device → preview → conferma → card nel DB del secondo.
  7. Share link → copia → apri in altro tab → import → presente.
  8. Delete → sparisce, sopravvive a refresh.
  9. Export backup → JSON contiene tutte le card.
  10. Import backup → DB svuotato → re-import → card tornano.
  11. PWA install (Android Chrome) → icona home → offline.
  12. Multi-account same device: logout → altra email → lista vuota; rilogin prima email → card tornano.

- [ ] **Step 4: Annotare bug / polish trovati in `docs/superpowers/specs/2026-06-15-fidelity-card-design.md` sezione "Open items" e creare task di follow-up.**

---

## Self-Review checklist (per chi esegue il piano)

Quando tutte le task sono completate, ripercorrere il design doc sezione per sezione e spuntare:

- [ ] Sezione 5 (Data model) — schema Card e Dexie corrispondono al codice
- [ ] Sezione 6 (Flussi) — tutti i 10 flussi implementati e testati a mano
- [ ] Sezione 8 (Error handling) — tutti i casi listati hanno una gestione visibile in UI
- [ ] Sezione 10 (Scope MVP) — tutte le voci "Incluso" sono presenti; niente delle voci "Fuori MVP" è stato implementato
- [ ] Sezione 11 (Verification) — tutti i 12 smoke test passano e gli unit test sono verdi
- [ ] Sezione 12 (Punti delicati) — service worker non cachea endpoint Firebase; iOS Safari camera testato; hard cap note enforced; vite base path configurato

Se qualcosa manca, aggiungere task di follow-up e completarli prima di considerare l'MVP chiuso.
