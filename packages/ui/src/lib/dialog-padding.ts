import type * as React from 'react';

/**
 * The value of the last unconditional `p-*` or `px-*` class in `className`,
 * as CSS: `p-0` → `0px`, `p-4` → `calc(var(--spacing) * 4)`, `p-px` → `1px`,
 * `p-[24px]` → `24px`, `p-(--gap)` → `var(--gap)`. `undefined` when there is
 * none. Classes with a variant (`sm:p-0`) are skipped: an inline style
 * cannot follow a breakpoint.
 */
export function paddingFromClassName(className: unknown): string | undefined {
  if (typeof className !== 'string') return undefined;
  let value: string | undefined;
  for (const token of className.split(/\s+/)) {
    const match = /^!?px?-(.+?)!?$/.exec(token);
    if (!match || token.includes(':')) continue;
    const raw = match[1] as string;
    if (raw === 'px') value = '1px';
    else if (/^\d+(\.\d+)?$/.test(raw))
      value = raw === '0' ? '0px' : `calc(var(--spacing) * ${raw})`;
    else if (raw.startsWith('[') && raw.endsWith(']'))
      value = raw.slice(1, -1).replace(/_/g, ' ');
    else if (raw.startsWith('(--') && raw.endsWith(')')) value = `var(${raw.slice(1, -1)})`;
  }
  return value;
}

type StyleProp<State> =
  | React.CSSProperties
  | ((state: State) => React.CSSProperties | undefined)
  | undefined;

/**
 * Sets `--dialog-padding` from a `p-*` or `px-*` class on the dialog, so the
 * pinned header and footer, which reach over the padding with negative
 * margins, stay flush with the dialog's edge. Code written for 2.x sets the
 * dialog's padding with a class (`p-0` around a full-bleed picker); without
 * this, its header and footer would stick out by the default 20px. A
 * `[--dialog-padding:…]` class still works: with no `p-*` class, nothing is set.
 */
export function dialogPaddingStyle<State>(
  className: unknown,
  style: StyleProp<State>,
): StyleProp<State> {
  const padding = paddingFromClassName(className);
  if (padding === undefined) return style;
  const variable = { '--dialog-padding': padding } as React.CSSProperties;
  if (typeof style === 'function') return (state: State) => ({ ...variable, ...style(state) });
  return { ...variable, ...style };
}
