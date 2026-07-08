import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: {
    tone: 'neutral',
    dot: false,
    children: 'Status',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'critical', 'progress'],
    },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const TONES: { tone: Tone; label: string }[] = [
  { tone: 'neutral', label: 'Draft' },
  { tone: 'info', label: 'Shipped' },
  { tone: 'success', label: 'Active' },
  { tone: 'warning', label: 'Awaiting approval' },
  { tone: 'critical', label: 'Failed' },
  { tone: 'progress', label: 'Deploying' },
];

export const Playground: Story = {};

// Every tone in the subtle treatment — the only rendering StatusBadge offers.
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone}>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// The leading dot is opt-in for dense tables (see WithDot); progress ignores the
// prop and always pulses.
export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone} dot>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// `progress` always renders a pulsing dot regardless of the `dot` prop — it
// replaces ad-hoc spinners. The pulse pauses under prefers-reduced-motion.
export const Progress: Story = {
  args: { tone: 'progress', children: 'Deploying' },
};

// Same metrics as Badge (h-5, pill radius, text-xs), so a status chip and a
// classification chip line up on the same table row. Solid/brand chips stay on
// Badge; StatusBadge is subtle-only.
export const AlongsideBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="success" dot>
        Active
      </StatusBadge>
      <Badge variant="outline">Production</Badge>
      <StatusBadge tone="warning" dot>
        Degraded
      </StatusBadge>
      <Badge variant="outline">Staging</Badge>
    </div>
  ),
};
