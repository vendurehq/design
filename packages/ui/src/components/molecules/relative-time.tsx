'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { type ComponentProps, type ReactNode, useEffect, useState } from 'react';

const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

interface FormatRelativeOptions {
  locale?: string;
  numeric?: 'auto' | 'always';
  unitStyle?: Intl.RelativeTimeFormatOptions['style'];
}

// Pure helper for non-React sites (table titles, CSV export, `<time title>`).
// Picks the largest unit the delta clears, then defers wording to Intl —
// signed input yields "in 3 days" / "2 hours ago" without a manual past/future
// branch.
function formatRelative(
  value: string | number | Date,
  { locale, numeric = 'auto', unitStyle = 'long' }: FormatRelativeOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric, style: unitStyle });
  for (const { unit, ms } of UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(0, 'second');
}

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

  useEffect(() => {
    if (updateInterval === false) return;
    const id = setInterval(() => tick((n) => n + 1), updateInterval);
    return () => clearInterval(id);
  }, [updateInterval]);

  const date = toDate(value);
  if (!date) return <>{fallback}</>;

  const resolvedLocale = locale ?? settings.locale;

  // Time-dependent output differs between the server render and the first client
  // render, so hydration would warn on the boundary case. `suppressHydrationWarning`
  // is the documented fix; the effect above re-formats immediately after mount.
  return (
    <time
      dateTime={date.toISOString()}
      title={date.toLocaleString(resolvedLocale, { timeZone: settings.timeZone })}
      suppressHydrationWarning
      {...props}
    >
      {formatRelative(date, { locale: resolvedLocale, numeric, unitStyle })}
    </time>
  );
}

export { RelativeTime, formatRelative, type RelativeTimeProps, type FormatRelativeOptions };
