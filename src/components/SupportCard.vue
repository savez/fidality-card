<script setup>
// Card "tessera birra": richiama la forma delle tessere fedeltà dell'app
// (raggio --r-card, tile-shadow) con un sigillo ambra come tocco caldo.
// L'intera card è un unico link => un solo target focalizzabile e accessibile.
import { SUPPORT_URL } from '@/config/support.js'
</script>

<template>
  <a
    class="support-card"
    :href="SUPPORT_URL"
    target="_blank"
    rel="noopener"
    aria-label="Offrimi una birra su Buy Me a Coffee (si apre in una nuova scheda)"
  >
    <span class="support-card__seal" aria-hidden="true">
      <v-icon size="26">mdi-glass-mug-variant</v-icon>
    </span>
    <span class="support-card__body">
      <span class="support-card__eyebrow">Ti piace Fidelity Card?</span>
      <span class="support-card__title font-display">Offrimi una birra</span>
    </span>
    <span class="support-card__cta" aria-hidden="true">Sostieni →</span>
  </a>
</template>

<style scoped>
.support-card {
  --beer: rgb(var(--v-theme-warning));
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--r-card);
  box-shadow: var(--tile-shadow);
  background:
    linear-gradient(135deg, rgba(var(--v-theme-warning), 0.1), rgba(var(--v-theme-warning), 0) 60%),
    rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-warning), 0.28);
  text-decoration: none;
  color: rgb(var(--v-theme-on-surface));
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.support-card:hover {
  transform: translateY(-1px);
  box-shadow:
    0 2px 4px rgba(17, 20, 26, 0.06),
    0 16px 30px -14px rgba(17, 20, 26, 0.34);
}
.support-card:focus-visible {
  outline: 2px solid var(--beer);
  outline-offset: 2px;
}

/* Sigillo: la birra come "timbro" tondo, unico elemento forte. */
.support-card__seal {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  color: #2b1d00;
  background: linear-gradient(140deg, var(--beer), rgba(var(--v-theme-warning), 0.72));
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.support-card__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
  line-height: 1.2;
}
.support-card__eyebrow {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.support-card__title {
  font-size: 20px;
  margin-top: 2px;
}

.support-card__cta {
  flex: 0 0 auto;
  align-self: center;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 999px;
  color: #2b1d00;
  background: var(--beer);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .support-card {
    transition: none;
  }
  .support-card:hover {
    transform: none;
  }
}
</style>
