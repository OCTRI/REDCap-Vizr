module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  extends: [
    'eslint:recommended',
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential'
  ],
  env: {
    browser: true
  },
  globals: {
    'Map': true,
    'Set': true,
    'Promise': true
  },
  plugins: [
    'vue'
  ],
  rules: {
    'eqeqeq': ['error', 'always'],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }]
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.prettierrc.js',
        'karma.conf.js',
        'webpack.config.js'
      ],
      env: {
        browser: false,
        node: true
      }
    },

    // jasmine tests
    {
      files: [
        'test/**/*.js'
      ],
      env: {
        jasmine: true
      }
    }
  ]
};
