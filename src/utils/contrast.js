// Sceglie un colore testo leggibile (scuro o chiaro) sopra un colore di sfondo
// esadecimale, in base alla luminanza percepita. Serve per le tessere dei brand:
// alcuni sono chiari (es. Eni #FFCB05) e richiedono testo scuro.
export function readableTextColor(hex, dark = '#14161a', light = '#ffffff') {
  if (typeof hex !== 'string') return light
  const c = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return light
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? dark : light
}
