import { defineConfig } from 'astro/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootPkg = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
)

// Espone la versione dell'app come variabile pubblica accessibile via
// import.meta.env.PUBLIC_APP_VERSION nei componenti.
process.env.PUBLIC_APP_VERSION = rootPkg.version

export default defineConfig({
  site: 'https://savez.github.io',
  base: '/fidality-card',
  output: 'static',
  trailingSlash: 'always',
})
