// Helper per costruire il file di backup del vault, riusato sia dal download
// ("Esporta") sia dalla condivisione via Web Share API ("Condividi vault").

/**
 * Nome file del backup, es. "fidelity-cards-2026-06-22.json".
 * @param {Date} [date=new Date()]
 */
export function backupFilename(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `fidelity-cards-${y}-${m}-${d}.json`
}

/**
 * Costruisce un File JSON (pretty-printed) dal dump di backup.
 * @param {object} dump - risultato di cards.exportBackup()
 * @param {string} filename
 * @returns {File}
 */
export function buildBackupFile(dump, filename) {
  const json = JSON.stringify(dump, null, 2)
  return new File([json], filename, { type: 'application/json' })
}
