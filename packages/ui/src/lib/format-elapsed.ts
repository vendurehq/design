const SECOND = 1000;

interface FormatElapsedOptions {
  /** The reader's locale. Default: the runtime's. */
  locale?: string;
}

type Unit = 'hour' | 'minute' | 'second';

// Formatters are cached per locale and unit: a timer formats every second.
const cache = new Map<string, { number: Intl.NumberFormat; list: Intl.ListFormat }>();

function formatters(locale: string | undefined, unit: Unit, padded: boolean) {
  const key = `${locale ?? ''}|${unit}|${padded}`;
  let entry = cache.get(key);
  if (!entry) {
    entry = {
      number: new Intl.NumberFormat(locale, {
        style: 'unit',
        unit,
        unitDisplay: 'narrow',
        minimumIntegerDigits: padded ? 2 : 1,
      }),
      list: new Intl.ListFormat(locale, { type: 'unit', style: 'narrow' }),
    };
    cache.set(key, entry);
  }
  return entry;
}

/**
 * Formats a duration in milliseconds as the two largest units, in the reader's
 * locale: `31s`, `1m 15s`, `9m 07s`, `1h 05m` in English, `1 Min., 07 Sek.` or
 * `١ د و٠٧ ث` elsewhere. The smaller unit is zero-padded, so the text keeps
 * its width while it counts (pair it with `tabular-nums`). A negative or
 * invalid duration reads `0s`.
 *
 * The units and the way they join come from `Intl.NumberFormat` (`unit`,
 * `narrow`) and `Intl.ListFormat` (`unit`, `narrow`). `Intl.DurationFormat`
 * cannot zero-pad the smaller unit in this style (`1m 7s`), so the width
 * would jump each time the seconds pass 9.
 */
function formatElapsed(ms: number, { locale }: FormatElapsedOptions = {}): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / SECOND)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pair = (large: Unit, largeValue: number, small: Unit, smallValue: number) => {
    const first = formatters(locale, large, false);
    const second = formatters(locale, small, true);
    return first.list.format([first.number.format(largeValue), second.number.format(smallValue)]);
  };
  if (hours > 0) return pair('hour', hours, 'minute', minutes);
  if (minutes > 0) return pair('minute', minutes, 'second', seconds);
  return formatters(locale, 'second', false).number.format(seconds);
}

/** The ISO 8601 duration of `ms` (`PT1M15S`), for a `<time dateTime>`. */
function isoDuration(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / SECOND)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds || total === 0 ? `${seconds}S` : ''}`;
}

export { formatElapsed, isoDuration, type FormatElapsedOptions };
