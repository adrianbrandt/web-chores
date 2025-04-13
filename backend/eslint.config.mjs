
import globals from 'globals';
import * as typescriptEslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'src/generated/**', '**/*.js', '**/*.config.ts'],
  },
  ...typescriptEslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parser: typescriptEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'no-const-assign': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
