import { ref } from 'vue'
import { listCards } from '@/db/cards.js'
import { listAllLogs } from '@/db/logs.js'
import { listPlaces, addPlace } from '@/db/places.js'
import { loadPois } from '@/geo/poiIndex.js'
import { resolveNearby } from '@/geo/resolveNearby.js'

const STORAGE_KEY = 'fidality-card:nearby-open'

// Budget per il fix: oltre questo l'utente è già sull'app e dirottarlo sarebbe
// un dispetto, non un servizio. `maximumAge` accetta un fix recente già in
// pancia al browser, che nel caso migliore arriva in pochi millisecondi.
const FIX_TIMEOUT_MS = 2500
const FIX_MAX_AGE_MS = 120_000

function readEnabled() {
  try {
    // Default off, a differenza del logging: è una funzione che agisce da sola
    // all'avvio, quindi va accesa esplicitamente.
    return localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

// Stato a livello di modulo, come useWhatsNew/usePwaInstall: initNearbyOpen()
// gira una volta in main.js, i componenti leggono da qui.
const enabled = ref(readEnabled())
const suggestion = ref(null)
let routerRef = null

function setEnabled(next) {
  enabled.value = !!next
  try {
    localStorage.setItem(STORAGE_KEY, enabled.value ? 'on' : 'off')
  } catch {}
}

// Il permesso si legge, non si chiede: un prompt di geolocalizzazione sullo
// splash sarebbe il modo più rapido di farsi negare il permesso per sempre.
//
// Safari storicamente non espone 'geolocation' alla Permissions API e fa
// lanciare la query. In quel caso si ripiega su un'evidenza indiretta: se in
// archivio c'è già almeno un'apertura con coordinate, il permesso è stato
// concesso a questa origine in passato. Nessuna prova, ma niente prompt a chi
// non l'ha mai dato.
async function isGeoAllowed(logs) {
  try {
    const status = await navigator.permissions?.query?.({ name: 'geolocation' })
    if (status?.state) return status.state === 'granted'
  } catch {
    // Permissions API assente o senza supporto per 'geolocation'.
  }
  return logs.some((l) => l.lat != null)
}

function currentFix() {
  return new Promise((resolve) => {
    let settled = false
    const done = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    // Alcuni browser embedded non chiamano nessuna delle due callback: la
    // sveglia esterna garantisce che la promise si chiuda comunque.
    setTimeout(() => done(null), FIX_TIMEOUT_MS + 500)

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          done({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        () => done(null),
        {
          enableHighAccuracy: false,
          maximumAge: FIX_MAX_AGE_MS,
          timeout: FIX_TIMEOUT_MS,
        }
      )
    } catch {
      // Alcuni browser non conformi lanciano in modo sincrono invece di
      // invocare la callback di errore.
      done(null)
    }
  })
}

// Decide se aprire una card in base a dove sei. Gira una volta per avvio a
// freddo, dopo il mount, senza await da parte del chiamante: un fix GPS a
// freddo può volerci secondi e bloccare il mount significherebbe schermo bianco.
export async function initNearbyOpen(router, { intentApplied = false } = {}) {
  routerRef = router

  // Un intento URL che ha già scelto una card vince: due router.replace in
  // corsa si contenderebbero la navigazione.
  if (intentApplied) return
  if (!enabled.value) return
  if (!navigator.geolocation) return

  // Latch, non listener da interrogare al momento del fix: la domanda giusta è
  // "c'è stata un'interazione da quando ho iniziato?". Con un fix in cache la
  // risposta arriva in pochi millisecondi, prima che si possa toccare nulla;
  // sul ramo lento l'utente sta già usando l'app e va lasciato in pace.
  let aborted = false
  const abort = () => {
    aborted = true
  }
  const stopRouteWatch = router.afterEach(abort)
  window.addEventListener('pointerdown', abort, { once: true, capture: true })
  window.addEventListener('keydown', abort, { once: true, capture: true })
  const teardown = () => {
    stopRouteWatch?.()
    window.removeEventListener('pointerdown', abort, { capture: true })
    window.removeEventListener('keydown', abort, { capture: true })
  }

  try {
    const logs = await listAllLogs()
    if (aborted) return
    if (!(await isGeoAllowed(logs))) return

    const fix = await currentFix()
    if (aborted || !fix) return

    const [cards, places] = await Promise.all([listCards(), listPlaces()])
    const pois = await loadPois(cards.map((c) => c.brandId))
    if (aborted) return

    const result = resolveNearby({ places, logs, cards, pois, fix })
    if (aborted || !result) return

    if (result.action === 'open') {
      await router.replace(`/cards/${result.cardId}?fs=1`)
      return
    }

    const byId = new Map(cards.map((c) => [c.id, c]))
    suggestion.value = {
      fix: result.fix,
      candidates: result.candidates.map((c) => ({ ...c, card: byId.get(c.cardId) })),
    }
  } catch {
    // Best-effort come useUsageLogger: qualunque intoppo (DB illeggibile,
    // permesso revocato a metà, rete assente) si traduce in silenzio.
  } finally {
    teardown()
  }
}

export function useNearbyOpen() {
  // Conferma un candidato: salva il posto — così la volta dopo si apre da sé,
  // senza chiedere — e va al barcode.
  async function accept(candidate) {
    const current = suggestion.value
    suggestion.value = null
    if (!current || !candidate) return
    try {
      await addPlace({
        cardId: candidate.cardId,
        // Le coordinate del POI (o del centro del cluster) sono più stabili di
        // quelle del fix, che dipendono da dove eri in quel momento.
        lat: candidate.lat,
        lng: candidate.lng,
        accuracy: current.fix.accuracy,
      })
    } catch {
      // Se il salvataggio non riesce si apre comunque la card: la funzione
      // resta utile, semplicemente richiederà di nuovo la prossima volta.
    }
    await routerRef?.replace(`/cards/${candidate.cardId}?fs=1`)
  }

  // "No, non chiedere qui": salva un luogo ignorato sulle coordinate del fix,
  // cioè dove l'utente è ora — casa, ufficio.
  async function ignoreHere() {
    const current = suggestion.value
    suggestion.value = null
    if (!current) return
    try {
      await addPlace({
        cardId: null,
        lat: current.fix.lat,
        lng: current.fix.lng,
        accuracy: current.fix.accuracy,
      })
    } catch {}
  }

  // Chiudi e basta: nessuna traccia, si richiederà la prossima volta.
  function dismiss() {
    suggestion.value = null
  }

  return { enabled, setEnabled, suggestion, accept, ignoreHere, dismiss }
}
