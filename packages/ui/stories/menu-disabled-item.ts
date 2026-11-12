import { expect, userEvent, waitFor } from 'storybook/test';

/**
 * Opens a menu with "Send invite", a disabled "Add member" and "Settings",
 * then checks that the disabled item takes no fill under the pointer or the
 * arrow keys. `open` replaces the default click on `trigger`.
 */
export async function checkDisabledItemHasNoFill(trigger: HTMLElement, open?: () => Promise<unknown>) {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  if (open) await open();
  else await userEvent.click(trigger);
  const item = (name: string) => {
    const element = [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find(
      (candidate) => candidate.textContent?.trim() === name,
    );
    expect(element).toBeDefined();
    return element as HTMLElement;
  };
  const fill = (element: HTMLElement) => getComputedStyle(element).backgroundColor;
  await waitFor(() => expect(item('Add member')).toBeVisible());
  // An item at rest has no fill: that is the look a disabled item keeps.
  const none = fill(item('Settings'));
  const disabled = item('Add member');
  expect(disabled).toHaveAttribute('data-disabled');

  // Pointer: an enabled item fills, the disabled one does not.
  await user.hover(item('Send invite'));
  await waitFor(() => expect(fill(item('Send invite'))).not.toBe(none));
  await user.hover(disabled);
  expect(fill(disabled)).toBe(none);

  // Keyboard: the arrow keys stop on the disabled item without the fill.
  item('Send invite').focus();
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(document.activeElement).toBe(disabled));
  expect(fill(disabled)).toBe(none);
  await user.keyboard('{ArrowDown}');
  await waitFor(() => expect(document.activeElement).toBe(item('Settings')));
  await waitFor(() => expect(fill(item('Settings'))).not.toBe(none));
  await user.keyboard('{Escape}');
}
