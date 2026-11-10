import { describe, expect, test } from 'bun:test';
import { darkShadows, lightShadows } from './tokens/shadows.ts';

const layers = (shadow: string) => shadow.split(/,\s*(?=\d)/);

describe('The overlay shadow gives a popup a visible border', () => {
  for (const [mode, shadows] of [
    ['light', lightShadows],
    ['dark', darkShadows],
  ] as const) {
    test(`${mode}: a 1px edge, a 4px ring outside it, then the drops`, () => {
      const [edge = '', ring = '', ...drops] = layers(shadows.overlay);
      expect(edge).toStartWith('0 0 0 1px ');
      expect(ring).toStartWith('0 0 0 5px ');
      expect(drops.length).toBeGreaterThan(0);
      for (const drop of drops) expect(drop).not.toStartWith('0 0 0 ');
    });

    test(`${mode}: the edge is stronger than the ring`, () => {
      const alpha = (layer: string) => Number(layer.match(/\/ ([\d.]+)\)/)?.[1]);
      const [edge = '', ring = ''] = layers(shadows.overlay);
      expect(alpha(edge)).toBeGreaterThan(alpha(ring));
    });
  }
});
