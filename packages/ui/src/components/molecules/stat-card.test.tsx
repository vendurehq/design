import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormatProvider } from './format-provider.tsx';
import * as statCard from './stat-card.tsx';

const { StatCard } = statCard;

test('the delta variants are internal', () => {
  expect('statCardDeltaVariants' in statCard).toBe(false);
});

test('the delta color follows the outcome, not the direction', () => {
  const refundRateDown = renderToStaticMarkup(
    <StatCard label="Refund rate" value="1.2%" delta={{ value: -0.4, goodWhen: 'down' }} />,
  );
  expect(refundRateDown).toContain('text-success-text');

  const revenueDown = renderToStaticMarkup(
    <StatCard label="Revenue" value="€12,400" delta={{ value: -3.2 }} />,
  );
  expect(revenueDown).toContain('text-destructive-text');
});

test('an undefined value draws a value skeleton under the real label', () => {
  const html = renderToStaticMarkup(<StatCard label="Revenue" />);
  expect(html).toContain('Revenue');
  expect(html).toContain('data-skeleton="line"');
  expect(html).toContain('aria-busy="true"');
});

test('a real value draws no skeleton and is not busy', () => {
  const html = renderToStaticMarkup(<StatCard label="Orders" value={0} />);
  expect(html).not.toContain('data-skeleton');
  expect(html).not.toContain('aria-busy');
  expect(html).toContain('>0<');
});

test('an undefined delta value draws a delta skeleton', () => {
  const html = renderToStaticMarkup(<StatCard label="Revenue" delta={{ value: undefined }} />);
  expect(html).toMatch(/data-slot="stat-card-delta"[^>]*>.*data-skeleton="line"/);
});

test('the delta is a percent in the FormatProvider locale', () => {
  const en = renderToStaticMarkup(<StatCard label="Revenue" value="€1" delta={{ value: 12.4 }} />);
  expect(en).toContain('12.4%');

  const de = renderToStaticMarkup(
    <FormatProvider locale="de-DE">
      <StatCard label="Umsatz" value="1 €" delta={{ value: -3.25 }} />
    </FormatProvider>,
  );
  // The sign is dropped: the arrow and the screen-reader word carry it.
  expect(de).toContain('</span>3,3\u00a0%</span>');
});

test('a delta unit replaces the percent sign', () => {
  const html = renderToStaticMarkup(
    <FormatProvider locale="de-DE">
      <StatCard label="Margin" value="31%" delta={{ value: 1.5, unit: ' pp' }} />
    </FormatProvider>,
  );
  expect(html).toContain('</span>1,5 pp</span>');
});

test('the direction words default to English', () => {
  expect(renderToStaticMarkup(<StatCard label="A" value="1" delta={{ value: 2 }} />)).toContain(
    '<span class="sr-only">up </span>',
  );
  expect(renderToStaticMarkup(<StatCard label="A" value="1" delta={{ value: -2 }} />)).toContain(
    '<span class="sr-only">down </span>',
  );
});

test('a delta that rounds to zero has no direction', () => {
  for (const value of [0.04, -0.04]) {
    const html = renderToStaticMarkup(<StatCard label="A" value="1" delta={{ value }} />);
    expect(html).not.toContain('lucide-arrow');
    expect(html).not.toContain('sr-only');
    expect(html).toContain('text-muted-foreground');
    expect(html).toMatch(/data-slot="stat-card-delta"[^>]*>0\.0%<\/span>/);
  }
});

test('a non-finite delta shows a dash without a direction', () => {
  for (const value of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN]) {
    const html = renderToStaticMarkup(<StatCard label="A" value="1" delta={{ value }} />);
    expect(html).not.toContain('lucide-arrow');
    expect(html).not.toContain('sr-only');
    expect(html).toMatch(/data-slot="stat-card-delta"[^>]*>—<\/span>/);
  }
});

test('a null value shows the fallback and is not busy', () => {
  const dash = renderToStaticMarkup(<StatCard label="Revenue" value={null} />);
  expect(dash).toMatch(/data-slot="stat-card-value"[^>]*>—<\/span>/);
  expect(dash).not.toContain('aria-busy');
  expect(dash).not.toContain('data-skeleton');

  const custom = renderToStaticMarkup(<StatCard label="Revenue" value={null} fallback="n/a" />);
  expect(custom).toContain('>n/a</span>');
});

test('a loading value is announced', () => {
  expect(renderToStaticMarkup(<StatCard label="Revenue" />)).toContain(
    '<span class="sr-only">Loading value</span>',
  );
  const fromMessages = renderToStaticMarkup(
    <FormatProvider messages={{ statCard: { loading: 'Wert lädt' } }}>
      <StatCard label="Umsatz" />
    </FormatProvider>,
  );
  expect(fromMessages).toContain('Wert lädt');
  const fromProp = renderToStaticMarkup(
    <FormatProvider messages={{ statCard: { loading: 'Wert lädt' } }}>
      <StatCard label="Umsatz" loadingLabel="Lädt" />
    </FormatProvider>,
  );
  expect(fromProp).toContain('<span class="sr-only">Lädt</span>');
});

test('a loading delta makes the card busy', () => {
  const html = renderToStaticMarkup(
    <StatCard label="Revenue" value="$1" delta={{ value: undefined }} />,
  );
  expect(html).toContain('aria-busy="true"');
});

test('the direction words read FormatProvider messages, and the props win', () => {
  const fromMessages = renderToStaticMarkup(
    <FormatProvider messages={{ statCard: { up: 'hoch', down: 'runter' } }}>
      <StatCard label="Umsatz" value="1 €" delta={{ value: 2 }} />
    </FormatProvider>,
  );
  expect(fromMessages).toContain('hoch');

  const fromProp = renderToStaticMarkup(
    <FormatProvider messages={{ statCard: { down: 'runter' } }}>
      <StatCard label="Umsatz" value="1 €" delta={{ value: -2 }} deltaDownLabel="gesunken" />
    </FormatProvider>,
  );
  expect(fromProp).toContain('gesunken');
  expect(fromProp).not.toContain('runter');
});
