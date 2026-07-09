import { describe, expect, test } from 'bun:test';
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

  test('without a currency it renders a plain, unsymboled number', () => {
    const html = text(<Money value={2500} precision={2} locale="en-US" />);
    expect(html).toBe('25.00');
    expect(html).not.toContain('$');
  });
});
