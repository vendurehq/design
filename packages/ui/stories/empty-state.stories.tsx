import type { Meta, StoryObj } from '@storybook/react';
import { InboxIcon, PackageIcon, SearchIcon } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { EmptyState } from '../src/components/molecules/state-views/empty-state.tsx';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No orders yet',
    description: 'When customers place orders, they will appear here.',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    icon: <PackageIcon />,
  },
};

// Title + description only — the minimum an empty panel needs.
export const TitleOnly: Story = {
  args: {
    icon: undefined,
    description: undefined,
    title: 'No results',
  },
};

// Icon chip above the headline. Pass any element; it lands in the muted
// `EmptyMedia` icon slot.
export const WithIcon: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'Your inbox is empty',
    description: 'New messages from customers will show up here.',
  },
};

// Actions/CTA are passed as children and render in the content slot.
export const WithAction: Story = {
  args: {
    icon: <PackageIcon />,
    title: 'No products yet',
    description: 'Create your first product to start selling.',
    children: <Button>Create product</Button>,
  },
};

// Filtered/search empties reuse the same shell.
export const NoSearchResults: Story = {
  args: {
    icon: <SearchIcon />,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
    children: (
      <Button variant="outline" size="sm">
        Clear filters
      </Button>
    ),
  },
};
