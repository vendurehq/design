import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { CollapsibleSection } from '../src/components/molecules/collapsible-section.tsx';
import {
  ListRow,
  ListRowChevron,
  ListRowContent,
  ListRowLink,
  ListRowMeta,
  ListRowTrailing,
} from '../src/components/molecules/list-row.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

const meta = {
  title: 'Molecules/CollapsibleSection',
  component: CollapsibleSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { title: 'Returns awaiting inspection', count: 3 },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CollapsibleSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const RETURNS = [
  { code: 'RMA-318', order: 'SB-2031', customer: 'Hayden Zieme', received: '2 days ago' },
  { code: 'RMA-317', order: 'SB-2027', customer: 'Mara Okafor', received: '3 days ago' },
  { code: 'RMA-315', order: 'SB-2019', customer: 'Liam Becker', received: '5 days ago' },
];

function ReturnRows() {
  return RETURNS.map((item) => (
    <ListRow key={item.code}>
      <ListRowContent>
        <ListRowLink onClick={() => {}}>Return {item.code}</ListRowLink>
        <ListRowMeta>
          Order {item.order} · {item.customer}
        </ListRowMeta>
      </ListRowContent>
      <ListRowTrailing>{item.received}</ListRowTrailing>
      <ListRowChevron />
    </ListRow>
  ));
}

// The count beside the title says how many rows the section holds, open and
// closed.
export const Default: Story = {
  render: (args) => (
    <CollapsibleSection {...args}>
      <ReturnRows />
    </CollapsibleSection>
  ),
};

export const DefaultOpen: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <CollapsibleSection {...args}>
      <ReturnRows />
    </CollapsibleSection>
  ),
};

// Warning colours the count only, for rows that wait on the user. Open the
// section by default, so they are in view.
export const Warning: Story = {
  args: { title: 'Payments to review', count: 2, tone: 'warning', defaultOpen: true },
  render: (args) => (
    <CollapsibleSection {...args}>
      {['SB-2041', 'SB-2036'].map((code) => (
        <ListRow key={code}>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>Order {code}</ListRowLink>
            <ListRowMeta>Flagged by the fraud check</ListRowMeta>
          </ListRowContent>
          <ListRowTrailing>
            <StatusBadge tone="warning">Needs review</StatusBadge>
          </ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </CollapsibleSection>
  ),
};

// A detail after the count names the rows that matter. The tone colours the
// detail only: here only "1 failed" is red, the count stays muted.
export const TextCount: Story = {
  args: {
    title: 'Pushes not deployed',
    count: 2,
    detail: '1 failed',
    tone: 'critical',
    defaultOpen: true,
  },
  render: (args) => (
    <CollapsibleSection {...args}>
      <ListRow>
        <ListRowContent>
          <ListRowLink onClick={() => {}}>Add Klarna payment method</ListRowLink>
          <ListRowMeta>Build failed: tsc exited with code 2.</ListRowMeta>
        </ListRowContent>
        <ListRowTrailing>
          <StatusBadge tone="critical">Failed</StatusBadge>
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
      <ListRow>
        <ListRowContent>
          <ListRowLink onClick={() => {}}>Update the shipping rates</ListRowLink>
          <ListRowMeta>Replaced by a newer push before it deployed.</ListRowMeta>
        </ListRowContent>
        <ListRowChevron />
      </ListRow>
    </CollapsibleSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The dot is hidden from screen readers; a comma takes its place.
    await expect(
      canvas.getByRole('button', { name: /^Pushes not deployed 2\s*,\s*1 failed$/ }),
    ).toBeInTheDocument();
    const count = canvasElement.querySelector('[data-slot=collapsible-section-count]');
    const detail = canvasElement.querySelector('[data-slot=collapsible-section-count-detail]');
    await expect(detail).toHaveTextContent('1 failed');
    await expect(detail).toHaveClass('text-destructive-text');
    await expect(count).toHaveClass('text-muted-foreground');
  },
};

// Controlled: the page owns the open state, for example to open the section
// from elsewhere on the page.
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-start gap-3">
        <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
          {open ? 'Hide returns' : 'Show returns'}
        </Button>
        <CollapsibleSection {...args} open={open} onOpenChange={setOpen} className="w-full">
          <ReturnRows />
        </CollapsibleSection>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Returns awaiting inspection/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // The page opens it: the open prop reaches the section.
    await userEvent.click(canvas.getByRole('button', { name: 'Show returns' }));
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Return RMA-318' })).toBeVisible());

    // The header closes it: onOpenChange reaches the page, which flips its button.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('button', { name: 'Show returns' })).toBeVisible();
  },
};

// Inside a page section that already has an h2, the title steps down a level.
export const HeadingLevel: Story = {
  args: { headingLevel: 3 },
  render: (args) => (
    <section className="flex flex-col gap-3">
      <h2 className="text-style-section-title">Returns</h2>
      <CollapsibleSection {...args}>
        <ReturnRows />
      </CollapsibleSection>
    </section>
  ),
};

/** The header toggles the rows; the count stays in both states. */
export const Toggles: Story = {
  render: (args) => (
    <CollapsibleSection {...args}>
      <ReturnRows />
    </CollapsibleSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Returns awaiting inspection/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('button', { name: 'Return RMA-318' })).toBeNull();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Return RMA-318' })).toBeVisible());
    await expect(canvasElement.querySelector('[data-slot=collapsible-section-count]')).not.toHaveAttribute(
      'aria-hidden',
    );
    await expect(trigger).toHaveAccessibleName(/3/);

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Return RMA-318' })).toBeNull());
  },
};

/**
 * A disabled section keeps its rows in their state: the header does not
 * toggle and shows no hover fill or pointer, so it does not look clickable.
 * It stays in the tab order and says it is disabled.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <CollapsibleSection {...args}>
      <ReturnRows />
    </CollapsibleSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /Returns awaiting inspection/ });
    await expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
