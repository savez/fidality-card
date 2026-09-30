// Categoria di una card. Assente = fidelity (tutte le card nate prima dei
// documenti): si scrive solo il valore non di default, come per il saldo.
export const DOCUMENT = 'document'

// Colore fisso dei documenti: non hanno brand da cui prenderlo. Più scuro del
// fallback delle card "Personalizzato" (#607D8B) per distinguerli a colpo d'occhio.
export const DOCUMENT_COLOR = '#455A64'

export function isDocument(card) {
  return card?.category === DOCUMENT
}

// showBarcode esiste solo quando è false: una card senza chiave mostra il
// barcode, come ha sempre fatto. Solo un documento può nascondere il barcode:
// uno `showBarcode: false` residuo su una card non-documento (es. da un backup
// modificato a mano o futuro, che importAll copia verbatim) altrimenti la
// lascerebbe senza barcode né pannello codice documento, cioè senza codice.
// Rispecchia la regola di decodePayload: `sb` senza `c: 'document'` è ignorato.
export function showsBarcode(card) {
  return !isDocument(card) || card?.showBarcode !== false
}

export function splitByCategory(list) {
  const cards = []
  const documents = []
  for (const c of list) (isDocument(c) ? documents : cards).push(c)
  return { cards, documents }
}
