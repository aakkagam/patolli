import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
  { ignores: ['dist/', 'node_modules/'] },

  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,

  // Formatting rules lose to Prettier. These must come after everything that
  // could introduce a stylistic rule, or the two tools fight.
  prettier,
  ...svelte.configs.prettier,

  {
    languageOptions: {
      globals: { ...globals.browser }
    },
    rules: {
      // A leading underscore marks something deliberately unused, which comes
      // up with rest-destructuring to omit a field and with ignored callback
      // arguments. Without this the convention is unusable.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },

  // Two things here fail silently if missed: without `parser` the Svelte
  // parser cannot read <script lang="ts">, and without `svelteConfig` the
  // Svelte-specific rules go quiet without ever erroring.
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig
      }
    }
  },

  // Build configuration runs in Node, not the browser.
  {
    files: ['*.config.{js,ts}', 'vite.config.ts', 'eslint.config.js', 'svelte.config.js'],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
);
