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
