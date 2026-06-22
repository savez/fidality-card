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

    <v-app-bar color="primary" density="comfortable">
      <v-app-bar-title>Fidelity Card</v-app-bar-title>
      <v-spacer />
      <AppBarVersionPill @click="versionDialogOpen = true" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation grow>
      <v-btn :to="{ name: 'cards' }" value="cards">
        <v-icon>mdi-credit-card-multiple</v-icon>
        <span>Card</span>
      </v-btn>
      <v-btn :to="{ name: 'card-new' }" value="new">
        <v-icon>mdi-plus-circle</v-icon>
        <span>Nuova</span>
      </v-btn>
      <v-btn :to="{ name: 'settings' }" value="settings">
        <v-icon>mdi-cog</v-icon>
        <span>Impostazioni</span>
      </v-btn>
    </v-bottom-navigation>

    <AppVersionDialog v-model="versionDialogOpen" />
  </v-app>
</template>
