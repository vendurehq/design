import * as React from 'react';

/**
 * The width and height of the active label in a label swap. Put
 * `refs.current[index]` on each label and set `width` and `height` on the
 * swap, so it eases to the active label's size. A ResizeObserver keeps the
 * size current while the label is active: a web font that loads after the
 * first paint, or a label whose text changes, resizes the swap too.
 * `offsetWidth` ignores a scale on an ancestor (a tooltip's entrance, a
 * pressed card), which `getBoundingClientRect` would include.
 *
 * With `natural`, the width is the label's full text width (`scrollWidth`),
 * also while the label is cut with an ellipsis: the swap keeps that width and
 * its container shrinks it, so the cut never feeds back into the size.
 */
export function useActiveLabelSize(active: number, { natural = false } = {}) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = React.useState<{ width: number; height: number }>();
  React.useLayoutEffect(() => {
    const label = refs.current[active];
    if (!label) return;
    const measure = () => {
      const width = natural ? Math.max(label.offsetWidth, label.scrollWidth) : label.offsetWidth;
      const height = label.offsetHeight;
      setSize((last) =>
        last?.width === width && last.height === height ? last : { width, height },
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(label);
    return () => observer.disconnect();
  }, [active, natural]);
  return { refs, width: size?.width, height: size?.height };
}
