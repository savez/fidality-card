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

function isMobileLike() {
  return /Mobi|Android/i.test(navigator.userAgent)
}

export async function signInWithGoogle() {
  if (isMobileLike()) {
    await signInWithRedirect(auth, provider)
    return null
  }
  const result = await signInWithPopup(auth, provider)
  return result.user
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
