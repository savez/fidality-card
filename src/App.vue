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

    <v-app-bar flat color="background" density="comfortable">
      <v-app-bar-title class="wordmark font-display">Fidelity Card</v-app-bar-title>
      <v-spacer />
      <AppBarVersionPill @click="versionDialogOpen = true" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation grow height="68" bg-color="surface">
      <v-btn :to="{ name: 'cards' }" value="cards" stacked>
        <v-icon>mdi-credit-card-multiple</v-icon>
        <span>Card</span>
      </v-btn>
      <v-btn :to="{ name: 'settings' }" value="settings" stacked>
        <v-icon>mdi-cog</v-icon>
        <span>Impostazioni</span>
      </v-btn>
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
  </v-app>
</template>

<style scoped>
.wordmark {
  font-size: 1.4rem;
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
