import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router.js'
import { vuetify } from './plugins/vuetify.js'
import { initPwa } from './composables/usePwaUpdate.js'
import { initDbStatus } from './composables/useDbStatus.js'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(vuetify)
app.use(router)

initPwa()
initDbStatus().then(() => app.mount('#app'))
