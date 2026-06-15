<script setup>
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const showShell = computed(() => auth.isLoggedIn)

async function onLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <v-app>
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
  </v-app>
</template>
