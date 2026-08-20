import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import App from './App.vue'
import { router } from './router.js'
import { vuetify } from './plugins/vuetify.js'
import { initPwa } from './composables/usePwaUpdate.js'
import { initInstallPrompt } from './composables/usePwaInstall.js'
import { initDbStatus } from './composables/useDbStatus.js'
import { initWhatsNew } from './composables/useWhatsNew.js'
import { applyIntent } from './shortcuts/applyIntent.js'
import { initNearbyOpen } from './composables/useNearbyOpen.js'
import './styles/app.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)

initPwa()
initInstallPrompt()
initDbStatus().then(async () => {
  await router.isReady()
  // Prima del mount: legge il DB per capire se l'utente usava già l'app, così
  // App.vue trova le novità pendenti già calcolate.
  await initWhatsNew()
  let intentApplied = false
  try {
    intentApplied = await applyIntent(router)
  } catch {
    // Scorciatoia best-effort: se il DB non è leggibile, monta comunque l'app
    // (l'alert su dbError in App.vue spiega il problema all'utente).
  }
  app.mount('#app')

  // Apertura in base al posto: DOPO il mount e senza await. Un fix GPS a freddo
  // può volerci secondi — bloccare qui il mount sarebbe schermo bianco.
  initNearbyOpen(router, { intentApplied })
})
