<script setup>
import { computed, onMounted, ref } from 'vue'
import { versionBars } from '@/utils/version.js'

const props = defineProps({
  entries: { type: Array, required: true },
})
const emit = defineEmits(['close'])

// La striscia si "scansiona" da sinistra a destra all'apertura. v-dialog monta
// il contenuto quando si apre, quindi lo stato iniziale va dipinto prima:
// senza il requestAnimationFrame la transizione non parte e la striscia
// comparirebbe di colpo.
const scanned = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    scanned.value = true
  })
})

// Impronta della release: un codice a barre le cui larghezze vengono dalla
// versione più recente mostrata. currentColor lo lega al tema, senza override.
const barcode = computed(() => {
  const widths = versionBars(props.entries[0]?.version)
  if (widths.length === 0) return null
  let x = 0
  const stops = widths.map((width, i) => {
    const from = x
    x += width
    return `${i % 2 === 0 ? 'currentColor' : 'transparent'} ${from}px ${x}px`
  })
  return {
    backgroundImage: `linear-gradient(90deg, ${stops.join(', ')})`,
    backgroundSize: `${x}px 100%`,
  }
})

const subtitle = computed(() =>
  props.entries.length > 1
    ? 'Cosa è cambiato nelle versioni che ti sei perso.'
    : 'Cosa è cambiato in questa versione.'
)
</script>

<template>
  <v-dialog
    model-value="true"
    max-width="460"
    scrollable
    aria-labelledby="whats-new-title"
    @update:model-value="emit('close')"
  >
    <v-card>
      <div
        v-if="barcode"
        class="whats-new__barcode text-primary"
        :class="{ 'whats-new__barcode--scanned': scanned }"
        :style="barcode"
        aria-hidden="true"
      />

      <v-card-title class="d-flex align-center pt-4">
        <span id="whats-new-title" class="font-display whats-new__title">Novità</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" aria-label="Chiudi" @click="emit('close')" />
      </v-card-title>

      <v-card-text class="pt-0">
        <p class="text-caption text-medium-emphasis mb-5">{{ subtitle }}</p>

        <section
          v-for="(entry, index) in entries"
          :key="entry.version"
          :class="{ 'mt-6': index > 0 }"
        >
          <v-divider v-if="index > 0" class="mb-5" />

          <span class="whats-new__version">v{{ entry.version }}</span>
          <h3 class="whats-new__heading mt-2 mb-3">{{ entry.title }}</h3>

          <ul class="whats-new__list">
            <li v-for="(item, i) in entry.highlights" :key="i" class="whats-new__item">
              <v-icon
                :icon="item.icon || 'mdi-circle-small'"
                size="20"
                class="whats-new__icon text-primary"
                aria-hidden="true"
              />
              <span>{{ item.text }}</span>
            </li>
          </ul>
        </section>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="emit('close')">Ho capito</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.whats-new__barcode {
  height: 8px;
  background-repeat: repeat-x;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 450ms ease-out;
}
.whats-new__barcode--scanned {
  clip-path: inset(0 0 0 0);
}
@media (prefers-reduced-motion: reduce) {
  .whats-new__barcode {
    clip-path: inset(0 0 0 0);
    transition: none;
  }
}

.whats-new__title {
  font-size: 1.5rem;
  line-height: 1.2;
}
.whats-new__version {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  line-height: 1;
  padding: 4px 8px;
  border-radius: var(--r-control);
  background: rgb(var(--v-theme-surface-variant));
}
.whats-new__heading {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
}
.whats-new__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.whats-new__item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 0.95rem;
  line-height: 1.45;
}
.whats-new__item + .whats-new__item {
  margin-top: 10px;
}
.whats-new__icon {
  flex: 0 0 auto;
  margin-top: 2px;
}
</style>
