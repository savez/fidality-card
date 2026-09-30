import { describe, it, expect } from 'vitest'
import { encodePayload, decodePayload, MAX_PAYLOAD_BYTES } from '@/share/payload.js'

const sampleCard = {
  name: 'Esselunga Fìdaty',
  brandId: 'esselunga',
  barcode: '1234567890123',
  barcodeFormat: 'EAN_13',
  icona: '🛒',
  note: 'Carta intestata a Mario',
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
    expect(() => encodePayload({ barcode: 'X', barcodeFormat: 'EAN_13', brandId: null })).toThrow(
      /name/i
    )
  })

  it('encode lancia errore se barcode manca', () => {
    expect(() => encodePayload({ name: 'A', barcodeFormat: 'EAN_13', brandId: null })).toThrow(
      /barcode/i
    )
  })

  it('MAX_PAYLOAD_BYTES è definito e ragionevole', () => {
    expect(MAX_PAYLOAD_BYTES).toBeGreaterThan(1000)
    expect(MAX_PAYLOAD_BYTES).toBeLessThan(3000)
  })

  it('encode di payload troppo grande lancia errore', () => {
    const big = { ...sampleCard, note: 'X'.repeat(5000) }
    expect(() => encodePayload(big)).toThrow(/troppo/i)
  })

  it('round-trip di un documento solo testo', () => {
    const doc = {
      name: 'Codice fiscale',
      brandId: null,
      barcode: 'RSSMRA80A01H501U',
      barcodeFormat: 'CODE_128',
      category: 'document',
      showBarcode: false,
    }
    const decoded = decodePayload(encodePayload(doc))
    expect(decoded.category).toBe('document')
    expect(decoded.showBarcode).toBe(false)
  })

  it('una fidelity non trasporta chiavi di categoria', () => {
    const decoded = decodePayload(encodePayload(sampleCard))
    expect('category' in decoded).toBe(false)
    expect('showBarcode' in decoded).toBe(false)
  })

  it('la versione del payload resta 1 anche per i documenti', () => {
    const encoded = encodePayload({ ...sampleCard, category: 'document', showBarcode: false })
    const pad = '='.repeat((4 - (encoded.length % 4)) % 4)
    const json = atob(encoded.replaceAll('-', '+').replaceAll('_', '/') + pad)
    expect(JSON.parse(json).v).toBe(1)
  })

  it('valori sconosciuti di c/sb → trattati come fidelity con barcode', () => {
    const raw = JSON.stringify({
      v: 1,
      n: 'X',
      br: null,
      b: '1',
      bf: 'CODE_128',
      c: 'boh',
      sb: 'no',
    })
    const encoded = btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
    const decoded = decodePayload(encoded)
    expect('category' in decoded).toBe(false)
    expect('showBarcode' in decoded).toBe(false)
  })
})
