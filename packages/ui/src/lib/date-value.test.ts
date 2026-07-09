import { describe, expect, test } from 'bun:test';
import { formatCalendarDate, parseCalendarDate, parseInstant } from './date-value.ts';

describe('calendar-date values', () => {
  test('round-trips without converting through UTC', () => {
    const parsed = parseCalendarDate('2026-07-09');
    expect(parsed).toBeDefined();
    expect(formatCalendarDate(parsed as Date)).toBe('2026-07-09');
  });

  test('rejects impossible and malformed dates', () => {
    expect(parseCalendarDate('2026-02-30')).toBeUndefined();
    expect(parseCalendarDate('09/07/2026')).toBeUndefined();
    expect(parseCalendarDate(undefined)).toBeUndefined();
  });

  test('keeps instant parsing separate', () => {
    expect(parseInstant('2026-07-09T12:30:00.000Z')?.toISOString()).toBe(
      '2026-07-09T12:30:00.000Z',
    );
    expect(parseInstant('not-a-date')).toBeUndefined();
  });
});
