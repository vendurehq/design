import { describe, expect, test } from 'bun:test';
import { Linter } from 'eslint';
import plugin from '../eslint/index.js';
import cases from './cases.json';

const rules = Object.keys(cases) as (keyof typeof cases)[];

function lint(code: string, rule: string) {
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
        [`@vendure-io/design/${rule}`]: 'error',
      },
    },
  ]);
}

for (const rule of rules) {
  describe(`ESLint ${rule}`, () => {
    for (const code of cases[rule].valid) {
      test(`accepts ${code}`, () => {
        expect(lint(code, rule)).toEqual([]);
      });
    }

    for (const code of cases[rule].invalid) {
      test(`rejects ${code}`, () => {
        const messages = lint(code, rule);
        expect(messages).toHaveLength(1);
        expect(messages[0]?.ruleId).toBe(`@vendure-io/design/${rule}`);
      });
    }

    // Each rule leaves the other rule's violations alone.
    for (const other of rules.filter((name) => name !== rule)) {
      test(`does not report the ${other} cases`, () => {
        for (const code of cases[other].invalid) {
          expect({ code, messages: lint(code, rule) }).toEqual({ code, messages: [] });
        }
      });
    }
  });
}

test('the recommended config turns on every rule', () => {
  const configured = Object.keys(plugin.configs.recommended[0]?.rules ?? {});
  expect(configured.sort()).toEqual(rules.map((rule) => `@vendure-io/design/${rule}`).sort());
});
