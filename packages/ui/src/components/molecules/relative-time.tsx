'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import {
  type FormatRelativeOptions,
  formatRelative,
  formatRelativeDuration,
} from '@vendure-io/ui/lib/format-relative';
import { cn } from '@vendure-io/ui/lib/utils';
import { type ComponentProps, type ReactNode, useEffect, useId, useState } from 'react';
// Relative: `time-tooltip` is internal.
import { TimeSpan, TimeTooltip, toTime, useReadersClock } from './time-tooltip.tsx';

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
  /**
   * Rendered for nullish/invalid input, and on the server and the first client
   * render of a server-rendered page (the server has no reader's clock).
   * Default `'—'`.
   */
  fallback?: ReactNode;
  /**
   * What the text says.
   * - `relative` (default): how long ago or how far ahead: `2 minutes ago`.
   * - `duration`: how long a state that continues has lasted: `13 days`. The
   *   same unit steps as `relative` (seconds, minutes, hours, days, months,
   *   years), in the reader's locale. The caller adds the words around it
   *   (`for 13 days`), so they are translated with the rest of the page.
   */
  display?: 'relative' | 'duration';
  /**
   * When the thing that ended at `value` started. The default tooltip then
   * shows the range from `start` to `value` and how long it took:
   * `11/11/2026, 10:14:47 – 10:15:29 AM` over `42s`.
   */
  start?: string | number | Date | null;
  /**
   * The tooltip on hover and focus. Default `true`: the absolute time (or the
   * range, with `start`). Pass content to show that instead, or `false` where
   * the time sits inside another tooltip trigger, so the outer tooltip keeps
   * its content. The tooltip content stays the accessible description either
   * way.
   */
  tooltip?: boolean | ReactNode;
  /**
   * Make the time a tab stop so keyboard users can open the tooltip. Default
   * `false`, and `true` under a status label (a StatusBadge `detail`). Opt in
   * where the exact time matters to keyboard users, and never inside
   * interactive content such as a link or a button. Needs `tooltip`.
   */
  focusable?: boolean;
}

/**
 * SSR: the text depends on the reader's clock, locale and time zone, so the
 * server renders `fallback` and an empty description, and so does the first
 * client render during hydration: the two match. The text shows right after.
 * In an app that renders only in the browser it shows from the first paint.
 *
 * The absolute time is never a native `title`. It is the accessible
 * description (a hidden child linked by `aria-describedby`), and it shows in
 * the DS Tooltip on hover unless `tooltip={false}`.
 *
 * Under a status label (a StatusBadge `detail`) the time is a tab stop, and
 * its tooltip opens beside the whole status block, so the label stays
 * readable.
 */
function RelativeTime({
  value,
  locale,
  numeric,
  unitStyle,
  updateInterval = 60_000,
  fallback = '—',
  display = 'relative',
  start,
  tooltip = true,
  focusable,
  ...props
}: RelativeTimeProps) {
  const descriptionId = useId();
  const settings = useFormatSettings();
  // A bare counter to force a re-format on each tick; the value itself is unused.
  const [, tick] = useState(0);

  const readersClock = useReadersClock();
  const time = toTime(value);
  const date = time === null ? null : new Date(time);
  const hasDate = date !== null;

  useEffect(() => {
    if (!hasDate || updateInterval === false) return;
    const id = setInterval(() => tick((n) => n + 1), updateInterval);
    return () => clearInterval(id);
  }, [updateInterval, hasDate]);

  if (!date) return <>{fallback}</>;

  const resolvedLocale = locale ?? settings.locale;
  const startTime = toTime(start);
  const absolute =
    startTime === null ? (
      date.toLocaleString(resolvedLocale, { timeZone: settings.timeZone })
    ) : (
      <TimeSpan
        start={startTime}
        end={date.getTime()}
        locale={resolvedLocale}
        timeZone={settings.timeZone}
      />
    );
  const custom = typeof tooltip !== 'boolean' && tooltip !== null && tooltip !== undefined;
  const description = custom ? tooltip : absolute;
  const text = !readersClock
    ? fallback
    : display === 'duration'
      ? formatRelativeDuration(date, { locale: resolvedLocale, unitStyle })
      : formatRelative(date, { locale: resolvedLocale, numeric, unitStyle });
  const describedBy = [props['aria-describedby'], descriptionId].filter(Boolean).join(' ');
  // The description is a `hidden` child, so the component renders one element.
  // `hidden` keeps the text out of view and out of the reading flow;
  // aria-describedby still resolves it.
  const content = (
    <>
      {text}
      <span id={descriptionId} hidden>
        {readersClock ? description : null}
      </span>
    </>
  );
  const timeProps = {
    'data-slot': 'relative-time',
    dateTime: date.toISOString(),
    ...props,
    className: cn('tabular-nums', props.className),
    'aria-describedby': describedBy,
  };

  if (tooltip === false || tooltip === null) return <time {...timeProps}>{content}</time>;

  return (
    <TimeTooltip content={description} focusable={focusable} render={<time {...timeProps} />}>
      {content}
    </TimeTooltip>
  );
}

// Re-exported so the spike's import surface (molecules/relative-time) keeps
// working; the implementation lives in lib/ per the JSX-or-lib rule.
export {
  RelativeTime,
  formatRelative,
  formatRelativeDuration,
  type RelativeTimeProps,
  type FormatRelativeOptions,
};
