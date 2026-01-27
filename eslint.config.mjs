import jsdoc from 'eslint-plugin-jsdoc';
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config(
  globalIgnores([ '**/dist/', '**/coverage/' ]),
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'jsdoc/require-jsdoc': ['error', {
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          ClassExpression: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true,
        },
      }],
    }
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
