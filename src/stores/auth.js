import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth, signInWithGoogle, signOut, consumeRedirectResult, onAuthStateChanged } from '@/firebase.js'
import { db } from '@/db/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const isLoggedIn = computed(() => !!user.value)
  const email = computed(() => user.value?.email ?? null)

  async function init() {
    await consumeRedirectResult()
    onAuthStateChanged(auth, async (u) => {
      user.value = u
      if (u?.email) {
        await db.meta.put({ key: 'lastOwnerEmail', value: u.email })
      }
      ready.value = true
    })
  }

  async function login() {
    await signInWithGoogle()
  }

  async function logout() {
    await signOut()
    user.value = null
  }

  return { user, ready, isLoggedIn, email, init, login, logout }
})
