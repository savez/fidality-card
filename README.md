# Fidelity Card

PWA Vue 3 per salvare e condividere le proprie fidelity card.

🌐 https://savez.github.io/fidality-card/

## Setup locale

1. `nvm use` (Node 20)
2. `npm install`
3. Copia `src/firebase.config.example.js` → `src/firebase.config.js` e inserisci la config del tuo Firebase project.
4. `npm run dev` → http://localhost:5173/fidality-card/

## Setup Firebase

1. Console Firebase → nuovo progetto (piano gratuito Spark).
2. Authentication → Sign-in method → abilitare provider Google.
3. Authorized domains → aggiungere `savez.github.io` e `localhost`.
4. Project Settings → "Le tue app" → Web → copiare la config in `src/firebase.config.js`.

## Setup GitHub Pages

1. Settings → Pages → Source = "GitHub Actions".
2. Settings → Secrets and variables → Actions → aggiungere:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
3. Push su `main` → il workflow `.github/workflows/deploy.yml` builda e pubblica.

## Script

- `npm run dev` — dev server
- `npm run build` — build produzione
- `npm test` — Vitest
- `npm run preview` — preview build

## Architettura

Vedi `docs/superpowers/specs/2026-06-15-fidelity-card-design.md`.

## Installazione come app (PWA)

Su Android Chrome: menu → "Installa app". Su iOS Safari: condividi → "Aggiungi a Home".
