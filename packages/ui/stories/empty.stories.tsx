import type { Meta, StoryObj } from '@storybook/react';
import { InboxIcon, SearchIcon } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from '../src/components/ui/empty.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/General/Empty',
  component: Empty,
  tags: ['autodocs'],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <InboxIcon className="size-10 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No orders yet</EmptyTitle>
        <EmptyDescription>
          When customers place orders, they will appear here.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Order</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchIcon />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filter to find what you are looking for.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Clear Filters</Button>
      </EmptyContent>
    </Empty>
  ),
};
