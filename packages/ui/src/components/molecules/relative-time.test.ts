import { describe, expect, test } from 'bun:test';

import { formatRelative, formatRelativeDuration } from './relative-time.tsx';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('formatRelative', () => {
  test('formats a past instant relative to now', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * HOUR);
    expect(formatRelative(twoHoursAgo, { locale: 'en-US' })).toBe('2 hours ago');
  });

  test('formats a future instant with a signed unit', () => {
    const inThreeDays = new Date(Date.now() + 3 * DAY);
    expect(formatRelative(inThreeDays, { locale: 'en-US' })).toBe('in 3 days');
  });

  test('picks the largest unit the delta clears', () => {
    const inTwoMonths = new Date(Date.now() + 65 * DAY);
    expect(formatRelative(inTwoMonths, { locale: 'en-US' })).toBe('in 2 months');
  });

  test('sub-second deltas render as "now" under numeric:auto', () => {
    expect(formatRelative(new Date(), { locale: 'en-US' })).toBe('now');
  });

  test('numeric:always forces a quantified phrase', () => {
    expect(formatRelative(new Date(), { locale: 'en-US', numeric: 'always' })).toBe('in 0 seconds');
  });

  test('honours the locale argument', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * HOUR);
    expect(formatRelative(twoHoursAgo, { locale: 'de-DE' })).toBe('vor 2 Stunden');
  });

  test('accepts ISO strings and epoch millis', () => {
    const iso = new Date(Date.now() - DAY).toISOString();
    expect(formatRelative(iso, { locale: 'en-US' })).toBe('yesterday');
    expect(formatRelative(Date.now() - DAY, { locale: 'en-US' })).toBe('yesterday');
  });
});

describe('formatRelativeDuration', () => {
  const MINUTE = 60 * 1000;

  test('says how long ago as a length of time', () => {
    expect(formatRelativeDuration(Date.now() - 13 * DAY, { locale: 'en-US' })).toBe('13 days');
    expect(formatRelativeDuration(Date.now() - 5 * HOUR, { locale: 'en-US' })).toBe('5 hours');
    expect(formatRelativeDuration(Date.now() - MINUTE, { locale: 'en-US' })).toBe('1 minute');
  });

  test('takes the same unit steps and rounding as formatRelative', () => {
    // Half steps (90s, 36h) are left out: the two calls read the clock a
    // millisecond apart, which can tip a half the other way.
    for (const ago of [100 * 1000, 89 * MINUTE, 40 * HOUR, 13.6 * DAY, 40 * DAY]) {
      const when = Date.now() - ago;
      const relative = formatRelative(when, { locale: 'en-US', numeric: 'always' });
      expect(relative).toBe(`${formatRelativeDuration(when, { locale: 'en-US' })} ago`);
    }
  });

  test("is in the reader's locale, with the unit style", () => {
    expect(formatRelativeDuration(Date.now() - 13 * DAY, { locale: 'de-DE' })).toBe('13 Tage');
    expect(
      formatRelativeDuration(Date.now() - 13 * DAY, { locale: 'en-US', unitStyle: 'narrow' }),
    ).toBe('13d');
  });

  test('an instant ahead reads the same, invalid input reads zero seconds', () => {
    expect(formatRelativeDuration(Date.now() + 2 * HOUR, { locale: 'en-US' })).toBe('2 hours');
    expect(formatRelativeDuration('not a date', { locale: 'en-US' })).toBe('0 seconds');
  });
});
