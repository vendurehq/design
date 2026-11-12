import { isValidElement } from 'react';

/**
 * The slot attributes of a trigger that can take `render`. The trigger always
 * carries `data-<slot>` (for example `data-tooltip-trigger`), so it stays
 * findable. It sets `data-slot` only when it renders a plain element: no
 * `render`, a render function, or an HTML element such as `<span>`. A component
 * passed as `render`, such as a Button or a StatusBadge, keeps its own slot.
 * Without this, the trigger's `data-slot` replaces the slot the component sets
 * inside itself, because Base UI passes the trigger's props into the component.
 * A `data-slot` written on the render element itself always wins.
 */
export function triggerSlot(slot: string, render: unknown): Record<string, string> {
  const component = isValidElement(render) && typeof render.type !== 'string';
  return component ? { [`data-${slot}`]: '' } : { 'data-slot': slot, [`data-${slot}`]: '' };
}
