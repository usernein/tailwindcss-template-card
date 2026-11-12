import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'test/fixture.html']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        CARD_VERSION: 'readonly',
        DAISYUI_THEMES: 'readonly'
      }
    },
    rules: {
      // The card intentionally evaluates user-authored expressions from the
      // dashboard config; that is the feature, not an oversight.
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrors: 'none' }
      ]
    }
  },
  {
    files: ['test/**/*.mjs', 'test/**/*.ts', 'scripts/**/*.mjs', 'vite.config.ts'],
    languageOptions: { globals: { ...globals.node } }
  }
)
