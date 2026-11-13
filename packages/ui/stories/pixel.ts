import { expect } from 'storybook/test';

/**
 * How far a measured box may sit from its expected place. A box at a
 * fractional position (a centred dialog, a popup mid-scale) rounds
 * differently from one browser run to the next, by up to a pixel.
 */
export const PIXEL_TOLERANCE = 1;

/** A measured length is `expected` px, give or take `PIXEL_TOLERANCE`. */
export async function expectPx(actual: number | undefined, expected: number, message?: string) {
  await expect(actual, message).toBeDefined();
  await expect(Math.abs((actual as number) - expected), message ?? `${actual}px is ${expected}px`).toBeLessThanOrEqual(
    PIXEL_TOLERANCE,
  );
}
