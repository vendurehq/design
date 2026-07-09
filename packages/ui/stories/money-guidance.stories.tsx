import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { Money } from '../src/components/molecules/money.tsx';

/**
 * Guidance, not props. Money takes an integer amount in minor units and lets
 * Intl do the formatting; this page rules on where the amount, currency and
 * locale come from, which currencyDisplay the API actually offers, and how
 * money reads in a table (right-aligned, tabular, negatives and zero). For the
 * component API and its precision resolution, see the Money stories.
 */
const meta = {
  title: 'Molecules/Money/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives ───────────────────────────────────────────────────────

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

// Why never hand-format: each rule is a class of bug Money removes by taking
// integer minor units and deferring to Intl.
const PRINCIPLES: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'Pass the minor units, untouched',
    body: 'The API returns amounts as integer minor units (2500 is $25.00, not 25). Hand `value={2500}` straight to Money; it scales minor→major internally. Pre-dividing by 100 at the call site is wrong for JPY (0 decimals) and BHD (3), and it re-implements what Intl already knows.',
  },
  {
    n: 2,
    title: 'Currency and locale are ambient, not literals',
    body: 'Mount one FormatProvider per surface with the store currency, the viewer locale, and the storage precision. A bare <Money value> then reads consistently everywhere without threading props. Pass currency/locale directly only for the exceptional cell that differs from its surface.',
  },
  {
    n: 3,
    title: 'Grouping, symbol placement and decimals are the locale’s job',
    body: 'Thousands separators, the decimal mark, and whether the symbol leads or trails all change per locale: €1.234,56 in de-DE, $1,234.56 in en-US. A string template picks one and is wrong for every other viewer. Money derives all of it from the resolved locale.',
  },
  {
    n: 4,
    title: 'Precision follows the currency, not a constant',
    body: 'Fraction digits resolve prop → context currencyPrecision → the currency’s own Intl digits. Leave precision unset and JPY shows ¥2,500 while BHD shows 2.500 BD, correct by construction. Reach for the precision prop only for genuine sub-cent unit pricing.',
  },
];

// currencyDisplay is a real Intl.NumberFormatOptions passthrough. Rendered live
// with CAD in en-US so all four outputs visibly differ.
const DISPLAYS: {
  display: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  use: string;
}[] = [
  {
    display: 'symbol',
    use: 'The default. The locale-aware symbol (CA$ for CAD in en-US). Right for a single-currency surface.',
  },
  {
    display: 'narrowSymbol',
    use: 'Drops the locale disambiguation ($ not CA$). Use only when the surrounding surface already makes the currency unmistakable.',
  },
  {
    display: 'code',
    use: 'The ISO 4217 code. The safe choice in a multi-currency table where a bare $ would be ambiguous across rows.',
  },
  {
    display: 'name',
    use: 'The spelled-out currency name. For prose and confirmations, not dense tables.',
  },
];

// Order lines rendered right-aligned in a table; negatives are refunds/discounts.
const LINES: { label: string; value: number }[] = [
  { label: 'Subtotal', value: 1250000 },
  { label: 'Shipping', value: 4999 },
  { label: 'Loyalty discount', value: -15000 },
  { label: 'Refunded item', value: -4999 },
  { label: 'Gift-card balance', value: 0 },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const MinorUnits: Story = {
  name: '1 · Amounts are minor units',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Never hand-format a currency string"
        intro="Money exists so no consumer builds `$${(amount / 100).toFixed(2)}` by hand. Give it the integer minor units the API already returns and let Intl place the symbol, group the digits and pick the decimals for the viewer’s locale."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Raw minor units in, locale and currency from the surface’s FormatProvider. One order total, correct in de-DE."
          >
            <FormatProvider currency="EUR" locale="de-DE" currencyPrecision={2}>
              <Money value={1299900} className="text-base font-medium" />
            </FormatProvider>
          </Example>
          <Example
            verdict="dont"
            caption="A hand-built string: pre-divided, hardcoded symbol, en-US grouping baked in. Wrong for every non-dollar locale and every zero-decimal currency."
          >
            <span className="text-base font-medium tabular-nums">
              €{(1299900 / 100).toFixed(2)}
            </span>
          </Example>
        </div>
      </Section>

      <Section
        title="Four rules Money enforces for you"
        intro="Each rule is a class of bug that disappears the moment the amount stays an integer and formatting stays with Intl."
      >
        <div className="flex flex-col gap-3">
          {PRINCIPLES.map(({ n, title, body }) => (
            <div key={n} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {n} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const CurrencyDisplay: Story = {
  name: '2 · Currency display',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The four displays the API offers"
        intro="currencyDisplay is the one presentation choice Money forwards to Intl. The same amount and currency render four ways; pick by how much the surrounding context already disambiguates the currency. All four below are one CA$-denominated amount in en-US."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">currencyDisplay</th>
                <th className="p-3 font-medium text-right">Renders</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {DISPLAYS.map(({ display, use }) => (
                <tr key={display} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{display}</td>
                  <td className="p-3 text-right">
                    <Money value={2500} currency="CAD" locale="en-US" currencyDisplay={display} />
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Disambiguate multi-currency lists with code"
        intro="A single-currency table can trust the symbol. The moment two currencies share one (a marketplace payout list mixing USD, CAD and AUD, all “$”), switch the whole column to code so no row is misread."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="code makes each payout unambiguous even though three currencies share the dollar sign."
          >
            <div className="flex flex-col gap-1 text-right tabular-nums">
              <Money value={2500} currency="USD" locale="en-US" currencyDisplay="code" />
              <Money value={2500} currency="CAD" locale="en-US" currencyDisplay="code" />
              <Money value={2500} currency="AUD" locale="en-US" currencyDisplay="code" />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="narrowSymbol collapses all three to a bare $. The rows are now indistinguishable and the payout is a support ticket."
          >
            <div className="flex flex-col gap-1 text-right tabular-nums">
              <Money value={2500} currency="USD" locale="en-US" currencyDisplay="narrowSymbol" />
              <Money value={2500} currency="CAD" locale="en-US" currencyDisplay="narrowSymbol" />
              <Money value={2500} currency="AUD" locale="en-US" currencyDisplay="narrowSymbol" />
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const InTables: Story = {
  name: '3 · Money in tables',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Right-align, and let the digits line up"
        intro="Money renders with tabular-nums already, so every glyph is one width. Right-align the column and the decimal points stack, making magnitudes scannable down a long order. Negatives arrive from the locale as a leading minus sign, and zero reads as a real amount: never blank, never an em dash."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Line</th>
                <th className="p-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <FormatProvider currency="USD" locale="en-US" currencyPrecision={2}>
                {LINES.map(({ label, value }) => (
                  <tr key={label} className="border-b last:border-0">
                    <td className="p-3">{label}</td>
                    <td className="p-3 text-right">
                      <Money value={value} />
                    </td>
                  </tr>
                ))}
              </FormatProvider>
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Alignment is the column’s job, not the number’s"
        intro="A money value is meaningless left-aligned in a wide numeric column: the eye has to hunt for each total. Set text-right on the cell; Money keeps the tabular figures. Do not swap zero for a placeholder: $0.00 is information, an em dash is a guess."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Right-aligned, tabular, decimals stacked. The largest and smallest totals are obvious at a glance."
          >
            <div className="flex w-40 flex-col gap-1 text-right">
              <Money value={1299900} currency="USD" locale="en-US" />
              <Money value={4999} currency="USD" locale="en-US" />
              <Money value={0} currency="USD" locale="en-US" />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="Left-aligned amounts and a placeholder for zero. Nothing lines up and the $0.00 balance is hidden behind an em dash."
          >
            <div className="flex w-40 flex-col gap-1 text-left">
              <Money value={1299900} currency="USD" locale="en-US" />
              <Money value={4999} currency="USD" locale="en-US" />
              <span className="text-muted-foreground tabular-nums">&mdash;</span>
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
