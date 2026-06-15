<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const error = ref(null)
const loading = ref(false)

async function onLogin() {
  loading.value = true
  error.value = null
  try {
    await auth.login()
  } catch (e) {
    error.value = e.message ?? 'Errore di login'
  } finally {
    loading.value = false
  }
}

watch(() => auth.isLoggedIn, (v) => {
  if (v) {
    const target = route.query.redirect && typeof route.query.redirect === 'string'
      ? route.query.redirect : '/cards'
    router.replace(target)
  }
}, { immediate: true })
</script>

<template>
  <v-container class="d-flex align-center justify-center" style="min-height: 100dvh">
    <v-card class="pa-6" max-width="420" width="100%">
      <v-card-title class="text-h5 text-center">Benvenuto</v-card-title>
      <v-card-subtitle class="text-center">Accedi per gestire le tue fidelity card</v-card-subtitle>
      <v-card-text>
        <v-btn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-google"
          :loading="loading"
          @click="onLogin"
        >Accedi con Google</v-btn>
        <v-alert v-if="error" type="error" class="mt-4" density="comfortable">{{ error }}</v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>
