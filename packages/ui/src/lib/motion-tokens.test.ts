import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// The motion rule (token-decisions → Motion): every duration and easing is a
// token. A value the scale lacks gets a token named for its owner. The class
// form is the short one: `duration-quick`, not `duration-(--transition-duration-quick)`.
const root = new URL('../', import.meta.url).pathname;
const sources = [...new Glob('**/*.{ts,tsx}').scanSync(root)].filter((f) => !f.includes('.test.'));

// Components with a literal the rule still has to reach, listed so a new one fails.
const pending = new Set([
  'components/atoms/alert.tsx',
  'components/atoms/alert-dialog.tsx',
  'components/atoms/button.tsx',
  'components/atoms/dialog.tsx',
  'components/atoms/drawer.tsx',
  'components/atoms/input-otp.tsx',
]);

const literal =
  /(?<![\w-])duration-(\d+|\[[\d.]+m?s\])(?![\w-])|ease-\[(ease|cubic-bezier[^\]]*)\]|_\d+ms[_,\]]|_ease[_,\]]/;
const longForm = /duration-\(--transition-duration-|(?<![\w-])ease-\(--ease-/;

describe('motion tokens', () => {
  test('no literal durations or curves outside the pending list', () => {
    const offenders = sources.filter(
      (f) => !pending.has(f) && literal.test(readFileSync(root + f, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  test('one class form for a token', () => {
    const offenders = sources.filter((f) => longForm.test(readFileSync(root + f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
