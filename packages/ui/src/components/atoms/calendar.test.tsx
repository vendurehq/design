import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { de } from 'react-day-picker/locale/de';
import { fr } from 'react-day-picker/locale/fr';

import { FormatProvider } from '../molecules/format-provider.tsx';
import { Calendar } from './calendar.tsx';

const march2026 = new Date(2026, 2, 1);

const firstWeekday = (html: string) => html.match(/<th[^>]*aria-label="([^"]+)"/)?.[1];

describe('Calendar language', () => {
  test('defaults to US English with a Sunday-first week', () => {
    const html = renderToStaticMarkup(<Calendar mode="single" defaultMonth={march2026} />);
    expect(html).toContain('March 2026');
    expect(firstWeekday(html)).toBe('Sunday');
  });

  test('follows the FormatProvider calendarLocale', () => {
    const html = renderToStaticMarkup(
      <FormatProvider locale="fr-FR" calendarLocale={fr}>
        <Calendar mode="single" defaultMonth={march2026} />
      </FormatProvider>,
    );
    expect(html).toContain('mars 2026');
    expect(firstWeekday(html)).toBe('lundi');
    expect(html).toContain('aria-label="Aller au mois suivant"');
  });

  test('a locale prop wins over the FormatProvider calendarLocale', () => {
    const html = renderToStaticMarkup(
      <FormatProvider calendarLocale={fr}>
        <Calendar mode="single" defaultMonth={march2026} locale={de} />
      </FormatProvider>,
    );
    expect(html).toContain('März 2026');
    expect(firstWeekday(html)).toBe('Montag');
  });

  test('the month dropdown names months in the calendar language', () => {
    const html = renderToStaticMarkup(
      <FormatProvider calendarLocale={fr}>
        <Calendar mode="single" captionLayout="dropdown" defaultMonth={march2026} />
      </FormatProvider>,
    );
    expect(html).toContain('>janv.</option>');
    expect(html).not.toContain('>Jan</option>');
  });
});
