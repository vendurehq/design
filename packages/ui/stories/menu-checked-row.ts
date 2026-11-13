import { expect, waitFor } from 'storybook/test';

/**
 * The checked row of a radio group in any menu has the look of the v3 look:
 * semibold text in the foreground colour and a 14px check at 0.9 opacity.
 */
export async function checkCheckedRowLook(menu: HTMLElement) {
  const checked = menu.querySelector<HTMLElement>('[role=menuitemradio][aria-checked=true]');
  const other = menu.querySelector<HTMLElement>('[role=menuitemradio][aria-checked=false]');
  expect(checked).not.toBeNull();
  expect(other).not.toBeNull();
  const row = checked as HTMLElement;
  const check = row.querySelector<SVGElement>('[data-slot=menu-check]');
  expect(check).not.toBeNull();
  await expect(getComputedStyle(row).fontWeight).toBe('600');
  await expect(getComputedStyle(row).color).not.toBe(getComputedStyle(other as HTMLElement).color);
  // The computed size: the popup scales in, so the box is smaller while it opens.
  const size = getComputedStyle(check as SVGElement);
  await expect([size.width, size.height]).toEqual(['14px', '14px']);
  await waitFor(() => expect(getComputedStyle(check as SVGElement).opacity).toBe('0.9'));
  const otherCheck = (other as HTMLElement).querySelector<SVGElement>('[data-slot=menu-check]');
  // The row that lost the check fades it out.
  await waitFor(() => expect(otherCheck && getComputedStyle(otherCheck).opacity).toBe('0'));
}
