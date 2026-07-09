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

export { formatRelative, type FormatRelativeOptions };
