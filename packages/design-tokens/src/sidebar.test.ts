import { describe, expect, test } from 'bun:test';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

describe('Sidebar text, the v3 look', () => {
  test('light items rest on foreground-secondary; the active item takes foreground', () => {
    expect(lightTheme['sidebar-foreground']).toBe('var(--foreground-secondary)');
    expect(lightTheme['sidebar-accent-foreground']).toBe('var(--foreground)');
  });

  test('dark is unchanged', () => {
    expect(darkTheme['sidebar-foreground']).toBe('oklch(0.85 0.004 231)');
    expect(darkTheme['sidebar-accent-foreground']).toBe('oklch(0.95 0.004 231)');
  });
});
