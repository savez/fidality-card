import { defineConfig } from 'astro/config'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Risolve la versione dell'app mostrata nel footer.
// Ordine di priorità:
//   1) env PUBLIC_APP_VERSION → valore esplicito, se mai servisse forzarlo
//   2) `git show origin/main:package.json` → stessa fonte usata da CI
//      (il branch `landing` non riceve i version bump di release-please,
//      quindi la versione reale vive solo su `main`)
//   3) root package.json sul branch corrente → fallback se origin/main
//      non è raggiungibile (es. clone offline o senza remote configurato)
function resolveAppVersion() {
  const fromEnv = process.env.PUBLIC_APP_VERSION
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim()
  }

  try {
    const raw = execFileSync('git', ['show', 'origin/main:package.json'], {
      cwd: __dirname,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const pkg = JSON.parse(raw)
    if (pkg.version && typeof pkg.version === 'string') {
      return pkg.version
    }
  } catch {
    // origin/main non raggiungibile: si passa al fallback locale.
  }

  const pkgPath = path.resolve(__dirname, '../package.json')
  let raw
  try {
    raw = readFileSync(pkgPath, 'utf-8')
  } catch (err) {
    throw new Error(`landing/astro.config.mjs: cannot read root package.json at ${pkgPath}: ${err.message}`)
  }
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch (err) {
    throw new Error(`landing/astro.config.mjs: root package.json is not valid JSON: ${err.message}`)
  }
  if (!pkg.version || typeof pkg.version !== 'string') {
    throw new Error('landing/astro.config.mjs: root package.json has no "version" field')
  }
  return pkg.version
}

const appVersion = resolveAppVersion()

export default defineConfig({
  site: 'https://savez.github.io',
  base: '/fidality-card',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(appVersion),
    },
  },
})
