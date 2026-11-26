import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { Money } from '../src/components/molecules/money.tsx';

const meta = {
  title: 'Molecules/Money',
  component: Money,
  tags: ['autodocs'],
  args: {
    value: 2500,
    currency: 'USD',
    locale: 'en-US',
  },
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// `value` is always integer minor units. Precision resolves per currency via
// Intl, so zero-decimal (JPY) and three-decimal (BHD) currencies are correct
// without a hardcoded `/100`.
export const PerCurrencyPrecision: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Money value={2500} currency="USD" locale="en-US" />
      <Money value={2500} currency="EUR" locale="de-DE" />
      <Money value={2500} currency="JPY" locale="ja-JP" />
      <Money value={2500} currency="BHD" locale="ar-BH" />
    </div>
  ),
};

// A `FormatProvider` supplies a default currency, locale and storage precision,
// so bare `<Money value>` renders consistently across a surface.
export const WithFormatProvider: Story = {
  render: () => (
    <FormatProvider currency="GBP" locale="en-GB" currencyPrecision={2}>
      <div className="flex flex-col gap-1">
        <Money value={199} />
        <Money value={4999} />
        <Money value={1250000} />
      </div>
    </FormatProvider>
  ),
};

// The `precision` prop overrides everything — here four-decimal unit pricing.
export const ExplicitPrecision: Story = {
  render: () => <Money value={123456} currency="USD" precision={4} locale="en-US" />,
};

// `undefined` means the amount has not loaded yet: a one-line skeleton about as
// wide as a typical amount. `null` means there is no amount: the fallback. `0`
// is a real amount and always shows as one.
export const LoadingAndMissing: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <p data-state="loaded">
        Order total <Money value={123456} currency="USD" locale="en-US" />, paid by card.
      </p>
      <p data-state="loading">
        Order total <Money value={undefined} currency="USD" locale="en-US" />, paid by card.
      </p>
      <p data-state="missing">
        Order total <Money value={null} currency="USD" locale="en-US" />, paid by card.
      </p>
      <p data-state="zero">
        Order total <Money value={0} currency="USD" locale="en-US" />, paid by card.
      </p>
      <div data-state="loaded" className="flex items-baseline gap-2">
        <span className="text-xs">Total</span>
        <Money value={123456} currency="USD" locale="en-US" className="text-lg" />
      </div>
      <div data-state="loading" className="flex items-baseline gap-2">
        <span className="text-xs">Total</span>
        <Money value={undefined} currency="USD" locale="en-US" className="text-lg" />
      </div>
      <table className="w-56 text-sm">
        <tbody>
          <tr data-state="loaded">
            <td className="py-1">Subtotal</td>
            <td className="py-1 text-right">
              <Money value={123456} currency="USD" locale="en-US" />
            </td>
          </tr>
          <tr data-state="loading">
            <td className="py-1">Subtotal</td>
            <td className="py-1 text-right">
              <Money value={undefined} currency="USD" locale="en-US" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rect = (selector: string) =>
      canvasElement.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    const loaded = rect('p[data-state="loaded"] [data-slot="money"]');
    const loading = rect('p[data-state="loading"] [data-slot="money"]');

    // The paragraph and the table row do not move when the amount arrives.
    await expect(rect('p[data-state="loading"]')?.height).toBe(
      rect('p[data-state="loaded"]')?.height,
    );
    // In a baseline-aligned flex row the skeleton does not make the row taller.
    await expect(rect('div[data-state="loading"]')?.height).toBe(
      rect('div[data-state="loaded"]')?.height,
    );
    await expect(rect('tr[data-state="loading"]')?.height).toBe(
      rect('tr[data-state="loaded"]')?.height,
    );
    // The skeleton is one line box tall (an inline amount's own box is only its
    // glyph height) and close to the width of "$1,234.56".
    await expect(loading?.height).toBe(rect('p[data-state="loaded"]')?.height);
    await expect(Math.abs((loading?.width ?? 0) - (loaded?.width ?? 0))).toBeLessThan(
      (loaded?.width ?? 0) * 0.25,
    );
    // The right-aligned skeleton ends where the amount ends.
    await expect(
      Math.abs(
        (rect('tr[data-state="loading"] [data-slot="money"]')?.right ?? 0) -
          (rect('tr[data-state="loaded"] [data-slot="money"]')?.right ?? 0),
      ),
    ).toBeLessThan(1);

    const busy = canvasElement.querySelector('p[data-state="loading"] [data-slot="money"]');
    await expect(busy?.getAttribute('aria-busy')).toBe('true');
    // The zero-width baseline anchor is aria-hidden; the read text is the label.
    await expect(busy?.querySelector('.sr-only')?.textContent).toBe('Loading amount');
    await expect(canvasElement.querySelector('p[data-state="missing"]')?.textContent).toContain(
      '—',
    );
    await expect(canvasElement.querySelector('p[data-state="zero"]')?.textContent).toContain(
      '$0.00',
    );
  },
};
