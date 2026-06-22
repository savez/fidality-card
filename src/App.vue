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

    <v-bottom-navigation grow height="66" bg-color="surface">
      <v-btn :to="{ name: 'cards' }" value="cards" stacked>
        <v-icon>mdi-credit-card-multiple</v-icon>
        <span>Card</span>
      </v-btn>
      <v-btn :to="{ name: 'card-new' }" value="new" stacked class="nav-new">
        <v-icon>mdi-plus</v-icon>
        <span>Nuova</span>
      </v-btn>
      <v-btn :to="{ name: 'settings' }" value="settings" stacked>
        <v-icon>mdi-cog</v-icon>
        <span>Impostazioni</span>
      </v-btn>
    </v-bottom-navigation>

    <AppVersionDialog v-model="versionDialogOpen" />
  </v-app>
</template>

<style scoped>
.wordmark {
  font-size: 1.4rem;
}
/* "Nuova" come azione primaria in risalto nella bottom-nav */
:deep(.nav-new) {
  background: rgb(var(--v-theme-primary));
  color: #fff;
  border-radius: 14px;
  margin: 8px 6px;
}
:deep(.nav-new .v-btn__overlay) {
  opacity: 0;
}
</style>
