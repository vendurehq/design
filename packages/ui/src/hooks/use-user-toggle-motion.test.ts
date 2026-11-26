import { describe, expect, test } from 'bun:test';

import { settleUserToggleMotion } from './use-user-toggle-motion.ts';

const start = { checked: false, userToggled: false, animate: false };

describe('settleUserToggleMotion', () => {
  test('first render: nothing to move from', () => {
    expect(settleUserToggleMotion(start, false).animate).toBe(false);
  });

  // Data loads after render, a form reset, another control.
  test('a checked change from code does not animate', () => {
    expect(settleUserToggleMotion(start, true).animate).toBe(false);
  });

  // A click and a Space press both reach `onCheckedChange` first, which marks
  // the toggle before the page sets the new `checked`.
  test('a checked change after a user toggle animates', () => {
    const toggled = { ...start, userToggled: true };
    expect(settleUserToggleMotion(toggled, true)).toEqual({
      checked: true,
      userToggled: false,
      animate: true,
    });
  });

  test('a rerender with the same value keeps the last answer', () => {
    const animated = settleUserToggleMotion({ ...start, userToggled: true }, true);
    expect(settleUserToggleMotion(animated, true)).toBe(animated);
  });

  test('a code change after a user toggle goes back to no motion', () => {
    const animated = settleUserToggleMotion({ ...start, userToggled: true }, true);
    expect(settleUserToggleMotion(animated, false).animate).toBe(false);
  });

  test('a toggle is used once', () => {
    const afterUser = settleUserToggleMotion({ ...start, userToggled: true }, true);
    expect(afterUser.userToggled).toBe(false);
  });
});
