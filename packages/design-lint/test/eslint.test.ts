import { describe, expect, test } from 'bun:test';
import { Linter } from 'eslint';
import plugin from '../eslint/index.js';
import cases from './cases.json';

function lint(code: string) {
  const linter = new Linter();
  return linter.verify(code, [
    {
      plugins: {
        '@vendure-io/design': plugin,
      },
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: { jsx: true },
        },
      },
      rules: {
        '@vendure-io/design/no-raw-colors': 'error',
      },
    },
  ]);
}

describe('ESLint no-raw-colors', () => {
  for (const code of cases.valid) {
    test(`accepts ${code}`, () => {
      expect(lint(code)).toEqual([]);
    });
  }

  for (const code of cases.invalid) {
    test(`rejects ${code}`, () => {
      const messages = lint(code);
      expect(messages).toHaveLength(1);
      expect(messages[0]?.ruleId).toBe('@vendure-io/design/no-raw-colors');
    });
  }
});
