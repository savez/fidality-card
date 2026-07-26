<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getBrand } from '@/brands/brands.js'
import { resolveIcon } from '@/icons/resolve.js'
import { fmtDate, fmtTime } from '@/utils/logFormat.js'

const props = defineProps({
  points: { type: Array, required: true },
})

const mapEl = ref(null)
let map = null
let disposed = false

function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  )
}

function buildDivIcon(L, point) {
  const brand = getBrand(point.brandId)
  const color = brand?.color ?? 'rgb(var(--v-theme-primary))'
  const resolved = resolveIcon({ icona: point.icona, brandId: point.brandId })
  const inner =
    resolved.type === 'mdi'
      ? `<i class="mdi ${escapeHtml(resolved.value)}" aria-hidden="true"></i>`
      : `<span aria-hidden="true">${escapeHtml(resolved.value)}</span>`
  return L.divIcon({
    className: 'logs-map-marker',
    html: `<span class="logs-map-marker__dot" style="background:${color}">${inner}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

onMounted(async () => {
  // Leaflet interop: a seconda del bundler l'oggetto L può stare su
  // module.default o direttamente sul namespace — accesso difensivo perché
  // né lint né build lo catturerebbero (è un accesso a proprietà dinamico).
  const leafletModule = await import('leaflet')
  const L = leafletModule.default ?? leafletModule
  await import('leaflet/dist/leaflet.css')

  // Race mount/unmount: se il componente è stato smontato mentre gli import
  // erano in volo, mapEl.value è già null e onUnmounted è già passato senza
  // nulla da ripulire — usciamo prima di creare mappa/marker/listener.
  if (disposed || !mapEl.value) return

  map = L.map(mapEl.value)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  const markers = props.points.map((point) => {
    const marker = L.marker([point.lat, point.lng], { icon: buildDivIcon(L, point) })
    marker.bindPopup(
      `<strong>${escapeHtml(point.name)}</strong><br>${fmtDate(point.openedAt)} ${fmtTime(point.openedAt)}`
    )
    marker.addTo(map)
    return marker
  })

  if (markers.length === 1) {
    map.setView([props.points[0].lat, props.points[0].lng], 15)
  } else {
    map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [24, 24] })
  }
})

onUnmounted(() => {
  disposed = true
  map?.remove()
  map = null
})
</script>

<template>
  <div ref="mapEl" class="logs-map" />
</template>

<style scoped>
.logs-map {
  height: 260px;
  border-radius: var(--r-card);
  overflow: hidden;
}
</style>

<style>
/* Non scoped: l'HTML del marker è iniettato da Leaflet fuori dal namespace scoped di Vue. */
.logs-map-marker__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 1px 4px rgba(17, 20, 26, 0.35);
  border: 2px solid #fff;
  font-size: 15px;
}
</style>
