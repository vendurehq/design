'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { cn } from '@vendure-io/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { useMessages } from '../../lib/format-messages.ts';
// Relative: `time-tooltip` is internal.
import { TimeSkeleton } from './time-tooltip.tsx';

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// A late date with two-digit fields, so the sample is as long as the longest
// dates: "Dec 28, 2026, 10:58 PM" in en-US.
const SAMPLE_DATE = Date.UTC(2026, 11, 28, 22, 58, 58);

interface DateTimeProps extends Omit<ComponentProps<'time'>, 'dateTime'> {
  /**
   * `undefined` means not loaded yet and renders a one-line skeleton as wide
   * as the formatted date. `null` and an invalid date render `fallback`.
   */
  value: string | number | Date | null | undefined;
  locale?: string;
  /** `Intl` date preset. Default `'medium'`. */
  dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
  /** `Intl` time preset. Omit for a date-only rendering. */
  timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
  timeZone?: string;
  /** Escape hatch — full control, ignores `dateStyle`/`timeStyle`. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Rendered for `null` and invalid input. Default `'—'`. */
  fallback?: ReactNode;
  /** Screen-reader text while `value` is `undefined`. @default `messages.dateTime.loading`, "Loading date" */
  loadingLabel?: string;
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
  loadingLabel,
  className,
  ...props
}: DateTimeProps) {
  const settings = useFormatSettings();
  const t = useMessages('dateTime', { loading: loadingLabel });

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

  if (value === undefined) {
    let sample = 'Dec 28, 2026';
    try {
      sample = new Intl.DateTimeFormat(locale ?? settings.locale, {
        ...options,
        timeZone: 'UTC',
      }).format(SAMPLE_DATE);
    } catch {}
    return (
      <TimeSkeleton
        slot="date-time"
        sample={sample}
        loadingLabel={t.loading}
        className={className}
        {...props}
      />
    );
  }

  const date = toDate(value);
  if (!date) return <>{fallback}</>;

  let formatted: string;
  try {
    formatted = new Intl.DateTimeFormat(locale ?? settings.locale, options).format(date);
  } catch {
    return <>{fallback}</>;
  }

  return (
    <time
      data-slot="date-time"
      dateTime={date.toISOString()}
      className={cn('tabular-nums', className)}
      {...props}
    >
      {formatted}
    </time>
  );
}

export { DateTime, type DateTimeProps };
