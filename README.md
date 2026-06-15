# Fidelity Card

PWA Vue 3 per salvare e condividere le proprie fidelity card.

🌐 Production: configura su Render (vedi sotto) — sarà disponibile su `https://<nome-servizio>.onrender.com/`.

## Setup locale

1. `nvm use` (Node 20)
2. `npm install`
3. Copia `.env.example` → `.env.local` e inserisci i 6 valori del tuo Firebase project.
4. `npm run dev` → http://localhost:5173/

## Setup Firebase

1. Console Firebase → nuovo progetto (piano gratuito Spark).
2. Authentication → Sign-in method → abilitare provider Google.
3. Authorized domains → aggiungere `localhost` (per dev) e il dominio Render (es. `fidality-card.onrender.com`).
4. Project Settings → "Le tue app" → Web → copiare i 6 valori `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
5. Incollarli in `.env.local` come `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, ecc.

## Deploy su Render

1. Crea un account su https://render.com (free).
2. Dashboard → "New +" → "Blueprint" (oppure "Static Site" se preferisci configurazione manuale).
3. Collega il repo GitHub `savez/fidality-card`. Render leggerà `render.yaml`.
4. Conferma il nome del servizio (default: `fidality-card`).
5. Nella sezione Environment Variables del servizio, popola i 6 valori `VITE_FIREBASE_*` con quelli del tuo progetto Firebase (gli stessi del `.env.local`).
6. Save & Deploy. Il primo build parte automaticamente.
7. Quando è online, copia l'URL (es. `https://fidality-card.onrender.com/`) e aggiungilo agli "Authorized domains" su Firebase Auth.

I push su `main` (e PR, se PR previews abilitate) faranno trigger di nuove build automaticamente.

## Script

- `npm run dev` — dev server (http://localhost:5173/)
- `npm run build` — build produzione (output in `dist/`)
- `npm test` — Vitest
- `npm run preview` — preview build

## Architettura

Vedi `docs/superpowers/specs/2026-06-15-fidelity-card-design.md`.

## Installazione come app (PWA)

Su Android Chrome: menu → "Installa app". Su iOS Safari: condividi → "Aggiungi a Home".
