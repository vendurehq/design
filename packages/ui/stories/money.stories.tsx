import type { Meta, StoryObj } from '@storybook/react';
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
