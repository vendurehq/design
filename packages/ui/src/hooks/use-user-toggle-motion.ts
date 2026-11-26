import * as React from 'react';

type UserToggleMotion = {
  /** The `checked` value seen on the last render. */
  checked: boolean;
  /** The user changed the value since the last `checked` change. */
  userToggled: boolean;
  /** The last `checked` change came from the user. */
  animate: boolean;
};

/**
 * Settles one render. A `checked` value that changed after the user toggled
 * the control moves with motion. A change with no user toggle before it (data
 * that loads, a form reset, another control) does not. Until the first change
 * there is nothing to move from, so `animate` stays false.
 */
export function settleUserToggleMotion(
  state: UserToggleMotion,
  checked: boolean,
): UserToggleMotion {
  if (state.checked === checked) return state;
  return { checked, userToggled: false, animate: state.userToggled };
}

/**
 * Tells a Switch whether a `checked` change should move. Only a change the
 * user makes (pointer or keyboard) does. A controlled value that the page sets
 * from code is shown at once.
 *
 * Call `markUserToggled` from `onCheckedChange`: it runs before the page sets
 * the new `checked`, so the next render sees the toggle first. An uncontrolled
 * control (`checked` is undefined) only changes by the user, so it always moves.
 */
export function useUserToggleMotion(checked: boolean | undefined) {
  const controlled = checked !== undefined;
  const state = React.useRef<UserToggleMotion>({
    checked: checked ?? false,
    userToggled: false,
    animate: false,
  });
  state.current = settleUserToggleMotion(state.current, checked ?? false);
  const markUserToggled = React.useCallback(() => {
    state.current = { ...state.current, userToggled: true };
  }, []);
  return {
    animate: !controlled || state.current.animate,
    markUserToggled,
  };
}
