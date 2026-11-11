import * as React from 'react';

type PopupAlign = 'start' | 'center' | 'end';
type PopupSide = 'top' | 'right' | 'bottom' | 'left' | 'inline-end' | 'inline-start';

/**
 * The align that opens a popup toward the centre of the viewport: its edge
 * lines up with the trigger's right edge for a trigger in the right half, and
 * with its left edge in the left half. `start` and `end` are logical, and the
 * positioner reads them in the popup's direction, so in a right-to-left page
 * the two swap.
 */
function alignTowardCentre(trigger: Element, popup: Element): PopupAlign {
  const box = trigger.getBoundingClientRect();
  const inRightHalf = box.left + box.width / 2 > window.innerWidth / 2;
  const rtl = getComputedStyle(popup).direction === 'rtl';
  return inRightHalf !== rtl ? 'end' : 'start';
}

/**
 * The trigger that opened this popup. Base UI's menu and popover triggers
 * both point at their popup with `aria-controls`, and the open one carries
 * `data-popup-open`.
 */
function findTrigger(popup: HTMLElement): Element | null {
  if (!popup.id) return null;
  const controls = `[aria-controls="${CSS.escape(popup.id)}"]`;
  return document.querySelector(`${controls}[data-popup-open]`) ?? document.querySelector(controls);
}

/**
 * The `align` for a popup that opens below or above its trigger. An explicit
 * `align` always wins. Without one, the popup opens toward the centre of the
 * viewport: a trigger in the right half lines the popup up with its right
 * edge, so the popup grows to the left and stays on screen, and a trigger in
 * the left half lines it up with its left edge. The side is picked each time
 * the popup opens. A popup that opens to the left or right of its trigger
 * keeps "start".
 *
 * Pass `popupRef` as the popup's `ref`. It runs when the popup mounts, before
 * the first paint, so the popup never shows on the wrong side first.
 */
export function usePopupAlign<T extends HTMLElement>(
  align: PopupAlign | undefined,
  side: PopupSide,
  ref: React.Ref<T> | undefined,
) {
  // Toward the centre is horizontal: a popup that opens to a side keeps "start".
  const opensBelowOrAbove = side === 'bottom' || side === 'top';
  const [autoAlign, setAutoAlign] = React.useState<PopupAlign>('start');
  const popupRef = React.useCallback(
    (popup: T | null) => {
      if (typeof ref === 'function') ref(popup);
      else if (ref) (ref as React.RefObject<T | null>).current = popup;
      const trigger = !align && opensBelowOrAbove && popup && findTrigger(popup);
      if (trigger) setAutoAlign(alignTowardCentre(trigger, popup));
    },
    [ref, align, opensBelowOrAbove],
  );
  return { popupRef, align: align ?? (opensBelowOrAbove ? autoAlign : 'start') };
}
