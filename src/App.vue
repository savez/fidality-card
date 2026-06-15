<script setup>
import { computed, ref } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate.js'
import { useTheme } from '@/composables/useTheme.js'
import { useDbStatus } from '@/composables/useDbStatus.js'
import AppBarVersionPill from '@/components/AppBarVersionPill.vue'
import AppVersionDialog from '@/components/AppVersionDialog.vue'

const { mode: themeMode, effective: effectiveTheme, setMode: setThemeMode } = useTheme()
const { dbError } = useDbStatus()

const themeIcon = computed(() => {
  if (themeMode.value === 'light') return 'mdi-weather-sunny'
  if (themeMode.value === 'dark') return 'mdi-weather-night'
  return 'mdi-theme-light-dark'
})

const { needRefresh, applyUpdate, dismissUpdate } = usePwaUpdate()

const versionDialogOpen = ref(false)

function onApplyUpdate() {
  applyUpdate()
}
function onDismissUpdate() {
  dismissUpdate()
}
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
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn :icon="themeIcon" v-bind="menuProps" />
        </template>
        <v-list density="comfortable">
          <v-list-subheader>Tema</v-list-subheader>
          <v-list-item :active="themeMode === 'system'" @click="setThemeMode('system')">
            <template #prepend><v-icon>mdi-theme-light-dark</v-icon></template>
            <v-list-item-title>Sistema</v-list-item-title>
          </v-list-item>
          <v-list-item :active="themeMode === 'light'" @click="setThemeMode('light')">
            <template #prepend><v-icon>mdi-weather-sunny</v-icon></template>
            <v-list-item-title>Chiaro</v-list-item-title>
          </v-list-item>
          <v-list-item :active="themeMode === 'dark'" @click="setThemeMode('dark')">
            <template #prepend><v-icon>mdi-weather-night</v-icon></template>
            <v-list-item-title>Scuro</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon="mdi-cog" :to="{ name: 'settings' }" />
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

    <v-snackbar v-model="needRefresh" :timeout="-1" location="bottom" color="primary">
      Nuova versione disponibile.
      <template #actions>
        <v-btn variant="text" @click="onApplyUpdate">Ricarica</v-btn>
        <v-btn variant="text" @click="onDismissUpdate">Dopo</v-btn>
      </template>
    </v-snackbar>

    <AppVersionDialog v-model="versionDialogOpen" />
  </v-app>
</template>
