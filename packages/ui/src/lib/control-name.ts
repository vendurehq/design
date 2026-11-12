import * as React from 'react';

type NameProps = { 'aria-label'?: string; 'aria-labelledby'?: string };

/**
 * The name a popup takes from the control that opens it: the control's
 * `aria-labelledby` (Base UI points it at a Field label), its `aria-label`, or
 * the text of a `<label for>`. With `orSelf`, a control with none of these
 * names the popup by its own content (a trigger that shows its value).
 */
function nameFrom(control: HTMLElement | null, { orSelf = false } = {}): NameProps {
  if (!control) return {};
  const labelledBy = control.getAttribute('aria-labelledby');
  if (labelledBy) return { 'aria-labelledby': labelledBy };
  const label = control.getAttribute('aria-label');
  if (label) return { 'aria-label': label };
  const labels = (control as HTMLInputElement).labels;
  const text =
    labels &&
    Array.from(labels, (element) => element.textContent?.trim())
      .filter(Boolean)
      .join(' ');
  if (text) return { 'aria-label': text };
  return orSelf && control.id ? { 'aria-labelledby': control.id } : {};
}

/** True when the props already name the element. */
function hasName(props: NameProps) {
  return Boolean(props['aria-label'] || props['aria-labelledby']);
}

/**
 * A ref callback that hands the element to `register` and to the caller's own
 * `ref`, and takes it back from both on unmount.
 */
function useRegisteredRef<T extends HTMLElement>(
  ref: React.Ref<T> | undefined,
  register: ((element: T | null) => void) | undefined,
) {
  return React.useCallback(
    (node: T | null) => {
      register?.(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      return () => {
        register?.(null);
        if (typeof ref === 'function') ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref, register],
  );
}

export { hasName, nameFrom, useRegisteredRef };
