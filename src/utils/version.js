// Helper puri sulle versioni semver dell'app (major.minor.patch, senza
// suffissi: release-please è configurato con prerelease: false).

const SEGMENTS = 20
// Larghezze scelte da insiemi discreti: alternare barre chiaramente spesse e
// chiaramente sottili è ciò che fa leggere la striscia come un codice a barre
// invece che come una linea tratteggiata.
const BAR_WIDTHS = [2, 3, 6, 9]
const GAP_WIDTHS = [2, 3, 5]

// Ritorna [major, minor, patch] oppure null se la stringa non è una versione.
// I campi mancanti valgono 0, così '2.8' equivale a '2.8.0'.
function parse(version) {
  if (typeof version !== 'string') return null
  const parts = version.trim().split('.')
  if (parts.length === 0 || parts.length > 3) return null
  const nums = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : NaN))
  if (nums.some((n) => Number.isNaN(n))) return null
  return [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0]
}

// Confronta due versioni: -1, 0, 1. Ritorna null (non lancia) se una delle due
// non è parsabile: chi chiama deve trattare null come "non lo so", mai come 0.
// Attenzione: in JS `null <= 0` è true, quindi il risultato va sempre validato
// con Number.isInteger() prima di confrontarlo.
export function compareVersions(a, b) {
  const va = parse(a)
  const vb = parse(b)
  if (!va || !vb) return null
  for (let i = 0; i < 3; i++) {
    if (va[i] > vb[i]) return 1
    if (va[i] < vb[i]) return -1
  }
  return 0
}

// true se la stringa è una versione utilizzabile (es. '2.8.0', '2.8').
export function isVersion(version) {
  return parse(version) !== null
}

// Impronta grafica della versione: le larghezze in px di una striscia a codice
// a barre, alternate barra/spazio a partire da una barra (indici pari = barra).
// Deterministica — la stessa versione produce sempre lo stesso disegno — e
// diversa a ogni release. Ritorna [] se la versione non è parsabile.
export function versionBars(version) {
  const parsed = parse(version)
  if (!parsed) return []
  const [major, minor, patch] = parsed
  // Generatore lineare congruenziale seminato dalla versione: nessuna casualità
  // reale, così il disegno è riproducibile e testabile.
  let seed = (major * 10000 + minor * 100 + patch + 1) % 2147483647
  const widths = []
  for (let i = 0; i < SEGMENTS; i++) {
    seed = (seed * 48271) % 2147483647
    const isBar = i % 2 === 0
    widths.push(isBar ? BAR_WIDTHS[seed % BAR_WIDTHS.length] : GAP_WIDTHS[seed % GAP_WIDTHS.length])
  }
  return widths
}
