/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion : 2022,
    sourceType  : 'module'
  },
  ignorePatterns: ['dist'],
  plugins : ['@typescript-eslint'],
  env     : {
    node   : true,
    es2022 : true
  },
  rules: {
    'quotes': [
      'error',
      'single',
      { 'allowTemplateLiterals': true }
    ],
    'indent'                            : ['error', 2, { 'SwitchCase': 1 }],
    'no-unused-vars'                    : 'off',
    'prefer-const'                      : 'off',
    '@typescript-eslint/no-unused-vars' : [
      'error',
      {
        'vars'               : 'all',
        'args'               : 'after-used',
        'ignoreRestSiblings' : true,
        'argsIgnorePattern'  : '^_',
        'varsIgnorePattern'  : '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any' : 'off',
    '@typescript-eslint/semi'            : ['error', 'never'],
    'no-trailing-spaces'                 : ['error'],
    '@typescript-eslint/ban-ts-comment'  : 'off',
    'space-infix-ops'                    : ['warn']
  }
}