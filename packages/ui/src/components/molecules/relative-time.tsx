'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { type FormatRelativeOptions, formatRelative } from '@vendure-io/ui/lib/format-relative';
import { cn } from '@vendure-io/ui/lib/utils';
import { type ComponentProps, type ReactNode, useEffect, useId, useState } from 'react';

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

interface RelativeTimeProps extends Omit<ComponentProps<'time'>, 'dateTime'> {
  value: string | number | Date | null | undefined;
  locale?: string;
  numeric?: 'auto' | 'always';
  unitStyle?: Intl.RelativeTimeFormatOptions['style'];
  /**
   * Self-refresh cadence in ms so a long-open view ages "just now" → "2 minutes
   * ago". Default `60_000`. Pass `false` to disable the timer when the caller
   * already re-renders (e.g. a polling query drives it).
   */
  updateInterval?: number | false;
  /** Rendered for nullish/invalid input. Default `'—'`. */
  fallback?: ReactNode;
  /**
   * Show the absolute time in a DS Tooltip on hover. Default `true`. Pass
   * `false` where the time sits inside another tooltip trigger, so the outer
   * tooltip keeps its content. The absolute time stays the accessible
   * description either way.
   */
  tooltip?: boolean;
  /**
   * Make the time a tab stop so keyboard users can open the tooltip. Default
   * `false`. Opt in where the exact time matters to keyboard users, and never
   * inside interactive content such as a link or a button. Needs `tooltip`.
   */
  focusable?: boolean;
}

/**
 * SSR note: output is time- and locale-dependent, so the server render and the
 * first client render can disagree. The `<time>` carries
 * `suppressHydrationWarning` and re-formats once right after mount; SSR
 * consumers should still pin `locale`/`timeZone` via `FormatProvider` (or
 * props) so the absolute description matches too.
 *
 * The absolute time is never a native `title`. It is the accessible
 * description (a hidden child linked by `aria-describedby`), and it shows in
 * the DS Tooltip on hover unless `tooltip={false}`.
 */
function RelativeTime({
  value,
  locale,
  numeric,
  unitStyle,
  updateInterval = 60_000,
  fallback = '—',
  tooltip = true,
  focusable = false,
  ...props
}: RelativeTimeProps) {
  const descriptionId = useId();
  const settings = useFormatSettings();
  // A bare counter to force a re-format on each tick; the value itself is unused.
  const [, tick] = useState(0);

  const date = toDate(value);
  const hasDate = date !== null;

  useEffect(() => {
    if (!hasDate) return;
    // SSR'd text can already be stale by the time hydration runs, so re-format
    // once immediately — this also covers `updateInterval={false}`, which
    // otherwise never refreshes on its own.
    tick((n) => n + 1);
    if (updateInterval === false) return;
    const id = setInterval(() => tick((n) => n + 1), updateInterval);
    return () => clearInterval(id);
  }, [updateInterval, hasDate]);

  if (!date) return <>{fallback}</>;

  const resolvedLocale = locale ?? settings.locale;
  const absolute = date.toLocaleString(resolvedLocale, { timeZone: settings.timeZone });
  const relative = formatRelative(date, { locale: resolvedLocale, numeric, unitStyle });
  const describedBy = [props['aria-describedby'], descriptionId].filter(Boolean).join(' ');
  // The description is a `hidden` child, so the component renders one element.
  // `hidden` keeps the text out of view and out of the reading flow;
  // aria-describedby still resolves it.
  const content = (
    <>
      {relative}
      <span id={descriptionId} hidden suppressHydrationWarning>
        {absolute}
      </span>
    </>
  );
  const timeProps = {
    'data-slot': 'relative-time',
    dateTime: date.toISOString(),
    suppressHydrationWarning: true,
    ...props,
    'aria-describedby': describedBy,
  };

  if (!tooltip) return <time {...timeProps}>{content}</time>;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <time
            // Opt-in tab stop so keyboard users can open the tooltip (WCAG 2.1.1).
            tabIndex={focusable ? 0 : undefined}
            {...timeProps}
            className={cn(
              focusable &&
                'focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-3',
              props.className,
            )}
          />
        }
      >
        {content}
      </TooltipTrigger>
      <TooltipContent>{absolute}</TooltipContent>
    </Tooltip>
  );
}

// Re-exported so the spike's import surface (molecules/relative-time) keeps
// working; the implementation lives in lib/ per the JSX-or-lib rule.
export { RelativeTime, formatRelative, type RelativeTimeProps, type FormatRelativeOptions };
