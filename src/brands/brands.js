export const BRANDS = [
  { id: 'esselunga', name: 'Esselunga', color: '#E30613', iconDefault: 'mdi-cart' },
  { id: 'conad', name: 'Conad', color: '#E2001A', iconDefault: 'mdi-cart' },
  { id: 'coop', name: 'Coop', color: '#003D7A', iconDefault: 'mdi-cart' },
  { id: 'pam', name: 'Pam', color: '#005CA9', iconDefault: 'mdi-cart' },
  { id: 'lidl', name: 'Lidl', color: '#0050AA', iconDefault: 'mdi-cart' },
  { id: 'eurospin', name: 'Eurospin', color: '#E30613', iconDefault: 'mdi-cart' },
  { id: 'iperal', name: 'Iperal', color: '#D71920', iconDefault: 'mdi-cart' },
  { id: 'carrefour', name: 'Carrefour', color: '#004E9F', iconDefault: 'mdi-cart' },
  { id: 'ikea', name: 'IKEA', color: '#0058A3', iconDefault: 'mdi-sofa' },
  { id: 'decathlon', name: 'Decathlon', color: '#0082C3', iconDefault: 'mdi-soccer' },
  {
    id: 'sportspecialist',
    name: 'SportSpecialist',
    color: '#C8102E',
    iconDefault: 'mdi-shoe-sneaker',
  },
  { id: 'manga', name: 'Manga', color: '#F47216', iconDefault: 'mdi-hiking' },
  { id: 'mediaworld', name: 'MediaWorld', color: '#E30613', iconDefault: 'mdi-television' },
  { id: 'unieuro', name: 'Unieuro', color: '#E20613', iconDefault: 'mdi-television' },
  { id: 'trony', name: 'Trony', color: '#005CA9', iconDefault: 'mdi-television' },
  { id: 'obi', name: 'OBI', color: '#FF7900', iconDefault: 'mdi-hammer-screwdriver' },
  {
    id: 'leroy_merlin',
    name: 'Leroy Merlin',
    color: '#78BE20',
    iconDefault: 'mdi-hammer-screwdriver',
  },
  { id: 'mondadori', name: 'Mondadori', color: '#003366', iconDefault: 'mdi-book-open-variant' },
  {
    id: 'feltrinelli',
    name: 'Feltrinelli',
    color: '#E30613',
    iconDefault: 'mdi-book-open-variant',
  },
  { id: 'q8', name: 'Q8', color: '#F39200', iconDefault: 'mdi-gas-station' },
  { id: 'eni', name: 'Eni', color: '#FFCB05', iconDefault: 'mdi-gas-station' },
  { id: 'trenitalia', name: 'Trenitalia', color: '#CC0000', iconDefault: 'mdi-train' },
  { id: 'italo', name: 'Italo', color: '#A6192E', iconDefault: 'mdi-train' },
  { id: 'rinascente', name: 'Rinascente', color: '#000000', iconDefault: 'mdi-hanger' },
  { id: 'cienne', name: 'Cienne', color: '#1A1A1A', iconDefault: 'mdi-tshirt-crew' },
  { id: 'barberinos', name: "Barberino's", color: '#2B2B2B', iconDefault: 'mdi-razor-double-edge' },
  { id: 'agribrianza', name: 'Agribrianza', color: '#2E7D32', iconDefault: 'mdi-tree' },
  { id: 'autogrill', name: 'Autogrill', color: '#E2001A', iconDefault: 'mdi-car' },
  { id: 'cisalfa', name: 'Cisalfa', color: '#003DA5', iconDefault: 'mdi-shoe-sneaker' },
  { id: 'sephora', name: 'Sephora', color: '#000000', iconDefault: 'mdi-spray' },
  { id: 'stroili', name: 'Stroili', color: '#000000', iconDefault: 'mdi-diamond-stone' },
]

const BY_ID = new Map(BRANDS.map((b) => [b.id, b]))

export function getBrand(id) {
  if (!id) return null
  return BY_ID.get(id) ?? null
}
