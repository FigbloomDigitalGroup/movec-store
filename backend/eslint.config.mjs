// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
  {
    // Test files legitimately build partial fake objects (`{ get: jest.fn() } as any`)
    // to stand in for real services/Prisma clients — that's normal Jest mocking, not
    // a type-safety gap, so the same "any is fine" call already made for the whole
    // codebase (no-explicit-any: off, above) extends here to any's downstream
    // consequences too. Production (non-spec) code stays fully strict. Matches both
    // unit specs (*.spec.ts) and e2e specs (*.e2e-spec.ts) — the latter also trips
    // these rules on supertest/jest-expect calls, since test/**, unlike src/**, isn't
    // covered by any tsconfig's "types" array that would resolve their ambient types.
    files: ['**/*spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
);
