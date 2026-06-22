import { describe, it, expect } from 'vitest'
import { inferBarcodeFormat, SUPPORTED_FORMATS, FORMAT_LABELS } from '@/scan/barcodeFormat.js'

describe('inferBarcodeFormat', () => {
  it('13 cifre → EAN_13', () => {
    expect(inferBarcodeFormat('8001234567890')).toBe('EAN_13')
  })

  it('12 cifre → UPC_A', () => {
    expect(inferBarcodeFormat('012345678905')).toBe('UPC_A')
  })

  it('8 cifre → EAN_8', () => {
    expect(inferBarcodeFormat('12345670')).toBe('EAN_8')
  })

  it('14 cifre → ITF', () => {
    expect(inferBarcodeFormat('12345678901231')).toBe('ITF')
  })

  it('valore alfanumerico → CODE_128', () => {
    expect(inferBarcodeFormat('NC0 000 660 1')).toBe('CODE_128')
    expect(inferBarcodeFormat('ABC-123')).toBe('CODE_128')
  })

  it('numerico con lunghezza non standard → CODE_128', () => {
    expect(inferBarcodeFormat('12345')).toBe('CODE_128')
  })

  it('ignora spazi attorno e interni per il conteggio cifre', () => {
    expect(inferBarcodeFormat('  8001234567890  ')).toBe('EAN_13')
    expect(inferBarcodeFormat('8 0012 34567 890')).toBe('EAN_13')
  })

  it('valore vuoto → fallback CODE_128', () => {
    expect(inferBarcodeFormat('')).toBe('CODE_128')
    expect(inferBarcodeFormat(null)).toBe('CODE_128')
    expect(inferBarcodeFormat(undefined)).toBe('CODE_128')
  })

  it('rispetta un fallback personalizzato', () => {
    expect(inferBarcodeFormat('', 'QR_CODE')).toBe('QR_CODE')
  })
})

describe('SUPPORTED_FORMATS / FORMAT_LABELS', () => {
  it('ogni formato supportato ha una label leggibile', () => {
    for (const f of SUPPORTED_FORMATS) {
      expect(FORMAT_LABELS[f]).toBeTruthy()
    }
  })

  it("include i formati storici usati dall'app", () => {
    for (const f of [
      'EAN_13',
      'EAN_8',
      'CODE_128',
      'CODE_39',
      'UPC_A',
      'QR_CODE',
      'DATA_MATRIX',
      'ITF',
    ]) {
      expect(SUPPORTED_FORMATS).toContain(f)
    }
  })
})
