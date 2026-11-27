import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
} from '../src/components/atoms/card.tsx';
import {
  ActionNeeded,
  type ActionNeededItem,
  type ActionNeededProps,
} from '../src/components/molecules/action-needed.tsx';

const PASSWORD: ActionNeededItem = {
  key: 'superadmin-password',
  tone: 'warning',
  title: 'Default superadmin password',
  description:
    'The superadmin "superadmin" still has the default password. Anyone who knows Vendure can sign in as it.',
  action: (
    <Button
      size="sm"
      variant="outline"
    >
      Change password
    </Button>
  ),
};

const SEARCH_INDEX: ActionNeededItem = {
  key: 'search-index',
  tone: 'warning',
  title: 'Search index out of date',
  description:
    'The search index of the default channel holds 77 of its 88 product variants, so customers cannot find the rest.',
  action: (
    <Button
      size="sm"
      variant="outline"
    >
      Rebuild index
    </Button>
  ),
};

const SHIPPING: ActionNeededItem = {
  key: 'shipping-method',
  tone: 'critical',
  title: 'No shipping method',
  description: 'No shipping method is enabled for this channel, so customers cannot check out.',
  action: (
    <Button
      size="sm"
      variant="outline"
    >
      Set up shipping
    </Button>
  ),
};

const TAX: ActionNeededItem = {
  key: 'tax-zone',
  tone: 'info',
  title: 'No default tax zone',
  description: 'Prices show without tax until the channel has a default tax zone.',
  action: (
    <Button
      size="sm"
      variant="outline"
    >
      Set tax zone
    </Button>
  ),
};

type CardProps = Partial<ActionNeededProps<ActionNeededItem>> & { description?: string };

// The Dashboard's Store setup card in header mode: the card header is the fold row.
function StoreSetupCard({
  description = 'This channel can take orders. These items are worth a look.',
  items = [PASSWORD, SEARCH_INDEX],
  ...props
}: CardProps) {
  return (
    <Card>
      <ActionNeeded
        title="Store setup"
        description={description}
        items={items}
        storage={null}
        {...props}
      />
    </Card>
  );
}

const meta = {
  title: 'Molecules/ActionNeeded',
  component: StoreSetupCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StoreSetupCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Two warnings. The list starts open, the badges hidden; the whole card header folds it.
export const WarningsOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Store setup/ });
    await expect(trigger).toHaveTextContent('2 warnings');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Open, the badges are hidden; they show only while the list is folded.
    const counts = canvasElement.querySelector('[data-slot=action-needed-counts]');
    await expect(counts).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.queryByText('Action needed')).toBeNull();
    // The header is one button: Enter and Space fold and open the list.
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(counts).not.toHaveAttribute('aria-hidden');
    await userEvent.keyboard(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

// One error and two warnings, passed worst first. The error's icon is red.
export const ErrorAndWarnings: Story = {
  args: {
    description: 'Customers cannot check out until the error is fixed.',
    items: [SHIPPING, PASSWORD, SEARCH_INDEX],
  },
};

// Folded: only the header is left, with one count badge per tone. The rows stay in the page, inert.
export const Folded: Story = {
  args: { items: [SHIPPING, PASSWORD, SEARCH_INDEX, TAX], defaultOpen: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Store setup/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveTextContent('1 error');
    await expect(trigger).toHaveTextContent('2 warnings');
    // The rows stay in the page, inert, so the fold can animate both ways.
    await expect(canvasElement.querySelectorAll('[inert]')).toHaveLength(4);
  },
};

function ReopenDemo() {
  const [items, setItems] = useState([PASSWORD, SEARCH_INDEX]);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        size="sm"
        variant="outline"
        disabled={items.includes(SHIPPING)}
        onClick={() => setItems((current) => [...current, SHIPPING])}
      >
        Add a finding
      </Button>
      <div className="w-full">
        <StoreSetupCard
          description="Fold the list, then add a finding: the new finding opens it again."
          items={items}
        />
      </div>
    </div>
  );
}

// A finding with a key the memory has not seen opens a folded list again.
export const ReopenOnNewFinding: Story = {
  render: () => <ReopenDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Store setup/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(canvas.getByRole('button', { name: 'Add a finding' }));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

export const ErrorAndWarningsDark: Story = {
  ...ErrorAndWarnings,
  globals: { theme: 'dark' },
};

export const FoldedDark: Story = {
  args: Folded.args,
  globals: { theme: 'dark' },
};

// The Console's Project Overview: the same component outside a Card, titled "Action needed".
export const WithoutCard: Story = {
  render: () => (
    <ActionNeeded
      items={[SHIPPING, PASSWORD, SEARCH_INDEX]}
      storage={null}
      title="Action needed"
    />
  ),
};
