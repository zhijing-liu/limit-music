/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2022: true,
    node: true,
    'vue/setup-compiler-macros': true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest'
  },
  extends: ['plugin:vue/vue3-recommended','standard', 'eslint:recommended', '@vue/eslint-config-prettier'],
  rules: {
    'vue/require-default-prop': 'off',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'off'
  },
  settings:{
    'import/resolver': {
      alias: {
        map: [
          ['@', './src/renderer/src/'],
        ],
      }
    },
  }
}
