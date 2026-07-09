import type { Meta, StoryObj } from '@storybook/react';
import { InboxIcon, PackageIcon } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { NoOrdersIllustration } from '../src/components/molecules/illustrations/no-orders.tsx';
import { NoResultsIllustration } from '../src/components/molecules/illustrations/no-results.tsx';
import { EmptyState } from '../src/components/molecules/state-views/empty-state.tsx';

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No products yet',
    description: 'Add your first product to start selling.',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// No `icon` or `illustration` passed — the default illustration
// (`EmptyCollectionIllustration`) fills the media slot.
export const Playground: Story = {
  args: {
    children: <Button>Add product</Button>,
  },
};

// Title + description only. Still gets the default illustration — there's no
// bare, media-less rendering unless you opt out (see `WithoutIllustration`).
export const TitleOnly: Story = {
  args: {
    description: undefined,
    title: 'No products',
  },
};

// A search/filter miss gets `NoResultsIllustration`, not the "nothing exists
// yet" default — the recovery is different (widen the query, not create one).
export const NoSearchResults: Story = {
  args: {
    illustration: <NoResultsIllustration />,
    title: 'No customers match “acme”',
    description: 'Try a different search or clear your filters.',
    children: (
      <Button variant="outline" size="sm">
        Clear filters
      </Button>
    ),
  },
};

// Swap in any illustration from `molecules/illustrations/*` for the scenario —
// here, an orders list with nothing in it yet.
export const NoOrders: Story = {
  args: {
    illustration: <NoOrdersIllustration />,
    title: 'No orders yet',
    description: 'When customers check out, their orders will appear here.',
  },
};

// `icon` is the pre-illustration API: a small icon in the muted chip. Passing
// it (without `illustration`) keeps working exactly as it did before
// illustrations existed — no migration required.
export const WithIcon: Story = {
  args: {
    icon: <InboxIcon />,
    title: 'Your inbox is empty',
    description: 'New messages from customers will show up here.',
  },
};

// `illustration={null}` opts out entirely, falling back to `icon` (or nothing,
// if `icon` is also absent). Reach for this in tight spaces — a table cell or
// a card — where a full illustration would be clutter; see the guidance page.
export const WithoutIllustration: Story = {
  args: {
    illustration: null,
    icon: <PackageIcon />,
    title: 'No products yet',
    description: 'Create your first product to start selling.',
  },
};
