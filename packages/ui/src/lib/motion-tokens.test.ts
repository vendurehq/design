import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Glob } from 'bun';

// The motion rule (token-decisions → Motion): every duration and easing is a
// token. A value the scale lacks gets a token named for its owner. The class
// form is the short one: `duration-quick`, not `duration-(--transition-duration-quick)`.
const root = new URL('../', import.meta.url).pathname;
const sources = [...new Glob('**/*.{ts,tsx}').scanSync(root)].filter((f) => !f.includes('.test.'));

const literal =
  /(?<![\w-])duration-(\d+|\[[\d.]+m?s\])(?![\w-])|ease-\[(ease|cubic-bezier[^\]]*)\]|_\d+ms[_,\]]|\*\d+ms\)|_ease[_,\]]/;
const longForm = /duration-\(--transition-duration-|(?<![\w-])ease-\(--ease-/;

describe('motion tokens', () => {
  test('no literal durations or curves', () => {
    const offenders = sources.filter((f) => literal.test(readFileSync(root + f, 'utf8')));
    expect(offenders).toEqual([]);
  });

  test('one class form for a token', () => {
    const offenders = sources.filter((f) => longForm.test(readFileSync(root + f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
