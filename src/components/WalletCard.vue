<script setup>
import { ref, computed } from 'vue'
import { getBrand } from '@/brands/brands.js'
import { readableTextColor } from '@/utils/contrast.js'
import IconaDisplay from './IconaDisplay.vue'
import BarcodeDisplay from './BarcodeDisplay.vue'
import BarcodeFullscreen from './BarcodeFullscreen.vue'

const props = defineProps({
  card: { type: Object, required: true },
  open: { type: Boolean, default: false },
})
defineEmits(['toggle', 'toggle-pin'])

const brand = computed(() => getBrand(props.card.brandId))
const bg = computed(() => brand.value?.color ?? '#607D8B')
const fg = computed(() => readableTextColor(bg.value))
const brandName = computed(() => brand.value?.name ?? 'Personalizzato')

const showFull = ref(false)
</script>

<template>
  <div class="wcard" :class="{ open }" :style="{ backgroundColor: bg, color: fg }">
    <button
      class="wcard__head"
      type="button"
      :aria-expanded="open"
      :aria-label="`${card.name} — ${open ? 'chiudi' : 'mostra codice'}`"
      @click="$emit('toggle', card.id)"
    >
      <IconaDisplay :icona="card.icona" :brand-id="card.brandId" :size="30" />
      <span class="wcard__title">
        <span class="nm text-truncate">{{ card.name }}</span>
        <span class="sub text-truncate">{{ brandName }}</span>
      </span>
    </button>

    <button
      class="pin"
      type="button"
      :class="{ on: card.pinned, 'pin--ondark': fg === '#ffffff' }"
      :aria-label="card.pinned ? 'Rimuovi dal primo piano' : 'Metti in primo piano'"
      @click.stop="$emit('toggle-pin', card.id)"
    >
      <v-icon size="16">{{ card.pinned ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
    </button>

    <div class="wcard__reveal">
      <div class="wcard__reveal-inner">
        <div class="wcard__panel">
          <BarcodeDisplay v-if="open" :value="card.barcode" :format="card.barcodeFormat" />
          <div class="code">{{ card.barcode }}</div>
          <div class="actions">
            <v-btn
              size="small"
              variant="flat"
              color="primary"
              prepend-icon="mdi-arrow-expand"
              @click="showFull = true"
            >
              Ingrandisci
            </v-btn>
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-information-outline"
              :to="{ name: 'card-detail', params: { id: card.id } }"
            >
              Dettaglio
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <BarcodeFullscreen
      v-if="showFull"
      :value="card.barcode"
      :format="card.barcodeFormat"
      :name="card.name"
      :brand-color="bg"
      @close="showFull = false"
    />
  </div>
</template>

<style scoped>
.wcard {
  position: relative;
  border-radius: 18px;
  box-shadow: var(--tile-shadow);
  overflow: hidden;
  transition:
    margin 0.3s cubic-bezier(0.2, 0.7, 0.3, 1),
    transform 0.16s ease;
}
/* Stack "wallet": ogni carta sale sulla precedente; quella aperta si stacca. */
.wcard:not(:first-child) {
  margin-top: -16px;
}
.wcard.open {
  z-index: 3;
}
.wcard.open:not(:first-child) {
  margin-top: 14px;
}
.wcard.open + .wcard {
  margin-top: 14px;
}
.wcard:not(.open):active {
  transform: scale(0.985);
}
/* sheen leggero: dà fisicità di tessera */
.wcard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0) 42%,
    rgba(0, 0, 0, 0.08) 100%
  );
  pointer-events: none;
  z-index: 0;
}

.wcard__head {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 78px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 58px 16px 18px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.wcard__title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.nm {
  font-weight: 700;
  font-size: 1.08rem;
  letter-spacing: -0.01em;
  line-height: 1.15;
}
.sub {
  font-size: 0.76rem;
  font-weight: 600;
  opacity: 0.9;
  margin-top: 1px;
}

.pin {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
  color: inherit;
  background: rgba(0, 0, 0, 0.14);
  transition:
    background-color 0.15s ease,
    transform 0.12s ease;
}
.pin::after {
  content: '';
  position: absolute;
  inset: -8px;
}
.pin--ondark {
  background: rgba(255, 255, 255, 0.2);
}
.pin:active {
  transform: scale(0.88);
}
.pin.on {
  background: #ffffff;
  color: #14161a;
}
.pin:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Apertura animata via grid-template-rows (0fr → 1fr): altezza auto animabile. */
.wcard__reveal {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.wcard.open .wcard__reveal {
  grid-template-rows: 1fr;
}
.wcard__reveal-inner {
  overflow: hidden;
}
.wcard__panel {
  margin: 2px 12px 14px;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.code {
  color: #111;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.16em;
  font-weight: 600;
  font-size: 0.92rem;
}
.actions {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 2px;
}
.actions :deep(.v-btn) {
  flex: 1;
}
</style>
