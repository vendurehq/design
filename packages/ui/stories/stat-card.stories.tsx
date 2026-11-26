import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { DollarSign, MoreHorizontal, ShoppingCart, Users } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { StatCard } from '../src/components/molecules/stat-card.tsx';

const meta = {
  title: 'Molecules/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: {
    label: 'Revenue',
    value: '$48,120',
    description: 'vs. previous period',
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="w-80">
      <StatCard {...args} />
    </div>
  ),
};

// Delta tone follows the metric's meaning via `goodWhen`, not the arrow
// direction — revenue up is success, and it renders through the semantic tokens
// (never a hardcoded green/red).
export const WithDelta: Story = {
  render: () => (
    <div className="w-80">
      <StatCard
        label="Revenue"
        value="$48,120"
        description="vs. previous period"
        icon={<DollarSign />}
        delta={{ value: 12.4 }}
      />
    </div>
  ),
};

// Here a rise is bad: for refund rate, `goodWhen: 'down'` flips the tone so an
// upward delta reads as destructive.
export const InvertedDelta: Story = {
  render: () => (
    <div className="w-80">
      <StatCard
        label="Refund rate"
        value="3.1%"
        description="vs. previous period"
        delta={{ value: 0.8, goodWhen: 'down' }}
      />
    </div>
  ),
};

export const WithIconAndAction: Story = {
  render: () => (
    <div className="w-80">
      <StatCard
        label="Orders"
        value="1,204"
        icon={<ShoppingCart />}
        delta={{ value: -3.2 }}
        action={
          <Button variant="ghost" size="icon-sm" aria-label="More">
            <MoreHorizontal />
          </Button>
        }
      />
    </div>
  ),
};

// While the value is not known yet, leave `value` (and `delta.value`)
// undefined. The label, icon and description are known, so they show; the
// value and the delta draw a skeleton of their own line height, so the card
// keeps its height when the data arrives.
export const Loading: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <StatCard
        data-testid="loading"
        label="Revenue"
        icon={<DollarSign />}
        description="vs. previous period"
        delta={{ value: undefined }}
      />
      <StatCard
        data-testid="value-loading"
        label="Revenue"
        icon={<DollarSign />}
        description="vs. previous period"
        delta={{ value: 12.4 }}
      />
      <StatCard
        data-testid="delta-loading"
        label="Revenue"
        value="$48,120"
        icon={<DollarSign />}
        description="vs. previous period"
        delta={{ value: undefined }}
      />
      <StatCard
        data-testid="loaded"
        label="Revenue"
        value="$48,120"
        icon={<DollarSign />}
        description="vs. previous period"
        delta={{ value: 12.4 }}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loading = canvasElement.querySelector<HTMLElement>('[data-testid="loading"]');
    const loaded = canvasElement.querySelector<HTMLElement>('[data-testid="loaded"]');
    if (!loading || !loaded) throw new Error('cards not rendered');
    await expect(loading.getAttribute('aria-busy')).toBe('true');
    await expect(loaded.hasAttribute('aria-busy')).toBe(false);
    await expect(loading.textContent).toContain('Revenue');
    // Nothing moves when the data arrives, whichever part arrives first.
    const height = (testId: string) =>
      canvasElement.querySelector(`[data-testid="${testId}"]`)?.getBoundingClientRect().height;
    for (const testId of ['loading', 'value-loading', 'delta-loading']) {
      await expect(height(testId)).toBe(height('loaded'));
    }
  },
};

// The delta follows the FormatProvider locale ("12,4 %"), and its
// screen-reader words read `messages.statCard`. A `unit` on the delta
// replaces the percent sign for other units, e.g. percentage points.
export const Localized: Story = {
  render: () => (
    <FormatProvider locale="de-DE" messages={{ statCard: { up: 'gestiegen', down: 'gesunken' } }}>
      <div className="flex w-80 flex-col gap-4">
        <StatCard label="Umsatz" value="48.120 €" delta={{ value: 12.4 }} />
        <StatCard label="Marge" value="31 %" delta={{ value: -1.5, unit: ' pp' }} />
      </div>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const deltas = canvasElement.querySelectorAll('[data-slot="stat-card-delta"]');
    await expect(deltas[0]?.textContent).toBe('gestiegen 12,4\u00a0%');
    await expect(deltas[1]?.textContent).toBe('gesunken 1,5 pp');
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Revenue" value="$48,120" icon={<DollarSign />} delta={{ value: 12.4 }} />
      <StatCard label="Orders" value="1,204" icon={<ShoppingCart />} delta={{ value: -3.2 }} />
      <StatCard label="Customers" value="860" icon={<Users />} delta={{ value: 0 }} />
    </div>
  ),
};
