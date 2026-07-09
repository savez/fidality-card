// Coordinate arrotondate a 5 decimali (~1 m) per la visualizzazione.
export function formatCoords(lat, lng) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}

// Link a OpenStreetMap centrato sul punto, con marker.
export function mapUrl(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
}
