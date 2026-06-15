import 'fake-indexeddb/auto'

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = await import('node:crypto').then(m => m.webcrypto)
}
