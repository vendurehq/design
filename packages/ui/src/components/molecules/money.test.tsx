import { describe, expect, spyOn, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { FormatProvider } from './format-provider.tsx';
import { Money } from './money.tsx';

const text = (node: React.ReactElement) =>
  renderToStaticMarkup(node)
    // strip tags so assertions target the rendered amount, not markup
    .replace(/<[^>]+>/g, '')
    // Intl separates some currency codes with a non-breaking / narrow space
    .replace(/[  ]/g, ' ');

describe('Money precision', () => {
  test('two-decimal currency (USD) scales minor units by 100', () => {
    expect(text(<Money value={2500} currency="USD" locale="en-US" />)).toBe('$25.00');
  });

  test('zero-decimal currency (JPY) does not divide or pad', () => {
    // 2500 minor JPY is ¥2,500 — the /100 bug would have shown ¥25.
    expect(text(<Money value={2500} currency="JPY" locale="en-US" />)).toBe('¥2,500');
  });

  test('three-decimal currency (BHD) scales by 1000 and shows three digits', () => {
    expect(text(<Money value={2500} currency="BHD" locale="en-US" />)).toBe('BHD 2.500');
  });

  test('explicit precision prop overrides the per-currency default', () => {
    expect(text(<Money value={250000} currency="USD" precision={4} locale="en-US" />)).toBe(
      '$25.0000',
    );
  });

  test('currencyPrecision resolves from FormatProvider context', () => {
    const html = text(
      <FormatProvider currency="EUR" currencyPrecision={2} locale="en-US">
        <Money value={199} />
      </FormatProvider>,
    );
    expect(html).toBe('€1.99');
  });

  test('without a currency it renders a plain, unsymboled number and dev-warns', () => {
    // The missing-currency warning is module-level once-per-session; this is
    // the suite's only currency-less render, so it fires here. The spy both
    // asserts it and keeps the test output clean.
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const html = text(<Money value={2500} precision={2} locale="en-US" />);
      expect(html).toBe('25.00');
      expect(html).not.toContain('$');
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(String(warnSpy.mock.calls[0]?.[0])).toContain('<Money> was rendered without');
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe('Money while the amount is not known', () => {
  test('undefined renders a one-line skeleton, not $0.00', () => {
    const markup = renderToStaticMarkup(<Money value={undefined} currency="USD" locale="en-US" />);

    expect(markup).toContain('data-skeleton="line"');
    expect(markup).toContain('aria-busy="true"');
    expect(markup).not.toContain('$');
    expect(text(<Money value={undefined} currency="USD" locale="en-US" />)).toBe('Loading amount');
  });

  test('the loading text is visually hidden and can be translated', () => {
    const markup = renderToStaticMarkup(
      <Money value={undefined} currency="EUR" loadingLabel="Betrag wird geladen" />,
    );

    expect(markup).toMatch(/<span class="sr-only">Betrag wird geladen<\/span>/);
  });

  test('the loading text comes from FormatProvider messages, and the prop wins', () => {
    const inProvider = (node: React.ReactElement) =>
      renderToStaticMarkup(
        <FormatProvider currency="EUR" messages={{ money: { loading: 'Lädt' } }}>
          {node}
        </FormatProvider>,
      );

    expect(inProvider(<Money value={undefined} />)).toContain('<span class="sr-only">Lädt</span>');
    expect(inProvider(<Money value={undefined} loadingLabel="Betrag" />)).toContain(
      '<span class="sr-only">Betrag</span>',
    );
  });

  test('the skeleton is phrasing content, so it is valid inside a paragraph', () => {
    const markup = renderToStaticMarkup(
      <p>
        Total <Money value={undefined} currency="USD" />
      </p>,
    );

    expect(markup).not.toContain('<div');
  });

  test('the skeleton keeps the caller class and props on the money element', () => {
    const markup = renderToStaticMarkup(
      <Money value={undefined} currency="USD" className="font-semibold" id="total" />,
    );

    expect(markup).toMatch(/^<span data-slot="money"[^>]*class="[^"]*font-semibold/);
    expect(markup).toContain('id="total"');
  });

  test('null renders the fallback, an em dash by default', () => {
    expect(text(<Money value={null} currency="USD" locale="en-US" />)).toBe('—');
    expect(text(<Money value={null} currency="USD" fallback="n/a" />)).toBe('n/a');
    expect(renderToStaticMarkup(<Money value={null} currency="USD" />)).not.toContain('aria-busy');
  });

  test('zero is a real amount', () => {
    expect(text(<Money value={0} currency="USD" locale="en-US" />)).toBe('$0.00');
  });
});
