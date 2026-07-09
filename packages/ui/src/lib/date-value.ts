const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse `YYYY-MM-DD` into a local calendar date without a UTC shift. */
function parseCalendarDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const match = CALENDAR_DATE_PATTERN.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return undefined;
  }
  return date;
}

/** Serialize a local calendar date as `YYYY-MM-DD`. */
function formatCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInstant(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateLabel(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function formatDateRangeLabel(from: Date, to: Date | undefined, locale?: string): string {
  if (!to || from.getTime() === to.getTime()) return formatDateLabel(from, locale);
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  return formatter.formatRange(from, to);
}

export {
  formatCalendarDate,
  formatDateLabel,
  formatDateRangeLabel,
  parseCalendarDate,
  parseInstant,
};
