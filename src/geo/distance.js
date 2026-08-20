// Raggio medio terrestre (IUGG mean radius), in metri.
const EARTH_RADIUS_M = 6_371_008.8

function toRad(deg) {
  return (deg * Math.PI) / 180
}

// Distanza in metri fra due punti {lat, lng}. Formula haversine: il seno del
// mezzo-delta gestisce da sé il salto dell'antimeridiano, quindi non serve
// normalizzare la differenza di longitudine. Alle distanze che ci interessano
// (decine o centinaia di metri) l'approssimazione sferica è ampiamente sotto
// l'accuratezza del fix GPS.
export function haversineMeters(a, b) {
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLat = lat2 - lat1
  const dLng = toRad(b.lng - a.lng)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  // Math.min(1, …) protegge asin da un argomento appena sopra 1 per errore
  // di arrotondamento sui punti antipodali.
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}
