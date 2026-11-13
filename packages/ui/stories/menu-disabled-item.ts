import { expect, userEvent, waitFor } from 'storybook/test';

/** Resolves any CSS colour (oklch, color-mix, …) to sRGB channels and alpha. */
function rgba(color: string) {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No 2D canvas context');
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a: a / 255 };
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * The contrast of an item's focus ring against the popup behind it, after the
 * item's own opacity: a ring drawn on a dimmed item is dimmed with it.
 */
function ringContrast(element: HTMLElement) {
  const popup = element.closest<HTMLElement>('[role=menu], [role=listbox]') ?? document.body;
  const back = rgba(getComputedStyle(popup).backgroundColor);
  const ring = rgba(getComputedStyle(element).outlineColor);
  const alpha = ring.a * Number(getComputedStyle(element).opacity);
  const shown = {
    r: ring.r * alpha + back.r * (1 - alpha),
    g: ring.g * alpha + back.g * (1 - alpha),
    b: ring.b * alpha + back.b * (1 - alpha),
  };
  const [ringLuminance, backLuminance] = [luminance(shown), luminance(back)];
  return (Math.max(ringLuminance, backLuminance) + 0.05) / (Math.min(ringLuminance, backLuminance) + 0.05);
}

/**
 * Opens a menu with "Send invite", a disabled "Add member" and "Settings",
 * then checks that the disabled item takes no highlight under the pointer or
 * the arrow keys: no fill, no darker text, no stronger icon. Under the arrow
 * keys it shows only the focus ring, at 3:1 or more. `open` replaces the
 * default click on `trigger`.
 */
export async function checkDisabledItemHasNoFill(trigger: HTMLElement, open?: () => Promise<unknown>) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  if (open) await open();
  else await userEvent.click(trigger);
  const item = (name: string) => {
    const element = [...document.querySelectorAll<HTMLElement>('[role^="menuitem"], [role="option"]')].find(
      (candidate) => candidate.textContent?.trim() === name,
    );
    expect(element).toBeDefined();
    return element as HTMLElement;
  };
  const fill = (element: HTMLElement) => getComputedStyle(element).backgroundColor;
  // The text colour and icon opacity a reader sees. A Select option holds its text in a child.
  const look = (element: HTMLElement) => {
    const text = element.querySelector<HTMLElement>('[data-slot$="-item-text"]') ?? element;
    const icon = element.querySelector('svg');
    return {
      color: getComputedStyle(text).color,
      icon: icon ? getComputedStyle(icon).opacity : null,
    };
  };
  await waitFor(() => expect(item('Add member')).toBeVisible());
  // An item at rest has no fill: that is the look a disabled item keeps.
  const none = fill(item('Settings'));
  const disabled = item('Add member');
  expect(disabled).toHaveAttribute('data-disabled');
  const atRest = look(disabled);

  // Pointer: an enabled item fills, the disabled one does not.
  await user.hover(item('Send invite'));
  await waitFor(() => expect(fill(item('Send invite'))).not.toBe(none));
  await user.hover(disabled);
  expect(fill(disabled)).toBe(none);
  expect(look(disabled)).toEqual(atRest);

  // Keyboard: the arrow keys stop on the disabled item without the fill, and
  // its text and icon keep their rest look. Only the ring shows, at 3:1.
  item('Send invite').focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(document.activeElement).toBe(disabled));
  expect(fill(disabled)).toBe(none);
  // The icon fades over a transition: wait it out before comparing.
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(look(disabled)).toEqual(atRest);
  expect(disabled.matches(':focus-visible')).toBe(true);
  expect(ringContrast(disabled)).toBeGreaterThanOrEqual(3);
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(document.activeElement).toBe(item('Settings')));
  await waitFor(() => expect(fill(item('Settings'))).not.toBe(none));
  await user.keyboard('{Escape}');
}

/** The opacity an element shows with, after its own and its ancestors' up to `stop`. */
function shownOpacity(element: Element, stop: Element) {
  let opacity = 1;
  for (let node: Element | null = element; node && node !== stop.parentElement; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity);
  }
  return opacity;
}

/**
 * How strong a part of an item shows: its fill if it has one (a status dot),
 * else its text colour, times every opacity up to the item.
 */
function strength(element: Element, item: Element) {
  const style = getComputedStyle(element);
  const fill = rgba(style.backgroundColor).a;
  return (fill > 0 ? fill : rgba(style.color).a) * shownOpacity(element, item);
}

/**
 * A disabled item dims every part of its content to the same strength: its
 * own text and each child (a status dot, a label, a detail, a shortcut) shows
 * at half the strength of the same part in an enabled item of the same shape.
 * The item itself keeps full opacity, so its focus ring does not dim.
 */
export async function checkDisabledContentDims(disabled: HTMLElement, enabled: HTMLElement) {
  await expect(disabled).toHaveAttribute('data-disabled');
  await expect(getComputedStyle(disabled).opacity).toBe('1');
  const parts = (item: HTMLElement) => [...item.children].filter((child) => child.tagName !== 'svg');
  const [off, on] = [parts(disabled), parts(enabled)];
  await expect(off.length).toBe(on.length);
  await expect(rgba(getComputedStyle(disabled).color).a / rgba(getComputedStyle(enabled).color).a).toBeCloseTo(0.5, 1);
  for (const [index, part] of off.entries()) {
    const ratio = strength(part, disabled) / strength(on[index] as Element, enabled);
    await expect(ratio, `part ${index + 1} (${part.textContent || part.className}) shows at ${ratio}`).toBeCloseTo(0.5, 1);
  }
}
