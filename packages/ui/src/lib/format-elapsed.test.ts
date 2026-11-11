import { describe, expect, test } from 'bun:test';
import { formatElapsed, isoDuration } from './format-elapsed.ts';

describe('formatElapsed', () => {
  test('shows the two largest units, the smaller one zero-padded', () => {
    expect(formatElapsed(0)).toBe('0s');
    expect(formatElapsed(31_400)).toBe('31s');
    expect(formatElapsed(75_000)).toBe('1m 15s');
    expect(formatElapsed(9 * 60_000 + 7_000)).toBe('9m 07s');
    expect(formatElapsed(65 * 60_000 + 30_000)).toBe('1h 05m');
  });

  test('a negative or invalid duration reads 0s', () => {
    expect(formatElapsed(-5_000)).toBe('0s');
    expect(formatElapsed(Number.NaN)).toBe('0s');
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
