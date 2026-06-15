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
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
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
  background: rgba(255, 255, 255, 0.28);
}
.version-pill:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
