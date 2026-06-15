# Specifiche iniziali — Fidelity Card WebApp

> Documento di raccolta requisiti iniziali, prima del brainstorming.
> Le decisioni finali andranno nel design doc in `docs/superpowers/specs/`.

## Idea generale

WebApp per salvare e condividere le proprie fidelity card (barcode / QR code) con la famiglia.
Le card sono fisicamente codici a barre o QR code che si vogliono digitalizzare per:
- averli sempre a portata di mano sul telefono
- poterli condividere con membri della famiglia tramite un meccanismo "copia/incolla" (no server centrale)

## Funzionalità principali

### 1. Salvataggio di una nuova carta
- Lettura del barcode / QR code tramite fotocamera del telefono
- Compilazione manuale dei dati associati (nome catena, note, ecc.)
- **Funzione AI (desiderata):** scattando una foto alla carta fisica, identifica automaticamente il brand, precompila i campi e genera un'icona per il frontend

### 2. Modifica di una carta
- Editing dei dati associati a una carta già salvata

### 3. Condivisione di una carta
- Stile "copia/incolla": si trasferiscono **tutti i dati** della carta a un altro dispositivo
- L'altro dispositivo salva la carta nel proprio DB locale
- Nessuna condivisione "live" — è un trasferimento one-shot
- Trasporto preferito: QR code e/o link

### 4. Eliminazione di una carta
- Cancellazione di una carta dal sistema

### 5. Esportazione del DB per backup
- Possibilità di esportare l'intero DB locale come file di backup

## Requisiti tecnici (prima bozza)

### 1. Salvataggio dati
- **DB locale sul telefono** — nessun servizio esterno

### 2. Condivisione
- Stile "copia/incolla" (one-shot), niente server di sincronia
- Trasporto: QR code o link che contiene tutti i dati necessari

### 3. Login
- Login con **Google**
- Al primo login, l'email Google diventa il "proprietario" del DB sul telefono
- Se si entra con un'email diversa, si vede un DB diverso (DB partizionato per email)
- L'app deve essere installabile sul telefono (Android supporta installazione di SPA come PWA)

### 4. Deploy
- **SPA** distribuita tramite un link (GitHub Pages OK)
- Funzionalità **offline** via manifest PWA
- Installabile come app

### 5. Architettura e tecnologie
- SPA in **Vue.js**
- **Nessun backend** — tutto client-side
- UI: Bootstrap 5 — o un framework più snello se ce n'è uno migliore
- Login: SDK Google da decidere — punto aperto nel brainstorming, da capire se fattibile in una SPA puramente client-side senza esporre segreti

## Punti aperti da chiarire nel brainstorming

- Login Google in SPA pura: fattibilità senza backend e senza esporre secret
- Scelta framework UI (Bootstrap 5 vs alternative più snelle: PicoCSS, Tailwind, UnoCSS, …)
- Scelta motore AI per il riconoscimento brand (browser-side vs API esterna)
- Strategia DB locale (IndexedDB, localStorage, SQLite via wasm, …)
- Formato del payload di condivisione (JSON in QR / fragment URL / pastable string)
- Strategia di backup / export (file JSON scaricato, …)
- Gestione delle icone generate dall'AI (storage in DB? generazione on-the-fly?)
