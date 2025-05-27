const eslintPluginTs = require('@typescript-eslint/eslint-plugin');
const parserTs = require('@typescript-eslint/parser');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: parserTs,
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
];
