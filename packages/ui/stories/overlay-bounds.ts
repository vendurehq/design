import { expect } from 'storybook/test';
import { PIXEL_TOLERANCE } from './pixel.ts';

/**
 * Every control in `content` stays inside its padding. A sheet pads its
 * parts, not itself: pass that inset instead.
 */
export async function expectInsidePadding(content: HTMLElement, inset?: number) {
  const box = content.getBoundingClientRect();
  const style = getComputedStyle(content);
  const left = box.left + (inset ?? Number.parseFloat(style.paddingLeft));
  const right = box.right - (inset ?? Number.parseFloat(style.paddingRight));
  for (const control of content.querySelectorAll<HTMLElement>('button:not([data-slot$="-close"]), input')) {
    const rect = control.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(left - PIXEL_TOLERANCE);
    await expect(rect.right).toBeLessThanOrEqual(right + PIXEL_TOLERANCE);
  }
}
