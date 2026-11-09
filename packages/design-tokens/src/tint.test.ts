import { describe, expect, test } from 'bun:test';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

// The v3 look's tints: the foreground at 5.5% (rest) and 8.5% (hover) in light,
// 6% and 9.5% in dark. muted and accent fill every chip, field, hover and
// selected row, so a 0.5% gap shows everywhere.
describe('Tint tokens, the v3 look', () => {
  test('light: muted 5.5%, accent 8.5%', () => {
    expect(lightTheme.muted).toBe('color-mix(in oklab, var(--foreground) 5.5%, transparent)');
    expect(lightTheme.accent).toBe('color-mix(in oklab, var(--foreground) 8.5%, transparent)');
  });

  test('dark: muted 6%, accent 9.5%', () => {
    expect(darkTheme.muted).toBe('color-mix(in oklab, var(--foreground) 6%, transparent)');
    expect(darkTheme.accent).toBe('color-mix(in oklab, var(--foreground) 9.5%, transparent)');
  });
});
