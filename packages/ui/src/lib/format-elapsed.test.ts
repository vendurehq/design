import { describe, expect, test } from 'bun:test';
import { formatElapsed, isoDuration } from './format-elapsed.ts';

const en = { locale: 'en-US' };

describe('formatElapsed', () => {
  test('shows the two largest units, the smaller one zero-padded', () => {
    expect(formatElapsed(0, en)).toBe('0s');
    expect(formatElapsed(31_400, en)).toBe('31s');
    expect(formatElapsed(75_000, en)).toBe('1m 15s');
    expect(formatElapsed(9 * 60_000 + 7_000, en)).toBe('9m 07s');
    expect(formatElapsed(65 * 60_000 + 30_000, en)).toBe('1h 05m');
  });

  test('a negative or invalid duration reads 0s', () => {
    expect(formatElapsed(-5_000, en)).toBe('0s');
    expect(formatElapsed(Number.NaN, en)).toBe('0s');
  });

  // The ICU data differs between runtimes (Bun writes "1min 07s" in German,
  // Node "1 Min., 07 Sek."), so the other locales are checked by their shape.
  test("follows the reader's language", () => {
    for (const locale of ['de-DE', 'ar-EG', 'he-IL']) {
      const text = formatElapsed(75_000, { locale });
      expect(text).not.toBe('1m 15s');
      expect(text).not.toMatch(/\bm\b|\bs\b/);
    }
    // Arabic in Egypt writes Arabic-Indic digits.
    expect(formatElapsed(9 * 60_000 + 7_000, { locale: 'ar-EG' })).toContain('٠٧');
    expect(formatElapsed(9 * 60_000 + 7_000, { locale: 'de-DE' })).toContain('07');
  });

  test('keeps its width while it counts, in every locale', () => {
    for (const locale of ['en-US', 'de-DE', 'ar-EG', 'he-IL', 'ja-JP']) {
      for (const start of [60, 3600]) {
        const step = start === 60 ? 1 : 60;
        const lengths = new Set(
          Array.from(
            { length: 60 },
            (_, i) => formatElapsed((start + i * step) * 1000, { locale }).length,
          ),
        );
        expect([locale, start, lengths.size]).toEqual([locale, start, 1]);
      }
    }
  });
});

describe('isoDuration', () => {
  test('writes an ISO 8601 duration', () => {
    expect(isoDuration(0)).toBe('PT0S');
    expect(isoDuration(75_000)).toBe('PT1M15S');
    expect(isoDuration(3_600_000)).toBe('PT1H');
    expect(isoDuration(3_661_000)).toBe('PT1H1M1S');
  });
});
