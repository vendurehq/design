import { describe, expect, test } from 'bun:test';
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
