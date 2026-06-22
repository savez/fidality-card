# Fidelity Card

<p align="center">
  <img src="public/banner.svg" alt="Fidelity Card — PWA Vue 3 open-source per le tue tessere fedeltà" width="100%" />
</p>

[![CI](https://github.com/savez/fidality-card/actions/workflows/ci.yml/badge.svg)](https://github.com/savez/fidality-card/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/website?url=https%3A%2F%2Ffidality-card.onrender.com&label=demo&up_message=online&down_message=offline&up_color=46E3B7)](https://fidality-card.onrender.com)
[![Website](https://img.shields.io/badge/website-savez.github.io-46E3B7)](https://savez.github.io/fidality-card/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/github/package-json/v/savez/fidality-card)](package.json)
[![Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](https://web.dev/progressive-web-apps/)

PWA Vue 3 per salvare, organizzare e condividere fidelity card senza backend custom.

🌐 **Pagina progetto**: <https://savez.github.io/fidality-card/>

🚀 **Live demo**: <https://fidality-card.onrender.com>

## In breve

- 📷 Scansione barcode / QR dalla fotocamera
- ✍️ Inserimento manuale del codice
- 🏪 Brand italiani pronti all’uso
- ⭐ Card pinnabili e ordinate automaticamente
- 🔗 Condivisione via QR, link e Web Share API
- 📥 Import da QR / link condiviso
- 💾 Backup JSON completo
- 🌙 Tema salvato tra le sessioni
- 📱 Installabile come PWA, anche offline
- 🔒 Dati sempre locali in IndexedDB

## Quick start

1. `nvm use` (Node 20)
2. `npm install`
3. `npm run dev`

Apri poi <http://localhost:5173/>.

## Comandi utili

| Comando                | Cosa fa                |
| ---------------------- | ---------------------- |
| `npm run dev`          | Avvia il server locale |
| `npm run build`        | Build di produzione    |
| `npm run preview`      | Anteprima della build  |
| `npm test`             | Esegue la suite Vitest |
| `npm run lint`         | Controllo ESLint       |
| `npm run format:check` | Verifica formattazione |

## Deploy su Render

Il deploy della demo passa da Render:

1. Crea un account su Render
2. New → **Blueprint**
3. Collega il repo `savez/fidality-card`
4. Conferma il servizio e avvia il deploy

Ogni push su `main` aggiorna la demo automaticamente.

## Installazione come app

- **Android / Chrome**: menu ⋮ → Installa app
- **iOS / Safari**: Condividi → Aggiungi a Home
- **Desktop**: icona di installazione nel browser

## Privacy

- Nessun login
- Nessun server custom
- Nessun dato card inviato fuori dal device
- Ogni installazione ha il suo IndexedDB isolato

## Troubleshooting rapido

- **Scanner non parte**: serve HTTPS o `localhost`
- **Database locale non disponibile**: prova fuori dall’incognito o libera spazio
- **Demo non aggiornata**: verifica lo stato del deploy su Render

## Contributing

Leggi [CONTRIBUTING.md](CONTRIBUTING.md) per ambiente di sviluppo, commit convention e PR.

## Support

- Bug o feature request → [Issue](https://github.com/savez/fidality-card/issues/new)
- Domande o discussioni → [Discussions](https://github.com/savez/fidality-card/discussions)

## License

MIT — vedi [LICENSE](LICENSE).
