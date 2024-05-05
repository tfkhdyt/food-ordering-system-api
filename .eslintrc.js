const xo = require('eslint-config-xo');
const xots = require('eslint-config-xo-typescript');
const prettier = require('eslint-config-prettier');

module.exports = {
  ...prettier,
  ...xots,
  ...xo,
  // extends: ['xo', 'xo-typescript', 'prettier'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
  },
};
