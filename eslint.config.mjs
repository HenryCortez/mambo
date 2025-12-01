// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Configuración de TypeScript
const typeScriptConfigs = tseslint.configs.strictTypeChecked;

// Configuración de estilos
const styleConfigs = tseslint.configs.stylisticTypeChecked;

// Configuración personalizada
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'prettier': eslintPluginPrettier,
    },
    rules: {
      // Reglas de TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      
      // Reglas de estilo
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      'max-len': ['error', { 'code': 100, 'ignoreUrls': true }],
      
      // Regla para detectar punto y coma
      '@typescript-eslint/semi': ['error', 'never'],
      '@typescript-eslint/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none',
            requireLast: false,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      
      // Integración con Prettier
      'prettier/prettier': [
        'error',
        {
          'semi': false,
          'singleQuote': true,
          'trailingComma': 'all',
          'printWidth': 100,
          'tabWidth': 2,
          'endOfLine': 'auto',
        },
        {
          usePrettierrc: false,
        },
      ],
    },
  },
  ...typeScriptConfigs,
  ...styleConfigs,
  {
    rules: {
      ...eslint.configs.recommended.rules,
    },
  },
);
