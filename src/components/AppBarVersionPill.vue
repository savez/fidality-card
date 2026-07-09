<script setup>
defineEmits(['click'])
// __APP_VERSION__ è iniettato al build da vite.config.js (define).
// Fallback difensivo se non disponibile (es. test environment).
const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '?.?.?'
</script>

<template>
  <button
    class="version-pill"
    type="button"
    :aria-label="`Versione app ${version}`"
    @click="$emit('click')"
  >
    v{{ version }}
  </button>
</template>

<style scoped>
.version-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  background: rgba(var(--v-theme-on-background), 0.06);
  border: 1px solid rgba(var(--v-theme-on-background), 0.16);
  color: rgba(var(--v-theme-on-background), 0.82);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  cursor: pointer;
  margin-right: 8px;
  letter-spacing: 0.02em;
  line-height: 1.4;
  transition: background-color 0.15s ease;
}
.version-pill:hover {
  background: rgba(var(--v-theme-on-background), 0.1);
}
.version-pill:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
