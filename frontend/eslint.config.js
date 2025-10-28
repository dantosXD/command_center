import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginSvelte.configs['flat/recommended'],
  prettierConfig,
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        extraFileExtensions: ['.svelte'],
      },
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
  },
];
