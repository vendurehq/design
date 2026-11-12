import * as React from 'react';

/**
 * A ref for a pinned (sticky) header or footer. It writes the element's height
 * to `property` on its scroll container, the closest `[data-slot=<scroller>]`
 * ancestor, and keeps it current with a ResizeObserver: a title that wraps to a
 * second line, or a footer whose buttons wrap, updates it. The container turns
 * the heights into `scroll-padding`, so a field that gets focus (by Tab, a
 * script or form validation) scrolls clear of the header and the footer.
 * `offsetHeight` ignores the entrance scale on the popup.
 *
 * `ref` is the consumer's own ref on the element; the returned ref sets it too.
 */
export function usePinnedHeight<T extends HTMLElement>(
  property: string,
  scroller: string,
  ref: React.Ref<T> | undefined,
) {
  return React.useCallback(
    (node: T | null): (() => void) | undefined => {
      const own = setRef(ref, node);
      const container = node?.closest<HTMLElement>(`[data-slot="${scroller}"]`);
      if (!node || !container) return own;
      const measure = () => container.style.setProperty(property, `${node.offsetHeight}px`);
      measure();
      const observer =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      observer?.observe(node);
      // React 19 calls the returned cleanup instead of the ref with null.
      return () => {
        observer?.disconnect();
        container.style.removeProperty(property);
        own?.();
      };
    },
    [property, scroller, ref],
  );
}

// Sets a consumer ref and returns how to clear it: a function ref's own
// cleanup (React 19), or a call with null.
function setRef<T>(ref: React.Ref<T> | undefined, node: T | null): (() => void) | undefined {
  if (!ref || !node) return undefined;
  if (typeof ref === 'function') {
    const cleanup = ref(node);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      else ref(null);
    };
  }
  ref.current = node;
  return () => {
    ref.current = null;
  };
}
