import { describe, expect, test } from 'bun:test';
import { darkTheme, lightTheme } from './tokens/semantic.ts';

describe('Sidebar text, the v3 look', () => {
  test('light items rest on foreground-secondary; the active item takes foreground', () => {
    expect(lightTheme['sidebar-foreground']).toBe('var(--foreground-secondary)');
    expect(lightTheme['sidebar-accent-foreground']).toBe('var(--foreground)');
  });

  test('dark aliases the same text slots, so a theme override reaches both modes', () => {
    expect(darkTheme['sidebar-foreground']).toBe('var(--foreground-secondary)');
    expect(darkTheme['sidebar-accent-foreground']).toBe('var(--foreground)');
  });
});
