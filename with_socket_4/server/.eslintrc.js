/* eslint-env node */
module.exports = {
  ignorePatterns: ['*.d.ts', '**/dist/'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};
