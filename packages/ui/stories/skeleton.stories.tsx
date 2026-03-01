import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../src/components/ui/skeleton.tsx';

const meta = {
  title: 'UI/General/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[160px]" />
      </div>
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <Skeleton className="size-16 rounded-full" />
  ),
};
