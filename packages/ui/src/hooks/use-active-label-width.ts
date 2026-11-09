import * as React from 'react';

/**
 * The width of the active label in a label swap (TooltipLabelSwap,
 * ButtonLabelSwap). Put `refs.current[index]` on each label and set `width`
 * on the swap, so it eases to the active label's width. `offsetWidth`
 * ignores a scale on an ancestor (a tooltip's entrance, a pressed card),
 * which `getBoundingClientRect` would include.
 */
export function useActiveLabelWidth(active: number, labels: readonly React.ReactNode[]) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [width, setWidth] = React.useState<number>();
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new label list can change the active label's width.
  React.useLayoutEffect(() => {
    const label = refs.current[active];
    if (label) setWidth(label.offsetWidth);
  }, [active, labels]);
  return { refs, width };
}
