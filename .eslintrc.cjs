module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Iniettato da vite.config.js (define: __APP_VERSION__).
    __APP_VERSION__: 'readonly'
  },
  rules: {
    // Component names: we use single-word names like App, CardsView; OK in this project
    'vue/multi-word-component-names': 'off',
    // Allow underscore prefix for unused destructured / args (e.g., { ownerEmail: _drop, ...rest })
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Console allowed for now (we log Firebase errors etc.)
    'no-console': 'off',
    // Empty catch blocks are intentional in a few places (cleanup that may fail silently)
    'no-empty': ['warn', { allowEmptyCatch: true }]
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '.husky/',
    'public/',
    '*.config.js',
    'vite.config.js'
  ]
}
