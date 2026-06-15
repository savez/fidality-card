# Fidelity Card

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/savez/fidality-card/actions/workflows/ci.yml/badge.svg)](https://github.com/savez/fidality-card/actions/workflows/ci.yml)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](https://web.dev/progressive-web-apps/)

PWA Vue 3 per salvare e condividere le proprie fidelity card (barcode / QR code) con la famiglia, senza backend custom.

🌐 **Production**: configura su Render (vedi sotto) — sarà disponibile su `https://<nome-servizio>.onrender.com/`.

## Funzionalità

- 📷 Scansione barcode / QR direttamente dalla fotocamera del telefono
- ✍️ Inserimento manuale del codice
- 🏪 Libreria di 20 brand italiani precostituita (Esselunga, Conad, Coop, IKEA, Q8, …) con icone e colori
- 🎨 Icona personalizzabile per card (emoji o nome icona Material Design)
- 🔗 Condivisione card via QR code o link (payload nel fragment URL, mai inviato a un server)
- 📥 Import card da QR / link condiviso
- 💾 Backup completo del DB in JSON (esportabile / re-importabile)
- 📱 Installabile come PWA (offline completo)
- 🌐 100% client-side: i dati restano sul tuo telefono in IndexedDB

## Tech stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`) · Vite · Vuetify 3 · Pinia · vue-router (hash mode)
- **Storage**: IndexedDB via Dexie.js
- **Scan**: `@zxing/browser` + `@zxing/library`
- **QR / Barcode generation**: `qrcode` + `jsbarcode`
- **PWA**: `vite-plugin-pwa` (Workbox)
- **Test**: Vitest + `fake-indexeddb`
- **Linguaggio**: JavaScript puro (no TypeScript)
- **Lingua UI**: italiano
- **Deploy**: Render.com (static site, free tier)

## Setup locale

1. `nvm use` (Node 20)
2. `npm install`
3. `npm run dev` → http://localhost:5173/

## Deploy su Render

Render gestisce build + deploy in autonomia. **Non serve un workflow GitHub Actions per il deploy**: Render osserva il branch `main` via webhook nativo e lancia una nuova build ad ogni push.

### Prima volta (setup)

1. Crea un account su https://render.com (free, sufficiente per static sites)
2. Dashboard → "New +" → **"Blueprint"** (Render leggerà il `render.yaml` committato nel repo)
3. Connetti il tuo account GitHub e seleziona il repo `savez/fidality-card`
4. Conferma il nome del servizio (default: `fidality-card`)
5. Click **"Apply"** / **"Save & Deploy"** — il primo build parte automaticamente (~1-2 min)
6. Quando è online: copia l'URL (es. `https://fidality-card.onrender.com/`)

### Flusso continuativo

```
push su main → Render webhook → build → deploy
                     ↑
       (in parallelo, indipendente)
              ↓
        GitHub Action CI gira `npm test` + `npm run build`
        → mostra ✓/✗ sul commit (visibilità qualità)
```

I due flussi sono indipendenti: Render builda anche se il check CI fallisce. Se vuoi che il deploy parta solo a test passati, dovrai disabilitare auto-deploy in `render.yaml` (`autoDeploy: false`) e triggerare manualmente via Deploy Hook — non implementato in MVP.

### PR previews

Sono abilitate in `render.yaml` (`pullRequestPreviewsEnabled: true`). Ogni PR genera un URL temporaneo tipo `https://fidality-card-pr-5.onrender.com/`. Se ti danno fastidio, rimuovi quella riga dal `render.yaml`.

## CI / GitHub Actions

Il workflow `.github/workflows/ci.yml` parte automaticamente:
- Ad ogni push su `main`
- Ad ogni PR verso `main`

Cosa fa:
- `npm ci` — install riproducibile
- `npm test` — esegue i 22 test Vitest
- `npm run build` — verifica che la build produca artefatti validi

Output visibile nella tab **Actions** del repo GitHub e come check sui commit / PR.

## Script

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Dev server su http://localhost:5173/ con HMR |
| `npm run build` | Build produzione → output in `dist/` |
| `npm run preview` | Serve il `dist/` localmente per verificare la build |
| `npm test` | Esegue la suite Vitest (22 test) |
| `npm run test:watch` | Vitest in modalità watch |

## Struttura progetto

```
src/
├── main.js                  # entry point Vue
├── App.vue                  # shell app (nav bar, bottom nav, banner errori)
├── router.js                # hash routing
├── stores/
│   └── cards.js             # Pinia: lista card reattiva + CRUD
├── db/
│   ├── index.js             # Dexie schema + probeDb
│   └── cards.js             # CRUD card
├── brands/
│   ├── brands.js            # libreria 20 brand italiani
│   └── BrandPicker.vue      # select brand + "Altro"
├── scan/
│   └── BarcodeScanner.vue   # camera + ZXing, timeout 20s
├── share/
│   ├── payload.js           # encode/decode payload base64url
│   └── ShareDialog.vue      # dialog QR + link
├── components/
│   ├── CardTile.vue         # tile della griglia
│   ├── BarcodeDisplay.vue   # render barcode 1D / QR / DataMatrix
│   └── IconaDisplay.vue     # render emoji o icona mdi-*
├── views/
│   ├── CardsView.vue        # lista + ricerca + filtro brand
│   ├── CardEditView.vue     # nuova / modifica
│   ├── CardDetailView.vue   # dettaglio + barcode grande + azioni
│   ├── ImportView.vue       # import da link condiviso
│   └── SettingsView.vue     # backup
├── composables/
│   ├── usePwaUpdate.js      # prompt "nuova versione disponibile"
│   ├── useTheme.js          # tema chiaro / scuro / sistema
│   └── useDbStatus.js       # stato apertura IndexedDB
└── plugins/
    └── vuetify.js           # tema + defaults Vuetify

tests/
├── setup.js                 # fake-indexeddb + crypto polyfill
├── brands.spec.js           # 6 test
├── payload.spec.js          # 9 test
└── db.spec.js               # 8 test
```

## Installazione come app (PWA)

- **Android (Chrome)**: menu (⋮) → "Installa app" — l'icona compare in home, l'app gira a schermo intero
- **iOS (Safari)**: condividi (□↑) → "Aggiungi a Home"
- **Desktop (Chrome / Edge)**: icona di installazione nella barra degli indirizzi

Una volta installata, l'app funziona completamente offline.

## Privacy & dati

- I dati delle card stanno **solo** nel tuo browser (IndexedDB)
- Nessun login, nessun account, nessun server custom: l'app non invia mai i tuoi dati da nessuna parte
- La condivisione card è un trasferimento one-shot: il destinatario salva una copia indipendente nel suo IndexedDB
- Il backup JSON è esportato in locale (download del file) — nessun upload su server
- Chi installa la PWA sul proprio device ha il SUO database isolato (non vede card di altri device)

## Troubleshooting

**Scanner non parte sul telefono in dev**
La fotocamera richiede HTTPS. `http://192.168.x.x:5173` non basta. O fai il deploy su Render e provi lì, o usa una tunnel HTTPS come `ngrok http 5173`.

**"Database locale non disponibile" banner**
IndexedDB non funziona (es. modalità in incognito su Firefox, browser molto vecchio, storage pieno). Esci dall'incognito o libera spazio.

**Render non aggiorna l'app dopo un push**
Verifica nel dashboard Render → tab "Events" che il deploy sia partito. Se è in "Failed", clicca per vedere il log del build. Se non è proprio partito, controlla in Settings del servizio che "Auto-Deploy" sia "Yes" e che il branch monitorato sia `main`.

## Documenti di progetto

- [Specifiche iniziali](specifiche-iniziali.md) — requisiti raccolti prima del brainstorming

Le specifiche tecniche dettagliate e il piano di implementazione sono mantenuti localmente dal maintainer (cartella `docs/`, gitignored). L'architettura completa è desumibile dal codice ben strutturato e dalle sezioni di questo README.

## Roadmap futura (non in MVP)

- 🤖 Riconoscimento brand automatico via foto (AI vision)
- 🔒 Cifratura DB locale (passphrase)
- 🔄 Sync multi-device opzionale
- 👥 Condivisione persistente con gruppi famiglia

## License & Contributing

Questo progetto è rilasciato sotto licenza **MIT** — vedi [LICENSE](LICENSE).

In pratica: chiunque può forkare, modificare, ridistribuire (anche commercialmente), purché mantenga la nota di copyright.

**Vuoi contribuire?** Leggi [CONTRIBUTING.md](CONTRIBUTING.md): troverai come settare l'ambiente di sviluppo, le convenzioni di branch / commit, e come aprire una PR.

**Vuoi solo usare l'app per te?** Forka il repo, deploya su Render (o dove preferisci). Setup è banale: `npm install && npm run build` — nessuna configurazione, nessun env var. Vedi la sezione **Deploy su Render** sopra.
