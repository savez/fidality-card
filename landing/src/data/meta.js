// Single source of truth per metadati landing.
// La versione viene dal package.json root, iniettata da astro.config.mjs.
export const meta = {
  appName: 'Fidelity Card',
  tagline: 'Le tue tessere fedeltà, sul tuo telefono.',
  demoUrl: 'https://fidality-card.onrender.com',
  githubUrl: 'https://github.com/savez/fidality-card',
  contributingUrl: 'https://github.com/savez/fidality-card/blob/main/CONTRIBUTING.md',
  securityUrl: 'https://github.com/savez/fidality-card/blob/main/SECURITY.md',
  changelogUrl: 'https://github.com/savez/fidality-card/blob/main/CHANGELOG.md',
  licenseUrl: 'https://github.com/savez/fidality-card/blob/main/LICENSE',
  authorHandle: '@savez',
  authorUrl: 'https://github.com/savez',
  version: import.meta.env.PUBLIC_APP_VERSION ?? 'dev',
}
