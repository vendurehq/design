import * as React from 'react';

/**
 * The width and height of the active label in a label swap (TooltipLabelSwap,
 * ButtonLabelSwap). Put `refs.current[index]` on each label and set `width`
 * (and `height`, when a label can wrap) on the swap, so it eases to the
 * active label's size. `offsetWidth` ignores a scale on an ancestor (a
 * tooltip's entrance, a pressed card), which `getBoundingClientRect` would
 * include.
 */
export function useActiveLabelWidth(active: number, labels: readonly React.ReactNode[]) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = React.useState<{ width: number; height: number }>();
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new label list can change the active label's size.
  React.useLayoutEffect(() => {
    const label = refs.current[active];
    if (label) setSize({ width: label.offsetWidth, height: label.offsetHeight });
  }, [active, labels]);
  return { refs, width: size?.width, height: size?.height };
}
