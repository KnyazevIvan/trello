module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions: {
      plugins: ["@babel/plugin-syntax-jsx"]
    }
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'warn'
  }
}