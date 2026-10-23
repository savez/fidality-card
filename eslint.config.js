import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from '@vue/eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: [
      'dist/',
      '.husky/',
      'public/',
      'docs/',
      'coverage/',
      // Worktree paralleli (git-ignored ma dentro l'albero) e residui della landing su main.
      '.claude/',
      'landing/',
      '.vitest/',
      '*.config.js',
    ],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // Iniettato da vite.config.js (define: __APP_VERSION__).
        __APP_VERSION__: 'readonly',
      },
    },
    rules: {
      // Component names: we use single-word names like App, CardsView; OK in this project
      'vue/multi-word-component-names': 'off',
      // Allow underscore prefix for unused destructured / args (e.g., { ownerEmail: _drop, ...rest })
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Console allowed for now (we log Firebase errors etc.)
      'no-console': 'off',
      // Empty catch blocks are intentional in a few places (cleanup that may fail silently)
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
  // Ultimo: spegne le regole di stile in conflitto con Prettier.
  prettierConfig,
]
