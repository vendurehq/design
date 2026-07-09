import { describe, expect, test } from 'bun:test';

import { formatRelative } from './relative-time.tsx';

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
