import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/cards' },
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
