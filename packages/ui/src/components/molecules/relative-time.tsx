'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { type FormatRelativeOptions, formatRelative } from '@vendure-io/ui/lib/format-relative';
import { type ComponentProps, type ReactNode, useEffect, useState } from 'react';

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
}

/**
 * SSR note: output is time- and locale-dependent, so the server render and the
 * first client render can disagree. The `<time>` carries
 * `suppressHydrationWarning` and re-formats once right after mount; SSR
 * consumers should still pin `locale`/`timeZone` via `FormatProvider` (or
 * props) so the absolute `title` matches too.
 */
function RelativeTime({
  value,
  locale,
  numeric,
  unitStyle,
  updateInterval = 60_000,
  fallback = '—',
  ...props
}: RelativeTimeProps) {
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

  return (
    <time
      data-slot="relative-time"
      dateTime={date.toISOString()}
      title={date.toLocaleString(resolvedLocale, { timeZone: settings.timeZone })}
      suppressHydrationWarning
      {...props}
    >
      {formatRelative(date, { locale: resolvedLocale, numeric, unitStyle })}
    </time>
  );
}

// Re-exported so the spike's import surface (molecules/relative-time) keeps
// working; the implementation lives in lib/ per the JSX-or-lib rule.
export { RelativeTime, formatRelative, type RelativeTimeProps, type FormatRelativeOptions };
