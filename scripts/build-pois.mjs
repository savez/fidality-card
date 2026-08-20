#!/usr/bin/env node
// Genera public/pois/<brandId>.json: le coordinate dei punti vendita italiani
// dei brand di src/brands/brands.js, estratte da OpenStreetMap via Overpass.
//
// Si lancia a mano (`node scripts/build-pois.mjs`), MAI nella build: il
// risultato è committato. Da rilanciare ogni tanto — i negozi aprono e chiudono.
//
//   node scripts/build-pois.mjs                 # tutti i brand
//   node scripts/build-pois.mjs esselunga coop  # solo alcuni
//   node scripts/build-pois.mjs --dry-run       # conta senza scrivere
//
// Il dato risultante è un database derivato da OpenStreetMap: ODbL 1.0,
// attribuzione obbligatoria (vedi README).

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { POI_SOURCES } from './poi-sources.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/pois')
const ENDPOINT = 'https://overpass-api.de/api/interpreter'

// Bounding box dell'Italia (sud, ovest, nord, est). Si usa il rettangolo e non
// `area["ISO3166-1"="IT"]`: risolvere l'area costa parecchio e il rettangolo,
// con qualche punto oltreconfine, non fa danno — un negozio svizzero del brand
// giusto è comunque un negozio del brand giusto.
const BBOX = '35.2,6.5,47.2,18.8'

// 4 decimali ≈ 11 m. Con il gate di accuratezza a 400 m in resolveNearby, la
// precisione in più sarebbe solo peso nel file.
const PRECISION = 4
const PAUSE_MS = 1500 // Overpass è un servizio pubblico e gratuito: non lo si martella.
const RETRIES = 3

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const only = args.filter((a) => !a.startsWith('--'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Una richiesta per statement, non un'unica union. Provato: le union che
// sommano più di ~90 secondi di lavoro vengono tagliate dal gateway con un 504,
// mentre gli stessi statement, singolarmente, tornano in 15-65 secondi.
//
// Solo filtri che Overpass può indicizzare per chiave o per coppia
// chiave=valore. Una regex sulle *chiavi* (`[~"^(brand|name)$"~"…"]`) o una
// regex su `name` con un filtro largo come `[amenity]` va in timeout
// sull'Italia intera: provato, 181 secondi e zero risultati.
function statements(source) {
  const out = [
    `nwr["brand"~"${source.match}",i](${BBOX});`,
    `nwr["operator"~"${source.match}",i](${BBOX});`,
  ]
  // Scialuppa per i negozi mappati senza tag `brand`: la regex su `name` è
  // veloce solo dopo un filtro selettivo come `shop=sports`.
  for (const filter of source.nameIn ?? []) {
    const [key, value] = filter.split('=')
    out.push(`nwr["${key}"="${value}"]["name"~"${source.match}",i](${BBOX});`)
  }
  return out
}

async function runStatement(statement) {
  const data = `[out:json][timeout:150];\n(\n  ${statement}\n);\nout center;`

  for (let attempt = 1; ; attempt++) {
    let res
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Senza User-Agent riconoscibile Overpass risponde 406.
          'User-Agent': 'fidelity-card-poi-builder/1.0 (script one-shot, uso personale)',
        },
        body: new URLSearchParams({ data }),
      })
    } catch (e) {
      // Connessione caduta a metà: transitoria come un 504, si ritenta.
      if (attempt >= RETRIES) throw e
      await sleep(attempt * 5000)
      continue
    }

    if (res.ok) {
      const json = await res.json()
      // Overpass segnala il timeout interno con HTTP 200 e un campo `remark`:
      // senza questo controllo si scriverebbero file parziali credendoli
      // completi — il modo più silenzioso di rompere la funzione.
      if (json.remark) throw new Error(`Overpass: ${json.remark}`)
      return json.elements ?? []
    }

    // 429 (troppe richieste) e 504 (gateway) sono transitori: vale ritentare.
    if (attempt >= RETRIES || ![429, 502, 503, 504].includes(res.status)) {
      throw new Error(`Overpass ${res.status} ${res.statusText}`)
    }
    await sleep(attempt * 5000)
  }
}

async function fetchBrand(source) {
  // Dedup su coordinate arrotondate: lo stesso negozio è spesso mappato sia
  // come nodo (il POI) sia come way (l'edificio), e i vari statement si
  // sovrappongono per costruzione.
  const seen = new Set()
  const points = []

  for (const statement of statements(source)) {
    for (const el of await runStatement(statement)) {
      const lat = el.lat ?? el.center?.lat
      const lng = el.lon ?? el.center?.lon
      if (lat == null || lng == null) continue
      const rLat = Number(lat.toFixed(PRECISION))
      const rLng = Number(lng.toFixed(PRECISION))
      const key = `${rLat},${rLng}`
      if (seen.has(key)) continue
      seen.add(key)
      points.push([rLat, rLng])
    }
    await sleep(PAUSE_MS)
  }

  // Ordine stabile: senza, ogni rigenerazione produce un diff totale.
  points.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return points
}

const report = []
const brandIds = Object.keys(POI_SOURCES).filter((id) => !only.length || only.includes(id))

if (!dryRun) await mkdir(OUT_DIR, { recursive: true })

for (const brandId of brandIds) {
  const source = POI_SOURCES[brandId]
  if (source.skip) {
    report.push({ brandId, points: '—', kb: '—', note: `saltato: ${source.skip}` })
    console.log(`${brandId.padEnd(16)}      —  saltato`)
    continue
  }

  try {
    const points = await fetchBrand(source)
    let note = ''
    if (!points.length) note = 'nessun punto: brand non mappato, o selettore da correggere'
    else if (points.length < 5) note = 'conteggio molto basso: verificare il selettore'

    const kb = points.length ? (JSON.stringify(points).length / 1024).toFixed(1) : '0.0'

    if (points.length && !dryRun) {
      const payload = {
        brandId,
        generatedAt: new Date().toISOString().slice(0, 10),
        source: 'OpenStreetMap contributors, ODbL 1.0',
        points,
      }
      await writeFile(resolve(OUT_DIR, `${brandId}.json`), JSON.stringify(payload) + '\n', 'utf-8')
    }

    report.push({ brandId, points: points.length, kb, note })
    console.log(`${brandId.padEnd(16)} ${String(points.length).padStart(6)} punti ${kb} KB ${note}`)
  } catch (e) {
    report.push({ brandId, points: 'ERRORE', kb: '—', note: e.message })
    console.log(`${brandId.padEnd(16)} ERRORE  ${e.message}`)
  }
}

console.log('\n| brand | punti | KB | note |')
console.log('|---|---:|---:|---|')
for (const r of report) console.log(`| ${r.brandId} | ${r.points} | ${r.kb} | ${r.note} |`)
if (dryRun) console.log('\n(--dry-run: nessun file scritto)')
