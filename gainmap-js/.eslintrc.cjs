/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',

  // Rules order is important, please avoid shuffling them
  extends: [
    'standard'
  ],

  plugins: [
    'simple-import-sort', // https://github.com/lydell/eslint-plugin-simple-import-sort/
    'unused-imports' // https://github.com/sweepline/eslint-plugin-unused-imports
  ],

  // add your custom rules here
  rules: {
    // https://github.com/lydell/eslint-plugin-simple-import-sort/#usage
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // https://github.com/sweepline/eslint-plugin-unused-imports
    'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }]
  }
}
