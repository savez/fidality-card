export const CURATED_ICONS = [
  // Supermercato
  { id: 'mdi-cart', label: 'Carrello', category: 'Supermercato' },
  { id: 'mdi-basket', label: 'Cestino', category: 'Supermercato' },
  { id: 'mdi-shopping', label: 'Shopping bag', category: 'Supermercato' },
  { id: 'mdi-storefront', label: 'Negozio', category: 'Supermercato' },
  // Carburante
  { id: 'mdi-gas-station', label: 'Distributore', category: 'Carburante' },
  { id: 'mdi-fuel', label: 'Tanica', category: 'Carburante' },
  { id: 'mdi-ev-station', label: 'Colonnina EV', category: 'Carburante' },
  // Trasporti
  { id: 'mdi-train', label: 'Treno', category: 'Trasporti' },
  { id: 'mdi-bus', label: 'Bus', category: 'Trasporti' },
  { id: 'mdi-airplane', label: 'Aereo', category: 'Trasporti' },
  { id: 'mdi-car', label: 'Auto', category: 'Trasporti' },
  // Sport
  { id: 'mdi-soccer', label: 'Calcio', category: 'Sport' },
  { id: 'mdi-tennis-ball', label: 'Tennis', category: 'Sport' },
  { id: 'mdi-hiking', label: 'Hiking', category: 'Sport' },
  { id: 'mdi-shoe-sneaker', label: 'Sneakers', category: 'Sport' },
  { id: 'mdi-dumbbell', label: 'Palestra', category: 'Sport' },
  // Cultura
  { id: 'mdi-book-open-variant', label: 'Libreria', category: 'Cultura' },
  { id: 'mdi-music', label: 'Musica', category: 'Cultura' },
  { id: 'mdi-movie', label: 'Cinema', category: 'Cultura' },
  // Casa
  { id: 'mdi-hammer-screwdriver', label: 'Bricolage', category: 'Casa' },
  { id: 'mdi-sofa', label: 'Arredo', category: 'Casa' },
  { id: 'mdi-home', label: 'Home', category: 'Casa' },
  // Salute
  { id: 'mdi-medical-bag', label: 'Farmacia', category: 'Salute' },
  { id: 'mdi-pill', label: 'Pillola', category: 'Salute' },
  { id: 'mdi-heart-pulse', label: 'Salute', category: 'Salute' },
  // Ristorazione
  { id: 'mdi-silverware-fork-knife', label: 'Ristorante', category: 'Ristorazione' },
  { id: 'mdi-pizza', label: 'Pizza', category: 'Ristorazione' },
  { id: 'mdi-coffee', label: 'Caffè', category: 'Ristorazione' },
  // Elettronica
  { id: 'mdi-television', label: 'TV', category: 'Elettronica' },
  { id: 'mdi-cellphone', label: 'Telefono', category: 'Elettronica' },
  { id: 'mdi-laptop', label: 'Laptop', category: 'Elettronica' },
  // Moda
  { id: 'mdi-tshirt-crew', label: 'Abbigliamento', category: 'Moda' },
  { id: 'mdi-bag-personal', label: 'Borsa', category: 'Moda' },
  { id: 'mdi-lipstick', label: 'Cosmetica', category: 'Moda' },
  // Generico
  { id: 'mdi-tag', label: 'Tag', category: 'Generico' },
  { id: 'mdi-card-account-details', label: 'Card', category: 'Generico' },
  { id: 'mdi-star', label: 'Stella', category: 'Generico' },
  { id: 'mdi-heart', label: 'Cuore', category: 'Generico' },
]

export const CATEGORY_ORDER = [
  'Supermercato',
  'Carburante',
  'Trasporti',
  'Sport',
  'Cultura',
  'Casa',
  'Salute',
  'Ristorazione',
  'Elettronica',
  'Moda',
  'Generico',
]

export function iconsByCategory() {
  const map = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, []]))
  for (const ico of CURATED_ICONS) {
    map[ico.category].push(ico)
  }
  return map
}
