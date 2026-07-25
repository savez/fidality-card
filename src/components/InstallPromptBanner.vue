<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { usePwaInstall } from '@/composables/usePwaInstall.js'

const SHOW_DELAY_MS = 5000

const { canInstall, platform, evaluateEligibility, promptInstall, dismiss } = usePwaInstall()
const visible = ref(false)
const delayElapsed = ref(false)
let timer = null

onMounted(() => {
  // Campiona subito i casi che non dipendono da un evento futuro (iOS, già
  // standalone, snooze attivo). Su Android/Desktop 'beforeinstallprompt' può
  // arrivare sia prima sia dopo questo punto: se arriva dopo, l'handler in
  // usePwaInstall.js richiama evaluateEligibility() da solo e aggiorna
  // canInstall, che il watcher sotto intercetta.
  evaluateEligibility()
  timer = setTimeout(() => {
    delayElapsed.value = true
  }, SHOW_DELAY_MS)
})

onUnmounted(() => {
  clearTimeout(timer)
})

// I 5s sono un minimo, non un singolo istante di campionamento: il banner
// compare quando ENTRAMBE le condizioni sono vere, in qualunque ordine
// arrivino (delay scaduto, evento beforeinstallprompt arrivato/iOS rilevato).
watch([canInstall, delayElapsed], ([can, elapsed]) => {
  visible.value = can && elapsed
})

function close() {
  dismiss()
  visible.value = false
}

async function install() {
  await promptInstall()
  visible.value = false
}
</script>

<template>
  <v-slide-y-reverse-transition>
    <v-card
      v-if="visible"
      class="install-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Installa Fidelity Card"
    >
      <div class="install-banner__row">
        <div class="install-banner__icon">
          <img src="/icons/icon-192.png" alt="" width="48" height="48" />
        </div>

        <div class="install-banner__text">
          <div class="font-display install-banner__title">Installa Fidelity Card</div>
          <div class="text-caption text-medium-emphasis">
            <template v-if="platform === 'ios'">
              Tocca
              <v-icon size="14" icon="mdi-export-variant" />
              Condividi, poi "Aggiungi a Home"
            </template>
            <template v-else>Aprila come un'app dalla Home, anche offline.</template>
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          aria-label="Chiudi"
          class="install-banner__close"
          @click="close"
        />
      </div>

      <div class="install-banner__actions">
        <template v-if="platform === 'ios'">
          <v-btn variant="text" @click="close">Ho capito</v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" @click="close">Non ora</v-btn>
          <v-btn color="primary" @click="install">Installa</v-btn>
        </template>
      </div>
    </v-card>
  </v-slide-y-reverse-transition>
</template>

<style scoped>
.install-banner {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(108px + env(safe-area-inset-bottom, 0px));
  z-index: 1005;
  border-radius: var(--r-card);
  box-shadow: var(--tile-shadow);
  padding: 12px 8px 12px 12px;
  max-width: 420px;
  margin: 0 auto;
}
.install-banner__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.install-banner__icon img {
  border-radius: 22%;
  display: block;
  box-shadow: 0 1px 4px rgba(17, 20, 26, 0.25);
}
.install-banner__text {
  flex: 1 1 auto;
  min-width: 0;
}
.install-banner__title {
  font-size: 1rem;
  line-height: 1.3;
}
.install-banner__close {
  margin: -4px -4px 0 0;
}
.install-banner__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 8px;
}
</style>
