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
import './styles/app.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)

initPwa()
initInstallPrompt()
initDbStatus().then(() => app.mount('#app'))
