import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { firebaseConfig } from './firebase.config.js'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

const provider = new GoogleAuthProvider()

function isMobileOrInstalledPwa() {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return true
  // iPadOS 13+ reports MacIntel + touch
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return true
  // Installed PWA on any device
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  return false
}

const POPUP_FALLBACK_ERRORS = new Set([
  'auth/popup-blocked',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/operation-not-supported-in-this-environment'
])

export async function signInWithGoogle() {
  if (isMobileOrInstalledPwa()) {
    await signInWithRedirect(auth, provider)
    return null
  }
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (e) {
    if (POPUP_FALLBACK_ERRORS.has(e?.code)) {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}

export async function consumeRedirectResult() {
  try {
    const result = await getRedirectResult(auth)
    return result?.user ?? null
  } catch (e) {
    console.error('Redirect result error', e)
    return null
  }
}

export async function signOut() {
  await fbSignOut(auth)
}

export { onAuthStateChanged }
