// Formati barcode supportati dall'app, con etichette comprensibili per l'utente.
// Usati sia dallo scanner (POSSIBLE_FORMATS) sia dal form (override "Avanzate").

export const SUPPORTED_FORMATS = [
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'CODE_128',
  'CODE_39',
  'ITF',
  'QR_CODE',
  'DATA_MATRIX',
]

export const FORMAT_LABELS = {
  EAN_13: 'EAN-13 (prodotti, 13 cifre)',
  EAN_8: 'EAN-8 (8 cifre)',
  UPC_A: 'UPC-A (12 cifre)',
  CODE_128: 'Code 128 (lettere e numeri)',
  CODE_39: 'Code 39',
  ITF: 'ITF (interleaved 2 of 5)',
  QR_CODE: 'QR Code',
  DATA_MATRIX: 'Data Matrix',
}

/**
 * Deduce il formato barcode più probabile dal solo valore digitato.
 * I formati 2D (QR/Data Matrix) non sono deducibili dal testo: arrivano
 * dalla scansione (auto-rilevati) o dall'override manuale.
 *
 * @param {string} value - il codice inserito
 * @param {string} [fallback='CODE_128'] - formato di ripiego
 * @returns {string} uno dei SUPPORTED_FORMATS
 */
export function inferBarcodeFormat(value, fallback = 'CODE_128') {
  const v = String(value ?? '').trim()
  if (!v) return fallback

  const digitsOnly = v.replace(/\s+/g, '')
  if (/^\d+$/.test(digitsOnly)) {
    switch (digitsOnly.length) {
      case 13:
        return 'EAN_13'
      case 12:
        return 'UPC_A'
      case 8:
        return 'EAN_8'
      case 14:
        return 'ITF'
      default:
        return 'CODE_128'
    }
  }

  // Contiene lettere/simboli: Code 128 copre l'intero set ASCII.
  return 'CODE_128'
}
