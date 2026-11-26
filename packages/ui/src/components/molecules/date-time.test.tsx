import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { DateTime } from './date-time.tsx';
import { ElapsedTime } from './elapsed-time.tsx';
import { FormatProvider } from './format-provider.tsx';
import { RelativeTime } from './relative-time.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const width = (markup: string) => Number(markup.match(/width:(\d+)ch/)?.[1]);

describe('DateTime', () => {
  test('a date renders one <time> with the ISO value', () => {
    const markup = html(<DateTime value="2026-11-26T12:00:00Z" locale="en-US" timeZone="UTC" />);

    expect(markup).toBe(
      '<time data-slot="date-time" dateTime="2026-11-26T12:00:00.000Z" class="tabular-nums">Nov 26, 2026</time>',
    );
  });

  test('undefined renders a one-line skeleton with a hidden loading text', () => {
    const markup = html(<DateTime value={undefined} locale="en-US" />);

    expect(markup).toMatch(/^<span data-slot="date-time" aria-busy="true"/);
    expect(markup).toContain('data-skeleton="line"');
    expect(markup).toContain('<span class="sr-only">Loading date</span>');
    expect(markup).not.toContain('—');
    expect(html(<DateTime value={undefined} loadingLabel="Datum lädt" />)).toContain(
      '<span class="sr-only">Datum lädt</span>',
    );
  });

  test('the skeleton is as wide as the formatted date it stands in for', () => {
    const sample = (options: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(
        Date.UTC(2026, 11, 28, 22, 58, 58),
      ).length;
    // "Dec 28, 2026" in en-US.
    expect(width(html(<DateTime value={undefined} locale="en-US" />))).toBe(12);
    expect(width(html(<DateTime value={undefined} locale="en-US" timeStyle="short" />))).toBe(
      sample({ dateStyle: 'medium', timeStyle: 'short' }),
    );
  });

  test('the loading texts come from FormatProvider messages, and the prop wins', () => {
    const inProvider = (node: React.ReactElement) =>
      html(
        <FormatProvider
          messages={{
            dateTime: { loading: 'Datum lädt' },
            relativeTime: { loading: 'Zeit lädt' },
            elapsedTime: { loading: 'Dauer lädt' },
          }}
        >
          {node}
        </FormatProvider>,
      );

    expect(inProvider(<DateTime value={undefined} />)).toContain('>Datum lädt</span>');
    expect(inProvider(<RelativeTime value={undefined} />)).toContain('>Zeit lädt</span>');
    expect(inProvider(<ElapsedTime from={undefined} />)).toContain('>Dauer lädt</span>');
    expect(inProvider(<DateTime value={undefined} loadingLabel="Datum" />)).toContain(
      '>Datum</span>',
    );
  });

  test('the skeleton is valid inside a paragraph', () => {
    expect(
      html(
        <p>
          Created <DateTime value={undefined} />
        </p>,
      ),
    ).not.toContain('<div');
  });

  test('null and an invalid date render the fallback', () => {
    expect(html(<DateTime value={null} />)).toBe('—');
    expect(html(<DateTime value="not a date" fallback="n/a" />)).toBe('n/a');
  });
});
