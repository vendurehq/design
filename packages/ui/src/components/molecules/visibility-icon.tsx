'use client';

import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

// lucide's Eye, so the icon lines up with lucide icons at the same size and
// stroke, and lucide's EyeOff strike line.
const EYE_OUTLINE =
  'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0';
const STRIKE = 'M2 2l20 20';

// The line is drawn, not swapped: a path with pathLength 1 and a dash of 1
// followed by a gap of 2. An offset of 1 puts the whole path in the gap
// (no round cap peeks out at either end); an offset of 0 shows the whole
// dash. Between the two the line grows from the top-left corner.
// A mask cuts the eye along the line, like lucide's EyeOff: the same dash in
// black, 5 units wide, so 1.5 units of clearance show on each side of the
// 2-unit line. Its round cap runs a little ahead of the line's tip, so the
// eye opens just before the line reaches it.
// Both ways take `normal` on the in-out curve: the icon stays on screen and
// changes shape. A strong ease-out left the retracting line's round cap as a
// dot in the corner for most of the time.
// Transitions only, so a fast toggle reverses from wherever it is. A CSS
// transition never runs on the first render, so the icon mounts in its
// state without motion. Reduced motion changes at once.
const dash =
  '[stroke-dasharray:1_2] [transition:stroke-dashoffset_var(--transition-duration-normal)_var(--ease-in-out)] motion-reduce:transition-none';

export interface VisibilityIconProps extends Omit<React.ComponentProps<'svg'>, 'children'> {
  /**
   * `true` (default) draws the open eye. `false` draws the line through it.
   * A change draws the line in or out.
   */
  visible?: boolean;
}

/**
 * An eye that shows a visible or hidden state, for show/hide toggles. When
 * `visible` turns false a line draws across the eye and cuts it; when it turns
 * true the line draws back out. It sizes and colours like a lucide icon
 * (24×24 viewBox, `currentColor`, the parent's `[&_svg]` size rules). It is
 * decorative: the control that holds it carries the label.
 */
function VisibilityIcon({ visible = true, className, ...props }: VisibilityIconProps) {
  // The mask id must be unique per icon and safe inside `url(#…)`.
  const maskId = `visibility-icon-${React.useId().replace(/[^\w-]/g, '')}`;
  const offset = visible ? '[stroke-dashoffset:1]' : '[stroke-dashoffset:0]';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-slot="visibility-icon"
      data-visibility={visible ? 'visible' : 'hidden'}
      // A consumer that dims the hidden state with an opacity class gets the
      // same timing as the line.
      className={cn(
        '[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)] motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="white" stroke="none" />
        <path
          d={STRIKE}
          pathLength={1}
          stroke="black"
          strokeWidth="5"
          className={cn(dash, offset)}
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d={EYE_OUTLINE} />
        <circle cx="12" cy="12" r="3" />
      </g>
      <path d={STRIKE} pathLength={1} className={cn(dash, offset)} />
    </svg>
  );
}

export { VisibilityIcon };
