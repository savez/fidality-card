<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { usePwaUpdate } from '@/composables/usePwaUpdate.js'

const auth = useAuthStore()
const router = useRouter()
const showShell = computed(() => auth.isLoggedIn)

const { needRefresh, applyUpdate, dismissUpdate } = usePwaUpdate()

function onApplyUpdate() {
  applyUpdate()
}
function onDismissUpdate() {
  dismissUpdate()
}

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
    <v-alert
      v-if="auth.dbError"
      type="error"
      prominent
      closable
      density="comfortable"
      class="ma-0"
    >
      Database locale non disponibile: {{ auth.dbError }}.
      Esci dalla modalità incognito o usa un browser che supporta IndexedDB.
    </v-alert>

    <v-app-bar v-if="showShell" color="primary" density="comfortable">
      <v-app-bar-title>Fidelity Card</v-app-bar-title>
      <v-spacer />
      <v-btn icon="mdi-cog" :to="{ name: 'settings' }" />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon="mdi-account-circle" v-bind="props" />
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>{{ auth.email }}</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="onLogout">
            <template #prepend><v-icon>mdi-logout</v-icon></template>
            <v-list-item-title>Esci</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation v-if="showShell" grow>
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

    <v-snackbar
      v-model="needRefresh"
      :timeout="-1"
      location="bottom"
      color="primary"
    >
      Nuova versione disponibile.
      <template #actions>
        <v-btn variant="text" @click="onApplyUpdate">Ricarica</v-btn>
        <v-btn variant="text" @click="onDismissUpdate">Dopo</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
