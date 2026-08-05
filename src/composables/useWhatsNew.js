import { computed, ref } from 'vue'
import { compareVersions, isVersion } from '@/utils/version.js'
import { releaseNotes } from '@/config/releaseNotes.js'
import { evaluateEligibility, usePwaInstall } from '@/composables/usePwaInstall.js'
import { db } from '@/db/index.js'
import { parseIntent } from '@/shortcuts/intent.js'

const SEEN_KEY = 'fidality-card:last-seen-version'
const DEFERRED_KEY = 'fidality-card:whats-new-deferred'

// Attesa prima di decidere se aprire: sta sotto i 5s di InstallPromptBanner e
// dà tempo a 'beforeinstallprompt', che Chrome può emettere dopo il mount.
const BOOT_DECISION_DELAY_MS = 1500

// __APP_VERSION__ è iniettato da vite.config.js (define). La guardia `typeof`
// evita il ReferenceError nei contesti dove il define non c'è, come già fanno
// AppBarVersionPill.vue e AppVersionDialog.vue.
export function currentVersion() {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : null
}

function readKey(key) {
  try {
    return localStorage.getItem(key) || null
  } catch {
    return null
  }
}

function writeKey(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export function readLastSeen() {
  return readKey(SEEN_KEY)
}

// Segna una versione come già vista. Ignora gli input non validi: meglio
// riproporre il modale che salvare un flag spazzatura da cui non si torna.
export function markSeen(version) {
  if (!isVersion(version)) return
  writeKey(SEEN_KEY, version)
}

export function readDeferred() {
  return readKey(DEFERRED_KEY)
}

export function markDeferred(version) {
  if (!isVersion(version)) return
  writeKey(DEFERRED_KEY, version)
}

export function clearDeferred() {
  try {
    localStorage.removeItem(DEFERRED_KEY)
  } catch {}
}

// Le voci da raccontare: più recenti dell'ultima versione vista e già presenti
// in questo bundle. Il secondo filtro fa sì che una voce scritta in anticipo
// (stessa PR della feature, prima del bump di release-please) resti invisibile
// fino alla release.
//
// compareVersions ritorna null su input sporco e in JS `null <= 0` è true:
// ogni confronto va validato con Number.isInteger, altrimenti il filtro
// lascerebbe passare tutto.
export function pickUnseenNotes(lastSeen, current, notes = releaseNotes) {
  if (!isVersion(lastSeen) || !isVersion(current)) return []
  return notes
    .filter((note) => {
      const vsSeen = compareVersions(note.version, lastSeen)
      const vsCurrent = compareVersions(note.version, current)
      if (!Number.isInteger(vsSeen) || !Number.isInteger(vsCurrent)) return false
      return vsSeen > 0 && vsCurrent <= 0
    })
    .sort((a, b) => compareVersions(b.version, a.version))
}

// La voce più recente già rilasciata in questo bundle, come array di 0 o 1
// elementi. Serve al percorso manuale: su una release di sole correzioni non
// c'è una voce per la versione esatta, ma le ultime novità restano rileggibili.
export function notesUpTo(version, notes = releaseNotes) {
  if (!isVersion(version)) return []
  const reachable = notes
    .filter((note) => {
      const cmp = compareVersions(note.version, version)
      return Number.isInteger(cmp) && cmp <= 0
    })
    .sort((a, b) => compareVersions(b.version, a.version))
  return reachable.slice(0, 1)
}

// Tracce lasciate da un uso precedente dell'app. Servono a distinguere
// un'installazione nuova da un utente di vecchia data che vede il flag
// last-seen-version per la prima volta: il flag nasce con la versione che
// introduce questo modale, e senza questo controllo la release che lo porta non
// lo mostrerebbe a nessuno.
const USAGE_SIGNAL_KEYS = [
  'fidality-card:theme-mode',
  'fidality-card:usage-logging',
  'fidality-card:pwa-install-installed',
  'fidality-card:pwa-install-dismissed-at',
]

export function hasUsageSignal(keys = USAGE_SIGNAL_KEYS) {
  return keys.some((key) => readKey(key) !== null)
}

// Le card salvate sono il segnale più affidabile: chi ha già usato l'app ne ha
// almeno una, anche se non ha mai toccato tema o impostazioni.
export async function isReturningUser() {
  if (hasUsageSignal()) return true
  try {
    return (await db.cards.count()) > 0
  } catch {
    return false
  }
}

// Cosa fare al boot, dato lo stato. Puro, così la regola si testa senza montare
// niente.
// - da scorciatoia in home si salta e basta, senza marker: chi apre una carta
//   al volo alla cassa non vuole un modale sopra il codice a barre, e le voci
//   restano pendenti per il primo avvio normale;
// - 'defer' per il banner install vale una volta sola per versione, altrimenti
//   su Safari iOS in scheda browser (dove canInstall resta true finché l'utente
//   non chiude il banner) le novità slitterebbero per sempre.
export function resolveBootDecision({
  pendingCount,
  canInstall,
  wasDeferred,
  launchedFromShortcut,
}) {
  if (pendingCount === 0) return 'none'
  if (launchedFromShortcut) return 'none'
  if (canInstall && !wasDeferred) return 'defer'
  return 'open'
}

// Letto una volta al caricamento del modulo: applyIntent() consuma l'intent e
// riscrive l'URL prima che App.vue venga montata, quindi più tardi non si
// distinguerebbe più un avvio da scorciatoia da uno normale.
const LAUNCH_INTENT = (() => {
  try {
    return parseIntent(window.location.search)
  } catch {
    return null
  }
})()

export function launchedFromShortcut() {
  return LAUNCH_INTENT !== null
}

const pendingEntries = ref([])
const visibleEntries = ref([])
const whatsNewVisible = computed(() => visibleEntries.value.length > 0)

// Chiamata da main.js. Il flag "ultima versione vista" avanza qui in due casi —
// installazione nuova e release senza novità da raccontare — e poi solo in
// dismiss(). Mai al rinvio e mai all'apertura: chi chiude a metà lettura lo
// rivede.
export async function initWhatsNew() {
  const current = currentVersion()
  const lastSeen = readLastSeen()

  if (!lastSeen) {
    // Chi usa già l'app non è un'installazione nuova: il flag manca solo
    // perché nasce con questa versione. Gli si raccontano le novità correnti,
    // senza segnare nulla — così il rinvio per il banner install continua a
    // funzionare e la voce non si perde.
    if (await isReturningUser()) {
      pendingEntries.value = notesUpTo(current)
      return
    }
    markSeen(current)
    pendingEntries.value = []
    return
  }

  pendingEntries.value = pickUnseenNotes(lastSeen, current)
  if (pendingEntries.value.length === 0) markSeen(current)
}

export function useWhatsNew() {
  const { canInstall } = usePwaInstall()

  function wasDeferred() {
    const marker = readDeferred()
    return marker !== null && compareVersions(marker, currentVersion()) === 0
  }

  // Decide una volta sola, poco dopo il boot: apre, oppure rinvia al prossimo
  // avvio per non finire sopra il banner "Installa l'app".
  function startBootDecision(delayMs = BOOT_DECISION_DELAY_MS) {
    if (pendingEntries.value.length === 0) return
    setTimeout(() => {
      // Campiona l'eleggibilità del banner install: idempotente, la chiama già
      // InstallPromptBanner per conto suo.
      evaluateEligibility()
      const decision = resolveBootDecision({
        pendingCount: pendingEntries.value.length,
        canInstall: canInstall.value,
        wasDeferred: wasDeferred(),
        launchedFromShortcut: launchedFromShortcut(),
      })
      if (decision === 'open') visibleEntries.value = pendingEntries.value
      else if (decision === 'defer') markDeferred(currentVersion())
    }, delayMs)
  }

  function showLatestNotes() {
    visibleEntries.value = notesUpTo(currentVersion())
  }

  function dismiss() {
    visibleEntries.value = []
    markSeen(currentVersion())
    clearDeferred()
  }

  return {
    pendingEntries,
    visibleEntries,
    whatsNewVisible,
    hasNotesToReread: computed(() => notesUpTo(currentVersion()).length > 0),
    wasDeferred,
    startBootDecision,
    showLatestNotes,
    dismiss,
  }
}
