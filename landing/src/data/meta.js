// Single source of truth per metadati landing.
// La versione viene dal package.json root, iniettata da astro.config.mjs.
const repo = 'https://github.com/savez/fidality-card'

export const meta = {
  appName: 'Fidelity Card',
  tagline: 'Le tue tessere fedeltà, sul tuo telefono.',
  demoUrl: 'https://fidality-card.onrender.com',
  githubUrl: repo,
  contributingUrl: `${repo}/blob/main/CONTRIBUTING.md`,
  securityUrl: `${repo}/blob/main/SECURITY.md`,
  changelogUrl: `${repo}/blob/main/CHANGELOG.md`,
  licenseUrl: `${repo}/blob/main/LICENSE`,
  issuesUrl: `${repo}/issues`,
  starsUrl: `${repo}/stargazers`,
  authorHandle: '@savez',
  authorUrl: 'https://github.com/savez',
  supportUrl: 'https://buymeacoffee.com/goeokwihgz',
  version: import.meta.env.PUBLIC_APP_VERSION ?? 'dev',
}

// I progetti di @savez: stessa lista, stesso ordine, nel footer di tutte e tre
// le landing (nonAbbocco, bacco, fidality-card). Se ne aggiungi uno, aggiungilo
// anche nelle altre due.
export const projects = [
  {
    id: 'nonabbocco',
    name: 'NonAbbocco',
    url: 'https://nonabbocco.smzstudio.it/',
    icon: 'progetti/nonabbocco.png',
    what: 'Ti avvisa quando un indirizzo imita un sito vero.',
  },
  {
    id: 'bacco',
    name: 'Bacco',
    url: 'https://bacco.smzstudio.it/',
    icon: 'progetti/bacco.svg',
    what: 'Il diario dei vini e delle birre che bevi.',
  },
  {
    id: 'fidelity-card',
    name: 'Fidelity Card',
    url: 'https://fidality-card.smzstudio.it/',
    icon: 'progetti/fidelity-card.svg',
    what: 'Le tessere fedeltà, sul telefono.',
  },
]
