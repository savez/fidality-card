import { getBrand } from '@/brands/brands.js'

export const FALLBACK_ICON = 'mdi-card-account-details'

// Risolve l'icona da mostrare in cascata:
//   1) icona custom (mdi-* → MDI, altrimenti emoji)
//   2) iconDefault del brand (se brandId mappa un brand noto)
//   3) FALLBACK_ICON
//
// Il colore NON viene propagato: il chiamante decide il color via CSS del
// parent (es. CardTile usa `color: white` sul band, IconPickerField usa il
// theme color). In passato `color: brand.color` veniva impostato qui, ma in
// CardTile il band ha `background = brand.color`, quindi l'icona finiva
// dello stesso colore dello sfondo → invisibile.
export function resolveIcon({ icona, brandId } = {}) {
  if (icona) {
    if (icona.startsWith('mdi-')) return { type: 'mdi', value: icona }
    return { type: 'emoji', value: icona }
  }
  const b = getBrand(brandId)
  if (b) return { type: 'mdi', value: b.iconDefault }
  return { type: 'mdi', value: FALLBACK_ICON }
}
