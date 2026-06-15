import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  { path: '/', redirect: '/cards' },
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/cards', name: 'cards', component: () => import('@/views/CardsView.vue') },
  { path: '/cards/new', name: 'card-new', component: () => import('@/views/CardEditView.vue') },
  { path: '/cards/:id', name: 'card-detail', component: () => import('@/views/CardDetailView.vue') },
  { path: '/cards/:id/edit', name: 'card-edit', component: () => import('@/views/CardEditView.vue') },
  { path: '/import', name: 'import', component: () => import('@/views/ImportView.vue') },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.ready) {
    await new Promise((resolve) => {
      const stop = setInterval(() => {
        if (authStore.ready) { clearInterval(stop); resolve() }
      }, 30)
    })
  }
  if (to.meta.public) return true
  if (!authStore.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  return true
})
