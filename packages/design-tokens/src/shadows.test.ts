import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { radii } from './tokens/radii.ts';
import { darkShadows, lightShadows } from './tokens/shadows.ts';

const layers = (shadow: string) => shadow.split(/,\s*(?=\d)/);

describe('The overlay shadow gives a popup a visible border', () => {
  for (const [mode, shadows] of [
    ['light', lightShadows],
    ['dark', darkShadows],
  ] as const) {
    test(`${mode}: a 1px edge, then the drops, no ring`, () => {
      const [edge = '', ...drops] = layers(shadows.overlay);
      expect(edge).toStartWith('0 0 0 1px ');
      expect(drops.length).toBeGreaterThan(0);
      for (const drop of drops) expect(drop).not.toStartWith('0 0 0 ');
    });
  }
});

describe('The scrolled shadow is a 1px rule under a sticky header', () => {
  for (const [mode, shadows] of [
    ['light', lightShadows],
    ['dark', darkShadows],
  ] as const) {
    test(`${mode}: one line below, in the input colour, no blur`, () => {
      expect(shadows.scrolled).toBe('0 1px 0 var(--input)');
    });
  }
});

describe('Only the named shadows and the radius scale exist', () => {
  const theme = readFileSync(join(import.meta.dir, 'css/theme.css'), 'utf8');

  test('the theme resets Tailwind shadow and radius steps first', () => {
    expect(theme).toContain('--shadow-*: initial;');
    expect(theme).toContain('--radius-*: initial;');
    expect(theme.indexOf('--shadow-*: initial;')).toBeLessThan(theme.indexOf('--shadow-overlay:'));
    expect(theme.indexOf('--radius-*: initial;')).toBeLessThan(theme.indexOf('--radius-sm:'));
  });

  test('shadow-control, shadow-overlay and shadow-scrolled are the only shadow tokens', () => {
    const shadowTokens = [...theme.matchAll(/^\s+--shadow-([a-z0-9-]+):/gm)].map((m) => m[1]);
    expect(shadowTokens.sort()).toEqual(['control', 'overlay', 'scrolled']);
  });

  test('there is no 4xl radius', () => {
    expect(Object.keys(radii)).not.toContain('4xl');
    expect(theme).not.toContain('--radius-4xl');
  });
});
