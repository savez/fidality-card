import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, signInWithGoogle, signOut, consumeRedirectResult, onAuthStateChanged } from '@/firebase.js'
import { db, probeDb } from '@/db/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const dbError = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  const email = computed(() => user.value?.email ?? null)

  async function init() {
    dbError.value = await probeDb()
    await consumeRedirectResult()
    await new Promise((resolve) => {
      let resolved = false
      onAuthStateChanged(auth, async (u) => {
        user.value = u
        if (u?.email && !dbError.value) {
          await db.meta.put({ key: 'lastOwnerEmail', value: u.email })
        }
        ready.value = true
        if (!resolved) { resolved = true; resolve() }
      })
    })
  }

  async function login() {
    await signInWithGoogle()
  }

  async function logout() {
    await signOut()
    user.value = null
  }

  return { user, ready, dbError, isLoggedIn, email, init, login, logout }
})
