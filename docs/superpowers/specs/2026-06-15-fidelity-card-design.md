# Fidelity Card WebApp — Design Doc

**Data**: 2026-06-15
**Autore**: savez (con assistenza brainstorming)
**Stato**: Approvato per implementazione (post-brainstorming)

## 1. Contesto e obiettivo

Saverio vuole una PWA personale per digitalizzare le proprie fidelity card (barcode/QR) e condividerle con la famiglia tramite un meccanismo "copia/incolla" (no server centrale). L'app deve essere:

- installabile sul telefono (Android in primis)
- funzionante offline
- privata: dati salvati solo localmente, mai inviati a un server
- gratuita da hostare (GitHub Pages)
- senza backend custom da mantenere

I requisiti iniziali completi sono in `specifiche-iniziali.md` alla radice del repo.

## 2. Decisioni chiave (esiti del brainstorming)

| Area | Decisione | Alternative scartate |
|---|---|---|
| Auth | Firebase Auth (piano free) con provider Google | UX-only gate; passphrase locale; nessuna login |
| Storage | IndexedDB via Dexie.js | localStorage (troppo piccolo); SQLite-wasm (overkill) |
| AI brand recognition | **Fuori da MVP**. MVP usa libreria brand hardcoded | BYOK API key; modello on-device |
| Share | QR code **+** link con fragment URL | Solo QR; solo link |
| UI | Vuetify 3 | Bootstrap 5; PrimeVue; Tailwind+DaisyUI |
| Linguaggio | JavaScript puro | TypeScript |
| Lingua UI | Italiano | Inglese; i18n multilingua |
| Brand library MVP | ~20 catene italiane (Esselunga, Conad, Coop, Pam, Lidl, Eurospin, Carrefour, IKEA, Decathlon, MediaWorld, Unieuro, Trony, OBI, Leroy Merlin, Mondadori, Feltrinelli, Q8, Eni, Trenitalia, Italo) | Lista ridotta; lista vuota |
| Deploy | GitHub Pages — `savez.github.io/fidality-card/` | Netlify; Vercel |

### Nota su "privacy" e Firebase Auth

In una SPA statica pura non esiste un vero "gate di accesso": il codice JS è pubblico. Firebase Auth viene usato come:
1. **Identity provider** — restituisce email Google verificata, lato client.
2. **Chiave di partizione DB** — l'email loggata diventa `ownerEmail` su ogni record IndexedDB; al login l'app filtra i record per quella email.

I dati delle card **non vengono mai inviati a Firebase** (no Firestore, no Storage). Restano in IndexedDB sul dispositivo. La "privacy" è quella del browser/PWA: chi ha accesso fisico al dispositivo e al profilo Google vede i propri dati.

## 3. Architettura

```
Browser (PWA installata)
├── Vue 3 + Vite (SPA)
├── Vuetify 3 (UI)
├── Firebase Auth (solo identity)
├── Dexie.js → IndexedDB (DB locale)
├── @zxing/browser (scan barcode/QR via camera)
├── qrcode (generazione QR per share + display card)
└── Service Worker + Web App Manifest (offline + install)
```

Niente backend custom. Firebase usato **solo per auth**.

### Moduli e boundary

| Modulo | Responsabilità | Dipendenze |
|---|---|---|
| `auth/` | Wrapper su Firebase Auth: login Google, logout, `currentUser`, listener stato | `firebase/auth` |
| `db/` | Dexie schema, CRUD card, filtraggio per `ownerEmail`, export/import | `dexie` |
| `scan/` | Wrapper su ZXing: scan da fotocamera con preview, gestione permessi | `@zxing/browser` |
| `share/` | Serializzazione card → payload compatto base64url; QR; link con fragment | `qrcode` |
| `brands/` | Libreria brand precostituita (~20 voci): id, nome, colore, icona di default | — |
| `stores/` | Pinia: `auth` store + `cards` store reattivo | `pinia` |
| `views/` | Schermate Vuetify che orchestrano i moduli | tutti i sopra |

Ogni modulo è progettato per essere testabile in isolamento. `db/` e `share/` sono i pezzi più puri (logica deterministica) e ricevono coverage di unit test.

## 4. Stack tecnico

| Area | Scelta |
|---|---|
| Build | Vite |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| UI | Vuetify 3 |
| Auth | `firebase/auth` (provider Google) |
| Storage | Dexie.js (wrapper IndexedDB) |
| Scan | `@zxing/browser` |
| QR gen | `qrcode` |
| PWA | `vite-plugin-pwa` (Workbox) |
| State | Pinia |
| Routing | vue-router **hash mode** (es. `#/cards`, `#/import?d=...`) — più semplice su GitHub Pages e perfetto per il payload share via fragment |
| Test | Vitest + `@vue/test-utils` + `fake-indexeddb` |

## 5. Data model

### Card (record IndexedDB)

```js
/**
 * @typedef {Object} Card
 * @property {string}      id              uuid v4 — chiave primaria
 * @property {string}      ownerEmail      email Firebase user — chiave di partizione DB
 * @property {string}      name            nome della card (es. "Esselunga Fìdaty")
 * @property {string|null} brandId         riferimento brand library (null = brand custom)
 * @property {string}      barcode         valore letto dal codice (string raw)
 * @property {string}      barcodeFormat   'EAN_13' | 'EAN_8' | 'CODE_128' | 'CODE_39' | 'UPC_A' | 'QR_CODE' | 'DATA_MATRIX' | ...
 *                                         restituito dallo scanner ZXing; in input manuale default 'CODE_128'
 * @property {string}      [icona]         override esplicito: emoji (es. "🛒") o nome icona Material (es. "mdi-cart")
 *                                         se assente: usa l'icona del brand (brandId != null) o fallback generico
 * @property {string}      [note]          testo libero
 * @property {number}      createdAt       epoch ms
 * @property {number}      updatedAt       epoch ms
 */
```

**Risoluzione icona da mostrare nella UI (in ordine):**
1. `icona` se valorizzata
2. `iconDefault` del brand se `brandId != null`
3. Fallback generico (`mdi-card-account-details`)

**Validazione campi (lato form):**
- `name`: trim, 1–80 char
- `brandId`: deve esistere nella brand library oppure essere `null`
- `barcode`: 1–256 char (range pratico per i barcode/QR comuni)
- `icona`: 0–64 char
- `note`: 0–800 char (hard cap per restare sotto il limite QR in condivisione)

### Dexie schema (v1)

```js
db.version(1).stores({
  cards: 'id, ownerEmail, name, brandId, updatedAt',
  meta:  'key'   // ultimo ownerEmail loggato, versione schema, …
})
```

`name` e `brandId` indicizzati per query di ricerca/filtro. `id` chiave primaria. `ownerEmail` indicizzato per la query di partizione.

### Brand library (statica in `src/brands/brands.js`)

Array hardcoded di ~20 brand italiani. Schema:

```js
{ id: 'esselunga', name: 'Esselunga', color: '#E30613', iconDefault: 'mdi-cart' }
```

Lista MVP: Esselunga, Conad, Coop, Pam, Lidl, Eurospin, Carrefour, IKEA, Decathlon, MediaWorld, Unieuro, Trony, OBI, Leroy Merlin, Mondadori, Feltrinelli, Q8, Eni, Trenitalia, Italo.

Non persistito in DB — è codice. Le card referenziano per `brandId` (stringa); rinominare/rimuovere un brand in futuro non rompe i dati esistenti (`brandId` resta valido come stringa anche se non match più la lookup; UI degrada al fallback generico).

### Categorie suggerite (lista in `src/categorie/categorie.js`)

Array hardcoded di valori suggeriti, con icona Material di default associata. L'utente può comunque digitare un valore custom in `categoria`.

```js
export const CATEGORIE = [
  { id: 'supermercato',     label: 'Supermercato',       iconDefault: 'mdi-cart' },
  { id: 'elettronica',      label: 'Elettronica',        iconDefault: 'mdi-television' },
  { id: 'carburante',       label: 'Carburante',         iconDefault: 'mdi-gas-station' },
  { id: 'trasporti',        label: 'Trasporti',          iconDefault: 'mdi-train' },
  { id: 'libreria',         label: 'Libreria',           iconDefault: 'mdi-book-open-variant' },
  { id: 'ristorazione',     label: 'Ristorazione',       iconDefault: 'mdi-silverware-fork-knife' },
  { id: 'abbigliamento',    label: 'Abbigliamento',      iconDefault: 'mdi-tshirt-crew' },
  { id: 'casa_bricolage',   label: 'Casa & Bricolage',   iconDefault: 'mdi-hammer-screwdriver' },
  { id: 'farmacia_salute',  label: 'Farmacia & Salute',  iconDefault: 'mdi-medical-bag' },
  { id: 'altro',            label: 'Altro',              iconDefault: 'mdi-tag' },
]
```

Le card salvate referenziano `categoria` come stringa (es. `"supermercato"` o `"altro"` o valore custom dell'utente). Nessuna FK rigida: se in futuro si rinomina una categoria, le card esistenti restano valide (semplicemente non matcheranno più la lookup nella lista suggerita, finiranno tra le "custom").

### Payload di condivisione

```js
{
  v:  1,                     // versione formato
  n:  string,                // name
  br: string|null,           // brandId (null se brand custom)
  b:  string,                // barcode
  bf: string,                // barcodeFormat
  i:  string|undefined,      // icona (override)
  nt: string|undefined       // note
}
```

Note: `id`, `ownerEmail`, `createdAt`, `updatedAt` **non** sono inclusi nel payload — sono rigenerati dal receiver (nuovo `id`, sua `ownerEmail`, nuovi timestamp). Se il receiver non ha il brand referenziato in `br` nella propria libreria (es. lista divergente), la card viene comunque salvata e la UI ricade sul fallback generico.

Serializzato: JSON minificato → base64url → `https://savez.github.io/fidality-card/#/import?d=<base64url>`.

Il fragment `#` non viene mai inviato al server. Il QR contiene la stessa URL. Limite pratico QR: ~2KB base64url → ~1.5KB JSON. Il cap su `note` (800 char) tiene il payload sotto il limite con margine.

## 6. Flussi utente

### 6.1 Boot
1. Service worker registrato (PWA).
2. Firebase Auth inizializzato.
3. `onAuthStateChanged`: se non loggato → schermata Login; se loggato → carica DB filtrato per `currentUser.email`.

### 6.2 Login
1. Tap "Accedi con Google" → `signInWithPopup` (desktop) / `signInWithRedirect` (mobile, più affidabile su PWA installata).
2. Success → store `ownerEmail` in Pinia + `meta.lastOwnerEmail` in Dexie.
3. Navigazione a `/cards`.

### 6.3 Aggiunta nuova card
Schermata "Nuova" con due tab:
- **Scan**: stream camera (`@zxing/browser`) → decodifica live → popola `barcode` + `barcodeFormat`.
- **Manuale**: input per `barcode`, dropdown per `barcodeFormat` (default `CODE_128`).

Poi form comune:
- `name` (text, obbligatorio) — se brand selezionato, default = nome del brand (modificabile)
- `brandId` (autocomplete sulla brand library, con voce "Altro" per `null`)
- `icona` (text con preview — opzionale; override esplicito sopra il brand; bottone "scegli emoji" opzionale)
- `note` (textarea, opzionale, max 800 char con counter)

Save → Dexie con `ownerEmail = currentUser.email`, `createdAt = updatedAt = Date.now()`, `id = uuidv4()`.

### 6.4 Lista card (home)
- Vuetify grid: tile con icona (risolta secondo l'ordine: `icona` → brand → fallback) + nome + colore di sfondo dal brand (se presente).
- Filtro per brand + search per `name`, opzionali.
- Tap → schermata dettaglio.
- Query: `db.cards.where('ownerEmail').equals(currentUser.email).toArray()`.

### 6.5 Dettaglio card
- Barcode/QR grande generato lato client per scansione in cassa.
- Azioni: Edit / Share / Delete.

### 6.6 Edit
- Stesso form di "Nuova", precompilato.
- Save aggiorna solo `updatedAt`.

### 6.7 Share
- Dialog con tabs: **QR** / **Link**.
- QR: schermo intero, generato lato client.
- Link: "Copia link" via Clipboard API.

### 6.8 Import (da link/QR scansionato)
- Route `/import?d=<payload>` (fragment): parsing → preview card → bottone "Salva nel mio DB" → Dexie insert con `ownerEmail` del receiver.

### 6.9 Delete
- Conferma dialog → `db.cards.delete(id)`.

### 6.10 Export / Import backup
- Settings → "Esporta backup": JSON con tutte le card dell'utente corrente, download come `fidelity-cards-YYYY-MM-DD.json`.
- "Importa backup": upload JSON, merge in Dexie (skip duplicati per `id`).

### 6.11 Logout / cambio account
- Logout Firebase → torno a Login. I dati restano in IndexedDB (filtrati al prossimo login).

## 7. Struttura repo

```
fidality-card/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json
├── public/
│   ├── favicon.svg
│   └── icons/                  # icone PWA (192, 512)
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router.js
│   ├── firebase.js             # init Firebase Auth
│   ├── stores/
│   │   ├── auth.js
│   │   └── cards.js
│   ├── db/
│   │   ├── index.js            # Dexie instance + schema
│   │   └── cards.js            # query helpers
│   ├── scan/
│   │   └── BarcodeScanner.vue
│   ├── share/
│   │   ├── payload.js          # serialize/deserialize + base64url
│   │   └── ShareDialog.vue
│   ├── brands/
│   │   ├── brands.js           # libreria brand precostituita (~20 voci)
│   │   └── BrandPicker.vue     # autocomplete + opzione "Altro"
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── CardsView.vue
│   │   ├── CardDetailView.vue
│   │   ├── CardEditView.vue
│   │   ├── ImportView.vue
│   │   └── SettingsView.vue
│   ├── components/
│   │   ├── CardTile.vue
│   │   ├── BarcodeDisplay.vue
│   │   └── IconaDisplay.vue    # render emoji o icona Material
│   └── plugins/
│       └── vuetify.js
├── tests/
│   ├── db.spec.js
│   ├── payload.spec.js
│   └── brands.spec.js
├── docs/
│   └── superpowers/specs/2026-06-15-fidelity-card-design.md   # questo file
├── .github/
│   └── workflows/
│       └── deploy.yml
├── specifiche-iniziali.md
└── .gitignore
```

## 8. Error handling

- **Camera negata**: messaggio in schermata Scan con bottone "Riprova" + fallback "Inserisci manualmente".
- **Barcode non decodificabile**: timeout dopo 20s di scan continuo → suggerisci inserimento manuale.
- **Login fallito / popup bloccato**: fallback a `signInWithRedirect`; messaggio chiaro.
- **Payload share invalido o versione futura**: ImportView mostra errore con il valore di `v` ricevuto.
- **Payload troppo grande per QR**: warning in ShareDialog + suggerimento di abbreviare le note o usare solo il link.
- **IndexedDB non disponibile** (es. modalità in incognito Firefox): banner di errore al boot.
- **Service Worker update**: prompt "nuova versione disponibile, ricarica" via `vite-plugin-pwa` registerType.

## 9. Setup esterno (manuale dall'utente, non automatizzabile)

1. **Firebase project**:
   - Console Firebase → nuovo progetto (free tier "Spark").
   - Authentication → abilitare provider Google.
   - Authorized domains → aggiungere `savez.github.io`.
   - Copiare la web config in `src/firebase.js` (config Firebase è pubblica by design — può andare nel repo).
2. **GitHub Pages**:
   - Abilitare Pages: source = GitHub Actions.
   - Branch `main` → workflow di build & deploy genera artifact e pubblica.
3. **HTTPS**: GitHub Pages serve già su HTTPS — richiesto da camera API e PWA.

## 10. Scope MVP

**Incluso in MVP:**
- Login Google via Firebase
- Lista card (filtrata per email loggata)
- Aggiunta card (scan + manuale)
- Brand library hardcoded ~20 voci + "Altro" custom
- Dettaglio con barcode/QR grande per cassa
- Edit / Delete
- Share via QR e via link
- Import da link/QR
- Export/Import backup JSON
- PWA installabile + offline (cache app shell)
- Deploy automatico GitHub Pages

**Esplicitamente fuori MVP (v2+):**
- Funzioni AI (riconoscimento brand da foto, generazione icone)
- Cifratura DB locale
- Sync multi-device "vera" (con backend)
- Gruppi/condivisione persistente

## 11. Verification (end-to-end manuale)

1. **Login**: app desktop → login Google → email visibile in header.
2. **Scan**: "Nuova" → consenti camera → scansiona fidelity card reale → valore corretto.
3. **Salvataggio**: completa form → card appare in lista → sopravvive a refresh.
4. **Display**: tap card → barcode grande → un'altra app scanner legge lo stesso valore.
5. **Edit**: modifica nome → aggiornato.
6. **Share QR**: genera QR → secondo device scansiona → preview → conferma → card nel DB del secondo device.
7. **Share link**: copia link → apri in altro tab → import → conferma → presente.
8. **Delete**: cancella → sparisce, sopravvive a refresh.
9. **Export**: scarica backup JSON → contiene tutte le card.
10. **Import backup**: svuota DB → re-importa → card tornano.
11. **PWA install** (Android Chrome): banner "Installa" → icona home → funziona offline (login richiede rete).
12. **Multi-account same device**: logout → login altra email → lista vuota; logout → re-login prima email → card della prima email tornano.

**Test automatici (Vitest):**
- `payload.spec.js`: roundtrip serialize/deserialize; gestione `v` futura; hard cap size.
- `db.spec.js`: CRUD + query per `ownerEmail` con `fake-indexeddb`.
- `brands.spec.js`: brand library — `id` univoci, campi obbligatori (`id`, `name`, `color`, `iconDefault`) presenti.

## 12. Punti tecnici delicati

- **Service Worker + Firebase Auth**: la cache offline non deve servire risposte cache dagli endpoint Firebase (token refresh). Configurare Workbox `runtimeCaching` con `NetworkOnly` per `*.googleapis.com` e `*.firebaseapp.com`.
- **Camera permissions iOS Safari**: richiede `playsinline` + gesture utente prima di `getUserMedia`. ZXing lo gestisce ma vanno testati i casi.
- **`signInWithRedirect` su PWA installata**: alcune piattaforme bloccano popup → fallback redirect; gestire `getRedirectResult` al boot.
- **Limite payload QR**: enforce hard cap su `notes` length lato share (~800 char) per restare nei limiti del QR.
- **Evoluzione brand library**: lista in `src/brands/brands.js`, facilmente aggiornabile. Le card referenziano `brandId` come stringa — rinominare/rimuovere voci non rompe i dati (la card resta valida; UI degrada al fallback generico). Le voci nuove diventano disponibili al prossimo build.
- **Vite base path**: configurare `vite.config.js` con `base: '/fidality-card/'` perché GitHub Pages serve da quella subpath. Le route restano sotto `#/` quindi non serve config extra di vue-router.
- **Hash routing e payload share**: il fragment (`#`) non viene mai inviato al server (proprietà del browser). Vue-router in hash mode usa `#` per le sue route, quindi il payload share va in **query string del fragment**: `https://savez.github.io/fidality-card/#/import?d=<base64url>` — tutto dopo `#` resta lato client.

## 13. Open items / TODO

Niente bloccante. Le decisioni minori (palette colori esatta, copy italiano dei messaggi UI, icona PWA finale) si rifiniscono in implementazione.
