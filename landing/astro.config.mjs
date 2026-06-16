import { defineConfig } from 'astro/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readRootVersion() {
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

const appVersion = readRootVersion()

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
