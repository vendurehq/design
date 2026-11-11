'use client';

import { createContext, type ReactElement, type ReactNode, useContext, useRef } from 'react';
import { formatElapsed } from '../../lib/format-elapsed.ts';
import { cn } from '../../lib/utils.ts';
// Relative: this module is internal (mapped to null in the package exports).
import { Tooltip, TooltipContent, TooltipTrigger } from '../atoms/tooltip.tsx';

/**
 * True inside the second line of a StatusBadge (`detail`). A time there is a
 * tab stop by default, and its tooltip opens beside the whole status block.
 */
const InStatusDetail = createContext(false);

const focusRing =
  'rounded-sm outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

/**
 * The tooltip of a RelativeTime or an ElapsedTime. The trigger is the `<time>`
 * itself, so the focus ring stays on the time.
 *
 * Under a status label (a StatusBadge `detail`), the tooltip is anchored to the
 * whole status block and opens at its inline end, centred on it. A row is 46px
 * high and a two-line tooltip 48px, so it covers only the cells after the
 * status in the same row: the label and the time stay readable, and so do the
 * rows above and below. Without room at the end it flips to the start.
 * Anywhere else it opens above the time, as every tooltip does.
 */
function TimeTooltip({
  content,
  focusable,
  render,
  children,
}: {
  content: ReactNode;
  /** A tab stop, so keyboard users can open it. Default: only in a status detail. */
  focusable: boolean | undefined;
  render: ReactElement<{ className?: string }>;
  children: ReactNode;
}) {
  const inDetail = useContext(InStatusDetail);
  // The trigger renders a `<time>`; the ref type is the Trigger's default button.
  const trigger = useRef<HTMLButtonElement>(null);
  const tabStop = focusable ?? inDetail;
  // Above or below, a tooltip covers the status of the next row; at the end it
  // covers only the cells after the status in its own row.
  const statusBlock = () =>
    trigger.current?.closest<HTMLElement>('[data-slot=status-badge]') ?? trigger.current;

  return (
    <Tooltip>
      <TooltipTrigger
        ref={trigger}
        // Opt-in tab stop so keyboard users can open the tooltip (WCAG 2.1.1).
        tabIndex={tabStop ? 0 : undefined}
        render={render}
        className={cn(tabStop && focusRing, render.props.className)}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        className="tabular-nums"
        side={inDetail ? 'inline-end' : 'top'}
        anchor={inDetail ? statusBlock : undefined}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function toTime(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isNaN(time) ? null : time;
}

// The fields of `toLocaleString()`, so a range reads like a single time.
const dateTimeFields: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};

/**
 * Two lines for something that ran from `start` to `end`: the range in the
 * reader's locale (`11/11/2026, 10:14:47 – 10:15:29 AM`, the date once when
 * both are on one day), then how long it took (`42s`). No words, so nothing
 * needs translating.
 */
function TimeSpan({
  start,
  end,
  locale,
  timeZone,
}: {
  start: number;
  end: number;
  locale: string | undefined;
  timeZone: string | undefined;
}) {
  const format = new Intl.DateTimeFormat(locale, { ...dateTimeFields, timeZone });
  return (
    <>
      <span className="block">{format.formatRange(Math.min(start, end), end)}</span>
      <span className="block">{formatElapsed(end - start)}</span>
    </>
  );
}

export { InStatusDetail, TimeSpan, TimeTooltip, toTime };
