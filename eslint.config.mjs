import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  // All JS files: babel parser + shared rules
  {
    files: ['**/*.js', 'js/**/*.js'],
    languageOptions: {
      parser: babelParser,
      globals: { ...globals.browser }
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': [
        'error',
        { vars: 'all', args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }
      ]
    }
  },

  // Vue files: babel as script-block parser + shared rules
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: babelParser },
      globals: { ...globals.browser }
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': [
        'error',
        { vars: 'all', args: 'none', varsIgnorePattern: '^_', argsIgnorePattern: '^_' }
      ],
      'vue/multi-word-component-names': [
        'error',
        { ignores: ['Chart', 'Instructions', 'Vizr'] }
      ]
    }
  },

  // Node config files: node globals only
  {
    files: ['eslint.config.mjs', '.prettierrc.js', 'karma.conf.js', 'webpack.config.js'],
    languageOptions: {
      globals: { ...globals.node }
    }
  },

  // Jasmine tests: browser + jasmine globals
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jasmine
      }
    }
  }
];
