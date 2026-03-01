import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '../src/components/ui/calendar.tsx';

const meta = {
  title: 'UI/Forms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Calendar mode="single" className="rounded-md border" />,
};

export const Range: Story = {
  render: () => <Calendar mode="range" className="rounded-md border" />,
};

export const MultiMonth: Story = {
  render: () => (
    <Calendar mode="single" numberOfMonths={2} className="rounded-md border" />
  ),
};
