
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
      {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'no-console': 'warn',
      'semi': ['error', 'always'],
    },
  },
];
