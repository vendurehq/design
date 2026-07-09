'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import type { ComponentProps, ReactNode } from 'react';

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

interface DateTimeProps extends Omit<ComponentProps<'time'>, 'dateTime'> {
  value: string | number | Date | null | undefined;
  locale?: string;
  /** `Intl` date preset. Default `'medium'`. */
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  /** `Intl` time preset. Omit for a date-only rendering. */
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
  timeZone?: string;
  /** Escape hatch — full control, ignores `dateStyle`/`timeStyle`. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Rendered for nullish/invalid input. Default `'—'`. */
  fallback?: ReactNode;
}

/**
 * A single semantic `<time>` — the one presentation everyone shares. Callers
 * that want the old two-line date-over-muted-time stack compose it themselves.
 *
 * SSR note: output depends on locale/timeZone, so server and client renders can
 * disagree when either falls back to the runtime default. SSR consumers should
 * pin both via `FormatProvider` (or props) to avoid hydration mismatches.
 */
function DateTime({
  value,
  locale,
  dateStyle,
  timeStyle,
  timeZone,
  formatOptions,
  fallback = '—',
  ...props
}: DateTimeProps) {
  const settings = useFormatSettings();
  const date = toDate(value);
  if (!date) return <>{fallback}</>;

  // Explicit wins over context: an escape-hatch `formatOptions.timeZone` must
  // not be clobbered by the provider's zone.
  const resolvedTimeZone = timeZone ?? formatOptions?.timeZone ?? settings.timeZone;
  const options: Intl.DateTimeFormatOptions = {
    ...(formatOptions ?? {
      dateStyle: dateStyle ?? 'medium',
      ...(timeStyle ? { timeStyle } : {}),
    }),
    ...(resolvedTimeZone ? { timeZone: resolvedTimeZone } : {}),
  };

  let formatted: string;
  try {
    formatted = new Intl.DateTimeFormat(locale ?? settings.locale, options).format(date);
  } catch {
    return <>{fallback}</>;
  }

  return (
    <time data-slot="date-time" dateTime={date.toISOString()} {...props}>
      {formatted}
    </time>
  );
}

export { DateTime, type DateTimeProps };
