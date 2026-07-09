import type { Meta, StoryObj } from '@storybook/react';
import { DollarSign, MoreHorizontal, ShoppingCart, Users } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
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

// `value` is ReactNode, so consumers pass any pre-formatted content — the card
// never formats numbers itself.
export const Loading: Story = {
  render: () => (
    <div className="w-80">
      <StatCard label="Revenue" value="—" isLoading />
    </div>
  ),
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
