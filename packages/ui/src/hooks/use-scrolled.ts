import * as React from 'react';

/**
 * A ref for a scroll container. It sets `data-scrolled` on the element while
 * its content is scrolled away from the top, and removes it at the top. A
 * sticky header inside takes the rule with `in-data-scrolled:shadow-scrolled`.
 *
 * `ref` is the consumer's own ref on the element; the returned ref sets it too.
 */
export function useScrolled<T extends HTMLElement>(ref?: React.Ref<T>) {
  return React.useCallback(
    (node: T | null): (() => void) | undefined => {
      if (!node) return undefined;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      const update = () => node.toggleAttribute('data-scrolled', node.scrollTop > 0);
      update();
      node.addEventListener('scroll', update, { passive: true });
      return () => {
        node.removeEventListener('scroll', update);
        if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );
}
