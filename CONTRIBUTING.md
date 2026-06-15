# Contributing

Grazie per l'interesse a contribuire a **Fidelity Card**! Questa è una piccola PWA personale, ma le PR e le issue sono benvenute.

## Setup ambiente di sviluppo

1. Forka il repo su GitHub e clona il tuo fork:
   ```bash
   git clone https://github.com/<tuo-username>/fidality-card.git
   cd fidality-card
   ```
2. Usa Node 20:
   ```bash
   nvm use
   ```
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. Avvia il dev server:
   ```bash
   npm run dev
   ```
   → http://localhost:5173/ (nessuna config, nessun env var richiesto)

## Workflow contribuzione

1. **Apri prima una issue** se la modifica è grossa (feature, refactor, breaking change). Per fix piccoli e ovvi puoi passare diretto al punto 2.
2. Crea un branch dal `main` aggiornato:
   ```bash
   git checkout main && git pull
   git checkout -b feat/<descrizione-breve>
   ```
   Convenzioni branch:
   - `feat/...` per nuove funzionalità
   - `fix/...` per bug fix
   - `chore/...` per pulizia / dipendenze / config
   - `docs/...` per sola documentazione
3. Scrivi codice + test. Prima di committare:
   ```bash
   npm test
   npm run build
   ```
   Entrambi devono passare.
4. Commit messages in formato **conventional commits** (esempi nel git log):
   - `feat(scope): descrizione`
   - `fix(scope): descrizione`
   - `chore: ...`
   - `docs: ...`
   - `test: ...`
   - `refactor(scope): ...`
5. Push del branch sul tuo fork:
   ```bash
   git push -u origin feat/<descrizione-breve>
   ```
6. Apri una PR verso `main` del repo originale. Compila il template (titolo conciso, descrizione del cambiamento, test plan).

## Cosa aspettarti durante la review

- Il workflow CI gira automaticamente: deve essere verde
- Il maintainer (Saverio) revisiona — può chiedere modifiche
- Una volta approvata, viene mergiata
- Render fa il deploy automatico sull'istanza del maintainer (la tua PR non tocca quella istanza finché non è mergiata)

## Stile

- **JavaScript puro**, no TypeScript (scelta consapevole per snellezza)
- **Composition API + `<script setup>`** in Vue
- Vuetify per i componenti UI — riusa le primitive Vuetify invece di stilare a mano
- File piccoli, focalizzati, una responsabilità per file
- Test: Vitest per logica pura e DB (con `fake-indexeddb`); componenti Vue verificati a mano nel dev server

## Aree dove un contributor può aiutare

Vedi la sezione "Roadmap futura" del README, e le issue aperte. In particolare:
- 🤖 AI brand recognition (foto card → riconoscimento brand + icona)
- 🔒 Cifratura DB locale via passphrase
- 🌍 Aggiungere brand di altri paesi alla libreria
- 🎨 Nuovi temi / personalizzazioni
- 📝 Traduzioni UI (i18n)

## Domande

Apri una issue con label "question" o scrivi a savez via GitHub.
