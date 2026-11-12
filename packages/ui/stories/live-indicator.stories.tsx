import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { LiveIndicator } from '../src/components/molecules/live-indicator.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/LiveIndicator',
  component: LiveIndicator,
  tags: ['autodocs'],
  args: {
    tone: 'success',
    pulse: true,
    label: 'Live',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'critical', 'progress'],
    },
    pulse: { control: 'boolean' },
    label: { control: 'text' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof LiveIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// The dot alone. `label` is read by assistive technology only.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Live')).toHaveClass('sr-only');
  },
};

// A visible label after the dot: 12px secondary text, 7px gap. The dot is
// hidden from assistive technology, so the label is read once.
export const WithLabel: Story = {
  args: { label: undefined, children: 'Streaming' },
};

const TONES: { tone: Tone; label: string }[] = [
  { tone: 'success', label: 'Live' },
  { tone: 'info', label: 'Streaming' },
  { tone: 'neutral', label: 'Listening' },
  { tone: 'warning', label: 'Reconnecting' },
  { tone: 'critical', label: 'Recording' },
];

// Each tone. Success is the default: live and well.
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {TONES.map(({ tone, label }) => (
        <LiveIndicator key={tone} tone={tone}>
          {label}
        </LiveIndicator>
      ))}
    </div>
  ),
};

// `pulse={false}`: a still dot, where a spinner or a progress sweep on the
// same page already moves for the same state.
export const Still: Story = {
  args: { label: undefined, pulse: false, tone: 'info', children: 'Streaming' },
};

// Live versus in progress: the dot is for a state that stays on (a log
// stream, a running service); the StatusBadge spinner is for work that ends.
export const LiveAndInProgress: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span className="text-sm font-medium">Log</span>
        <LiveIndicator>Streaming</LiveIndicator>
      </div>
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span className="text-sm font-medium">Deployment</span>
        <StatusBadge tone="progress">Deploying</StatusBadge>
      </div>
    </div>
  ),
};
