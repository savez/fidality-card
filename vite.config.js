import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

// Leggi la versione corrente da package.json al build time.
// Verrà esposta sia al codice client (come __APP_VERSION__) sia al service worker (come cacheId).
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  base: '/',
  define: {
    // Esposta in tutto il codice client come variabile globale.
    // Es. nei .vue: `const v = __APP_VERSION__` → "1.0.0"
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Fidelity Card',
        short_name: 'Fidelity',
        description: 'Le tue fidelity card sempre con te',
        lang: 'it',
        theme_color: '#1976D2',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache name versionato: ogni release ha la sua famiglia di cache.
        // In DevTools (Application → Cache Storage) vedrai `fidality-card-v1.0.0-*`.
        cacheId: `fidality-card-v${pkg.version}`,
        // Include i font (woff2) nel precache così l'app resta tipograficamente
        // corretta anche offline (di default i woff2 non sono inclusi).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Pulisce automaticamente le cache delle versioni precedenti quando il nuovo SW si attiva.
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(googleapis|firebaseapp|firebaseio)\.com\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
})
