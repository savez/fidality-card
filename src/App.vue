<script setup>
import { onMounted, ref } from 'vue'
import { useDbStatus } from '@/composables/useDbStatus.js'
import { useTheme } from '@/composables/useTheme.js'
import { useWhatsNew } from '@/composables/useWhatsNew.js'
import AppBarVersionPill from '@/components/AppBarVersionPill.vue'
import AppVersionDialog from '@/components/AppVersionDialog.vue'
import InstallPromptBanner from '@/components/InstallPromptBanner.vue'
import WhatsNewDialog from '@/components/WhatsNewDialog.vue'

// Attiva l'applicazione reattiva del tema a livello app (anche al reload e ai
// cambi di preferenza di sistema), indipendentemente dalla route corrente.
useTheme()

const { dbError } = useDbStatus()

const versionDialogOpen = ref(false)

// Modale "Novità": le voci pendenti sono già calcolate da initWhatsNew() in
// main.js; qui parte solo il timer che decide se aprirle ora o al boot dopo.
const {
  visibleEntries,
  whatsNewVisible,
  startBootDecision,
  dismiss: dismissWhatsNew,
} = useWhatsNew()
onMounted(() => startBootDecision())
</script>

<template>
  <v-app>
    <v-alert v-if="dbError" type="error" prominent closable density="comfortable" class="ma-0">
      Database locale non disponibile: {{ dbError }}. Esci dalla modalità incognito o usa un browser
      che supporta IndexedDB.
    </v-alert>

    <v-app-bar flat color="background" density="comfortable">
      <v-app-bar-title class="wordmark font-display">Fidelity Card</v-app-bar-title>
      <v-spacer />
      <AppBarVersionPill @click="versionDialogOpen = true" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation height="68" bg-color="surface" class="app-bottom-nav">
      <div class="nav-side">
        <v-btn :to="{ name: 'cards' }" value="cards" class="nav-btn" aria-label="Card">
          <v-icon>mdi-credit-card-multiple</v-icon>
        </v-btn>
        <v-btn :to="{ name: 'stats' }" value="stats" class="nav-btn" aria-label="Statistiche">
          <v-icon>mdi-podium</v-icon>
        </v-btn>
      </div>
      <!-- Spazio centrale riservato al FAB "Nuova", così nessuna voce ci finisce sotto -->
      <span class="nav-fab-slot" aria-hidden="true"></span>
      <div class="nav-side">
        <v-btn
          :to="{ name: 'settings-locations' }"
          value="locations"
          class="nav-btn"
          aria-label="Storico posizioni GPS"
        >
          <v-icon>mdi-map-marker-radius</v-icon>
        </v-btn>
        <v-btn
          :to="{ name: 'settings' }"
          value="settings"
          class="nav-btn"
          aria-label="Impostazioni"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </div>
    </v-bottom-navigation>

    <!-- "Nuova": FAB centrale rialzato sopra la bottom-nav -->
    <v-btn
      class="nav-fab"
      :to="{ name: 'card-new' }"
      color="primary"
      icon="mdi-plus"
      size="56"
      elevation="6"
      aria-label="Nuova card"
    />

    <AppVersionDialog v-model="versionDialogOpen" />
    <InstallPromptBanner />
    <WhatsNewDialog v-if="whatsNewVisible" :entries="visibleEntries" @close="dismissWhatsNew" />
  </v-app>
</template>

<style scoped>
.wordmark {
  font-size: 1.4rem;
}
/* Barra inferiore: due metà uguali che affiancano lo slot centrale del FAB,
   così il "+" resta centrato e nessuna voce gli finisce sotto. */
.app-bottom-nav :deep(.v-bottom-navigation__content) {
  width: 100%;
  justify-content: space-between;
}
.nav-side {
  display: flex;
  flex: 1 1 0;
  height: 100%;
}
.nav-side .nav-btn {
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
}
.nav-fab-slot {
  flex: 0 0 72px;
}
/* "Nuova": FAB centrale rialzato, sopra la bottom-nav */
.nav-fab {
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  z-index: 1010;
}
</style>
