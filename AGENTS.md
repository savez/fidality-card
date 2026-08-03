# AGENTS.md — branch `landing`

Questo file vale **solo per il branch `landing`**, che ospita la landing page (progetto **Astro** in `landing/`). Il codice dell'app vive su `main` e ha il suo `AGENTS.md`.

## Regola cardine

- **`landing` non va MAI unito a `main`** (e `main` non va mai unito a `landing`). Sono due linee separate e indipendenti.
- Le modifiche alla landing entrano con **PR verso `landing`**. Al merge, il workflow `.github/workflows/pages.yml` fa build e **deploy automatico su `gh-pages`**.
- Non fare push diretti su `landing`: sempre da un branch dedicato (`feat/landing-...`) con PR.

## Vincoli (coerenti con l'app)

- **Niente tracciamento anche qui**: nessun analytics, nessuno script di terze parti che profila. La landing resta statica e privata come l'app.
- **Leggera**: HTML/CSS statici via Astro, JS al minimo. Attenzione al peso; preferisci ciò che c'è già.
- **Copy fedele ai valori**: 100% locale, nessun backend, nessun tracciamento, PWA installabile. Il messaggio deve rispecchiare cosa fa davvero l'app.

## Annunciare una nuova funzionalità

Per ogni nuova feature rilasciata sull'app:

1. **Aggiungi/aggiorna una sezione** in `landing/src/components/`, seguendo il pattern dei componenti esistenti (`UsageLog.astro`, `Stats.astro`, `Balance.astro`): usa i design token di `landing/src/styles/global.css` (`--accent`, `--text-muted`, `--radius-pill`…), niente stili slegati.
2. **La feature più recente porta la "version pill"** (`v<versione> · <data>`), come in `Stats.astro`/`Balance.astro`. La versione dell'app è iniettata da CI via `PUBLIC_APP_VERSION` (letta da `origin/main:package.json`); in locale usa un fallback `dev`.
3. **Aggancia la sezione** in `landing/src/pages/index.astro` (import + tag nel `<main>`), in ordine cronologico tra le altre novità.
4. **Verifica il build** prima della PR:
   ```bash
   cd landing && npm ci && PUBLIC_APP_VERSION=<versione> npm run build
   ```
   Controlla che la sezione compaia in `landing/dist/index.html`.
5. **Apri PR verso `landing`** (mai verso `main`).

## Post LinkedIn

Per ogni nuova funzionalità, prepara anche un **post LinkedIn pronto da copiare**: italiano, tono divulgativo, che spiega il beneficio concreto e ribadisce i valori (locale, no-tracking, PWA). Serve ad annunciare la novità insieme all'aggiornamento della landing.
