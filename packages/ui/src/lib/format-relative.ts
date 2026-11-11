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

/**
 * Formats an instant relative to now, for non-React sites (table titles, CSV
 * export, `<time title>`). Picks the largest unit the delta clears, then defers
 * wording to Intl — signed input yields "in 3 days" / "2 hours ago" without a
 * manual past/future branch.
 *
 * Unparseable input (an invalid date string) yields the zero-delta phrase —
 * "now" under `numeric: 'auto'` — rather than throwing; validate upstream if
 * you need to distinguish it (the `<RelativeTime>` molecule renders its
 * `fallback` instead).
 */
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

/**
 * How long ago an instant was, as a length of time: `13 days`, `5 hours`,
 * `1 minute`. Use it for a state that continues, with the caller's own words
 * around it (`for 13 days`). It takes the same unit steps and rounding as
 * `formatRelative`, so `for 13 days` and `13 days ago` agree for one instant.
 * The unit words come from `Intl.NumberFormat` in `locale`; `unitStyle` maps
 * to its `unitDisplay` (`13 days`, `13 days`, `13d` in English). An instant
 * ahead of now reads the same as one behind it.
 *
 * Unparseable input yields `0 seconds`, as `formatRelative` yields `now`.
 */
function formatRelativeDuration(
  value: string | number | Date,
  { locale, unitStyle = 'long' }: Omit<FormatRelativeOptions, 'numeric'> = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  const diff = date.getTime() - Date.now();
  const signed = Number.isFinite(diff) ? diff : 0;
  const step = UNITS.find(({ ms }) => Math.abs(signed) >= ms) ?? { unit: 'second', ms: 1000 };
  // Round the signed delta, as formatRelative does, so a half step lands on
  // the same number in both.
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: step.unit,
    unitDisplay: unitStyle,
  }).format(Math.abs(Math.round(signed / step.ms)));
}

export { formatRelative, formatRelativeDuration, type FormatRelativeOptions };
