<script setup>
import { ref } from 'vue'
import { useDbStatus } from '@/composables/useDbStatus.js'
import { useTheme } from '@/composables/useTheme.js'
import AppBarVersionPill from '@/components/AppBarVersionPill.vue'
import AppVersionDialog from '@/components/AppVersionDialog.vue'

// Attiva l'applicazione reattiva del tema a livello app (anche al reload e ai
// cambi di preferenza di sistema), indipendentemente dalla route corrente.
useTheme()

const { dbError } = useDbStatus()

const versionDialogOpen = ref(false)
</script>

<template>
  <v-app>
    <v-alert v-if="dbError" type="error" prominent closable density="comfortable" class="ma-0">
      Database locale non disponibile: {{ dbError }}. Esci dalla modalità incognito o usa un browser
      che supporta IndexedDB.
    </v-alert>

    <v-app-bar flat color="background" density="comfortable" class="app-bar">
      <v-app-bar-title class="wordmark font-display">Fidelity Card</v-app-bar-title>
      <v-spacer />
      <AppBarVersionPill @click="versionDialogOpen = true" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation grow height="64" bg-color="surface" class="app-nav">
      <v-btn :to="{ name: 'cards' }" value="cards" stacked>
        <v-icon>mdi-credit-card-multiple</v-icon>
        <span>Card</span>
      </v-btn>
      <!-- Slot centrale vuoto: tiene le due tab ai punti 1/3 e lascia spazio
           per il FAB incastonato. -->
      <div class="app-nav__fab-slot" aria-hidden="true" />
      <v-btn :to="{ name: 'settings' }" value="settings" stacked>
        <v-icon>mdi-cog</v-icon>
        <span>Impostazioni</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- "Nuova": FAB circolare incastonato sopra la bottom-nav (ancorato alla
         safe-area; l'anello color surface lo fa leggere come notch nella barra). -->
    <v-btn
      class="nav-fab"
      :to="{ name: 'card-new' }"
      color="primary"
      icon="mdi-plus"
      size="56"
      rounded="circle"
      elevation="8"
      aria-label="Nuova card"
    />

    <AppVersionDialog v-model="versionDialogOpen" />
  </v-app>
</template>

<style scoped>
.wordmark {
  font-size: 1.4rem;
}

/* App-bar: resta color=background (look Pocket arioso, status-bar PWA = sfondo
   pagina), ma una hairline neutra la separa dal contenuto in entrambi i temi —
   in light dissolveva nel #eef1f6. */
.app-bar {
  border-bottom: 1px solid rgba(120, 130, 150, 0.16);
}

/* Bottom-nav: altezza + padding includono la safe-area iOS (home indicator). */
.app-nav {
  height: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.app-nav__fab-slot {
  flex: 1 0 0;
}
/* Tab attiva: accento indaco invece del blocco grigio di default. */
.app-nav :deep(.v-btn--active) {
  color: rgb(var(--v-theme-primary));
}
.app-nav :deep(.v-btn--active .v-btn__overlay) {
  opacity: 0;
}

/* "Nuova": FAB circolare. Il centro cade sul bordo superiore della barra
   (safe + 36 ≈ safe + 64 - 28) e l'anello color surface crea l'effetto notch. */
.nav-fab {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 36px);
  transform: translateX(-50%);
  z-index: 1010;
  border: 4px solid rgb(var(--v-theme-surface));
}

/* Spazio riservato in fondo al contenuto: altezza barra + safe-area + sporgenza
   del FAB + respiro, così l'ultima carta non resta incollata al FAB/barra. */
:deep(.v-main) {
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 64px) !important;
}
</style>
