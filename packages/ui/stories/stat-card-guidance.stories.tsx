import type { Meta, StoryObj } from '@storybook/react';
import { DollarSign, Package, RotateCcw, ShoppingCart, TrendingDown, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatCard } from '../src/components/molecules/stat-card.tsx';

/**
 * Guidance, not props. When a number earns a StatCard (page-framing KPIs, a few
 * of them) versus inline text versus a chart, why every delta needs a stated
 * comparison window, why delta tone follows consequence (not arrow direction),
 * and the wall-of-cards anti-pattern. For the component API, see the StatCard
 * stories.
 */
const meta = {
  title: 'Molecules/StatCard/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, not imported) ────────────

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

const SURFACES: { surface: string; use: string }[] = [
  {
    surface: 'StatCard',
    use: 'A page-framing KPI a user checks first: a running total, a rate, a count that sets context for the whole view. Top of an overview, three or four of them.',
  },
  {
    surface: 'Inline text / DescriptionList',
    use: "One record's attribute (an order total, an item count, a SKU). It belongs beside its label in the detail view, not hoisted into a headline.",
  },
  {
    surface: 'Chart / sparkline',
    use: "When the shape is the message: a trend, a distribution, a comparison across many buckets. A single number can't show shape, so pass it to the card's `chart` slot or use a full chart.",
  },
];

// goodWhen answers "which direction is a good outcome for THIS metric"; the
// card derives success/destructive/muted from it (state dictionary), never the arrow.
const METRICS: { label: string; goodWhen: 'up' | 'down'; note: string }[] = [
  { label: 'Revenue', goodWhen: 'up', note: 'More money is the goal.' },
  { label: 'Orders placed', goodWhen: 'up', note: 'Growth is good.' },
  { label: 'Conversion rate', goodWhen: 'up', note: 'Higher is healthier.' },
  { label: 'Refund rate', goodWhen: 'down', note: 'A rise is bad; up must read destructive.' },
  { label: 'Cart abandonment', goodWhen: 'down', note: 'Fewer abandoned carts is the win.' },
  { label: 'Failed payments', goodWhen: 'down', note: 'Down is the good direction.' },
  { label: 'Avg. fulfillment time', goodWhen: 'down', note: 'Faster is better; slower is bad.' },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const WhenANumberEarnsACard: Story = {
  name: '1 · When a number earns a card',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A StatCard is for the numbers that frame the page"
        intro="Before a figure becomes a StatCard, ask whether it frames the whole view or just describes one record. KPIs at the top of an overview earn a card. A single record's attribute stays inline. A number whose meaning is its shape over time belongs in a chart."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Reach for</th>
                <th className="p-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {SURFACES.map(({ surface, use }) => (
                <tr key={surface} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{surface}</td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Frames the page, or describes one record?"
        intro="The same $128.40 is a headline on an overview and a footnote on a detail page. Placement is the tell."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Top-of-page KPIs that set context for the orders overview. Each one reframes what the user reads below it."
          >
            <div className="w-60">
              <StatCard label="Revenue" value="$48,120" icon={<DollarSign />} />
            </div>
            <div className="w-60">
              <StatCard label="Orders" value="1,204" icon={<ShoppingCart />} />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A single order's total is an attribute of one record. It belongs inline in the order detail (a DescriptionList row), not blown up into a page-framing KPI."
          >
            <div className="w-60">
              <StatCard label="Order #10432 total" value="$128.40" />
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const DeltasNeedAWindowAndTone: Story = {
  name: '2 · Deltas: window and tone',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A delta is meaningless without its comparison window"
        intro="+12.4% since when? A percentage change is only readable against a stated baseline. Always name the window in `description`: the card renders the delta, but only you know what it is measured against."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="The window is stated, so the delta means something.">
            <div className="w-60">
              <StatCard
                label="Revenue"
                value="$48,120"
                icon={<DollarSign />}
                delta={{ value: 12.4 }}
                description="vs. previous 30 days"
              />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A bare delta with no window. The number is up 12.4% against nothing the reader can name."
          >
            <div className="w-60">
              <StatCard
                label="Revenue"
                value="$48,120"
                icon={<DollarSign />}
                delta={{ value: 12.4 }}
              />
            </div>
          </Example>
        </div>
      </Section>

      <Section
        title="Up is not always good: tone follows consequence"
        intro="The delta color is not tied to the arrow. `goodWhen` declares which direction is a good outcome for this metric, and the card derives the tone from that (per the state dictionary: good → success, bad → destructive, flat → muted). For a refund rate, up is bad, so an upward delta must read destructive, never green."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Refund rate up with goodWhen: 'down' renders destructive: rising refunds read as the problem they are."
          >
            <div className="w-60">
              <StatCard
                label="Refund rate"
                value="3.1%"
                icon={<RotateCcw />}
                delta={{ value: 0.8, goodWhen: 'down' }}
                description="vs. previous 30 days"
              />
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="The default goodWhen: 'up' paints rising refunds green, telling the operator a worsening metric is a win."
          >
            <div className="w-60">
              <StatCard
                label="Refund rate"
                value="3.1%"
                icon={<RotateCcw />}
                delta={{ value: 0.8 }}
                description="vs. previous 30 days"
              />
            </div>
          </Example>
        </div>
      </Section>

      <Section
        title="Set goodWhen from the metric's meaning"
        intro="A delta reports a change in magnitude, not a state: keep condition words (Failed, Pending, Cancelled) on StatusBadge with a tone, see StatusBadge/Guidance. For the delta itself, the only question is which direction is the good one."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Metric</th>
                <th className="p-3 font-medium">goodWhen</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ label, goodWhen, note }) => (
                <tr key={label} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs font-medium">{label}</td>
                  <td className="p-3 font-mono text-xs">{goodWhen}</td>
                  <td className="text-muted-foreground p-3 text-xs">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const DontWallOfCards: Story = {
  name: '3 · No wall of cards',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A KPI band is a few numbers, not every number"
        intro="StatCards earn their weight by being scarce. A row of three or four is a band a user reads in one glance; twelve cards is a wall nobody reads, and the numbers that actually frame the page drown in it. Rank the metrics, pick the top few, and push the rest into a table or a chart."
      >
        <Example
          verdict="do"
          caption="Four ranked KPIs. Each carries a delta with a stated window, and the band is scannable in a second."
        >
          <div className="w-52">
            <StatCard
              label="Revenue"
              value="$48,120"
              icon={<DollarSign />}
              delta={{ value: 12.4 }}
              description="vs. prev. 30 days"
            />
          </div>
          <div className="w-52">
            <StatCard
              label="Orders"
              value="1,204"
              icon={<ShoppingCart />}
              delta={{ value: 3.1 }}
              description="vs. prev. 30 days"
            />
          </div>
          <div className="w-52">
            <StatCard
              label="New customers"
              value="860"
              icon={<Users />}
              delta={{ value: 0 }}
              description="vs. prev. 30 days"
            />
          </div>
          <div className="w-52">
            <StatCard
              label="Refund rate"
              value="3.1%"
              icon={<RotateCcw />}
              delta={{ value: 0.8, goodWhen: 'down' }}
              description="vs. prev. 30 days"
            />
          </div>
        </Example>

        <div className="mt-3">
          <Example
            verdict="dont"
            caption="A wall of eight equal-weight cards. Nothing is ranked, so nothing is a headline: this is a table wearing a KPI costume. Cut it to the top four and move the rest into a data table."
          >
            <div className="w-40">
              <StatCard label="Revenue" value="$48,120" />
            </div>
            <div className="w-40">
              <StatCard label="Orders" value="1,204" />
            </div>
            <div className="w-40">
              <StatCard label="Customers" value="860" />
            </div>
            <div className="w-40">
              <StatCard label="Refund rate" value="3.1%" />
            </div>
            <div className="w-40">
              <StatCard label="Products sold" value="5,930" icon={<Package />} />
            </div>
            <div className="w-40">
              <StatCard label="Avg. order value" value="$39.97" />
            </div>
            <div className="w-40">
              <StatCard label="Cart abandonment" value="68%" icon={<TrendingDown />} />
            </div>
            <div className="w-40">
              <StatCard label="Failed payments" value="14" />
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
