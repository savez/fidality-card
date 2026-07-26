<script setup>
import { fmtDate, fmtTime, formatCoords, mapUrl } from '@/utils/logFormat.js'

defineProps({
  logs: { type: Array, required: true },
})
</script>

<template>
  <div class="logs">
    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-left">Data</th>
          <th class="text-left">Ora</th>
          <th class="text-left">Posizione</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.id">
          <td class="logs__date">{{ fmtDate(log.openedAt) }}</td>
          <td class="logs__time">{{ fmtTime(log.openedAt) }}</td>
          <td>
            <a
              v-if="log.lat != null && log.lng != null"
              class="log-loc"
              :href="mapUrl(log.lat, log.lng)"
              target="_blank"
              rel="noopener"
            >
              <v-icon size="13">mdi-map-marker</v-icon>
              {{ formatCoords(log.lat, log.lng) }}
            </a>
            <span v-else class="log-loc-empty">—</span>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
/* "surface card" sorella di .meta / .scan in CardDetailView: stesso raggio,
   stessa ombra, hairline che si adatta al tema tramite i token nativi di
   Vuetify. Spostato qui da CardDetailView.vue senza modifiche. */
.logs {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: var(--r-card);
  box-shadow: var(--tile-shadow);
  overflow: hidden;
}
.logs :deep(.v-table) {
  background: transparent;
  border-radius: inherit;
}
.logs :deep(.v-table__wrapper) {
  max-height: 340px;
  overflow-y: auto;
}
.logs :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 40px !important;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  font-size: 0.68rem !important;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.55) !important;
}
.logs :deep(tbody td) {
  height: 46px !important;
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.55)) !important;
  font-size: 0.9rem;
}
.logs :deep(tbody tr:last-child td) {
  border-bottom: none !important;
}
.logs :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.035);
}
.logs :deep(.logs__date) {
  font-weight: 600;
}
.logs :deep(.logs__time) {
  font-variant-numeric: tabular-nums;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

/* Link GPS: pill indaco tappabile con affordance chiara, non un link blu grezzo. */
.log-loc {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 7px;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  text-decoration: none;
  transition: background 0.15s ease;
}
.log-loc:hover {
  background: rgba(var(--v-theme-primary), 0.18);
}
.log-loc:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
.log-loc-empty {
  color: rgba(var(--v-theme-on-surface), 0.38);
}
</style>
