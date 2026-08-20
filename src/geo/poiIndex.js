// Catalogo dei punti vendita, un file per brand in public/pois/, generato da
// scripts/build-pois.mjs a partire da OpenStreetMap (ODbL 1.0).
//
// I file stanno in public/ e si scaricano con fetch invece di essere importati:
// un `import()` di JSON diventa un chunk .js e i globPatterns di workbox
// (`**/*.js`) lo precacherebbero al primo avvio, scaricando l'intero catalogo a
// chi ne usa una fetta. Come asset statici restano fuori dal precache e sono
// serviti dalla regola runtimeCaching CacheFirst in vite.config.js: la prima
// volta servono rete, poi sono offline per sempre.

// Cache di sessione: brandId → punti. Un array vuoto significa "già provato,
// niente da avere" (file assente, offline, JSON malformato) e vale a evitare
// di ritentare a ogni avvio. Si azzera da sé al reload dell'app.
const loaded = new Map()

function version() {
  // __APP_VERSION__ è iniettato da vite.config.js (define); la guardia `typeof`
  // serve nei test e in qualunque contesto senza define.
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
}

function baseUrl() {
  return import.meta.env?.BASE_URL ?? '/'
}

async function fetchBrand(brandId) {
  try {
    const res = await fetch(`${baseUrl()}pois/${brandId}.json?v=${version()}`)
    if (!res.ok) {
      loaded.set(brandId, [])
      return
    }
    const json = await res.json()
    loaded.set(brandId, Array.isArray(json?.points) ? json.points : [])
  } catch {
    // Offline, o brand senza file: si scende al livello 3 (cluster dai log).
    loaded.set(brandId, [])
  }
}

// Carica i punti dei brand richiesti e ritorna una Map<brandId, [[lat, lng], …]>
// con i soli brand che hanno davvero dei punti — la forma che resolveNearby si
// aspetta. Best-effort: un brand che non si scarica semplicemente non contribuisce.
export async function loadPois(brandIds) {
  const wanted = [...new Set((brandIds ?? []).filter(Boolean))]
  await Promise.all(wanted.filter((id) => !loaded.has(id)).map(fetchBrand))

  const result = new Map()
  for (const id of wanted) {
    const points = loaded.get(id)
    if (points?.length) result.set(id, points)
  }
  return result
}

// Solo per i test: azzera la cache di sessione.
export function resetPoiCache() {
  loaded.clear()
}
