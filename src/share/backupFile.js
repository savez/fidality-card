// Helper per costruire il file di backup del vault, riusato sia dal download
// ("Esporta") sia dalla condivisione via Web Share API ("Condividi vault").

/**
 * Nome file del backup, es. "fidelity-cards-2026-06-22.json".
 * @param {Date} [date=new Date()]
 * @param {string} [ext='json'] estensione (es. 'txt' per la condivisione su Android)
 */
export function backupFilename(date = new Date(), ext = 'json') {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `fidelity-cards-${y}-${m}-${d}.${ext}`
}

/**
 * Costruisce un File (JSON pretty-printed come contenuto) dal dump di backup.
 * @param {object} dump - risultato di cards.exportBackup()
 * @param {string} filename
 * @param {string} [type='application/json'] MIME del File. Per lo share su Chrome
 *   Android usare 'text/plain': i file application/json sono bloccati dalla allowlist
 *   di Web Share e share() lancia NotAllowedError.
 * @returns {File}
 */
export function buildBackupFile(dump, filename, type = 'application/json') {
  const json = JSON.stringify(dump, null, 2)
  return new File([json], filename, { type })
}
