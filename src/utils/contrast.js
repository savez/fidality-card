// Sceglie il colore testo (scuro o chiaro) più leggibile sopra un colore di
// sfondo esadecimale, massimizzando il rapporto di contrasto WCAG reale (non la
// luminanza percepita). Serve per le tessere dei brand: alcuni sono chiari
// (es. Eni #FFCB05) e richiedono testo scuro, altri mid-tone (es. Leroy Merlin
// #78BE20) dove la soglia ingenua sbagliava e il nome restava illeggibile.
export function readableTextColor(hex, dark = '#14161a', light = '#ffffff') {
  if (typeof hex !== 'string') return light
  const c = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return light

  // Luminanza relativa WCAG (sRGB linearizzato).
  const linear = (channel) => {
    const s = channel / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = (h) =>
    0.2126 * linear(parseInt(h.slice(0, 2), 16)) +
    0.7152 * linear(parseInt(h.slice(2, 4), 16)) +
    0.0722 * linear(parseInt(h.slice(4, 6), 16))
  const ratio = (a, b) => {
    const [hi, lo] = a >= b ? [a, b] : [b, a]
    return (hi + 0.05) / (lo + 0.05)
  }

  const bg = luminance(c)
  const darkRatio = ratio(bg, luminance(dark.replace('#', '')))
  const lightRatio = ratio(bg, luminance(light.replace('#', '')))
  return darkRatio >= lightRatio ? dark : light
}
