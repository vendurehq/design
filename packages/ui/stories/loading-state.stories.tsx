import type { Meta, StoryObj } from '@storybook/react';
import { LoadingState } from '../src/components/molecules/state-views/loading-state.tsx';

const meta = {
  title: 'Molecules/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  args: {
    variant: 'skeleton',
    rows: 5,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['skeleton', 'spinner'],
    },
    rows: { control: { type: 'number', min: 1, max: 10 } },
    label: { control: 'text' },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Default: five shimmer rows sized for tables/lists.
export const Skeleton: Story = {
  args: { variant: 'skeleton' },
};

// Tighter rows via `rowClassName` for dense lists.
export const CompactRows: Story = {
  args: { variant: 'skeleton', rows: 6, rowClassName: 'h-10' },
};

// Centered spinner for compact or unknown-height regions.
export const SpinnerVariant: Story = {
  args: { variant: 'spinner' },
};

// A visible label sits with the placeholder; an sr-only "Loading…" is always
// present for assistive tech regardless.
export const WithLabel: Story = {
  args: { variant: 'spinner', label: 'Loading deployments…' },
};
