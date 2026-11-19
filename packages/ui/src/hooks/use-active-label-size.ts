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
 * With `natural`, the width is the label's full text width, rounded up,
 * also while the label is cut with an ellipsis: the swap keeps that width and
 * its container shrinks it, so the cut never feeds back into the size.
 */
export function useActiveLabelSize(
  active: number,
  { natural = false, key }: { natural?: boolean; key?: string } = {},
) {
  const refs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = React.useState<{ width: number; height: number }>();
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` only re-runs the measure when the active label's text changes.
  React.useLayoutEffect(() => {
    const label = refs.current[active];
    if (!label) return;
    const measure = () => {
      const width = natural ? naturalWidth(label) : label.offsetWidth;
      const height = label.offsetHeight;
      setSize((last) =>
        last?.width === width && last.height === height ? last : { width, height },
      );
    };
    measure();
    // A cut label's box does not grow when a web font arrives, so the
    // ResizeObserver misses it: measure again when fonts load.
    const fonts = natural && typeof document !== 'undefined' ? document.fonts : undefined;
    fonts?.addEventListener('loadingdone', measure);
    void fonts?.ready.then(measure);
    if (typeof ResizeObserver === 'undefined') {
      return () => fonts?.removeEventListener('loadingdone', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(label);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener('loadingdone', measure);
    };
  }, [active, natural, key]);
  return { refs, width: size?.width, height: size?.height };
}

/**
 * The full width of a label's text, also while it is cut, rounded up to a
 * whole pixel: `scrollWidth` rounds down, and a text 0.4px wider than its
 * box shows an ellipsis. A scale on an ancestor is taken out.
 */
function naturalWidth(label: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(label);
  // The scale from the unrounded layout width: offsetWidth rounds, and a
  // scale read from it moves the result by a pixel on every measure.
  const box = label.getBoundingClientRect().width;
  const layout = Number.parseFloat(getComputedStyle(label).width);
  const scale = layout > 0 && box > 0 ? box / layout : 1;
  return Math.max(label.offsetWidth, Math.ceil(range.getBoundingClientRect().width / scale - 0.01));
}
