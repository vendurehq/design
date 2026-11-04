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

// Closed: the pill says how many rows wait behind the header. Open: the pill
// blurs out and the rows say it.
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

// Attention tones the pill only, for rows that need the user. Open the section
// by default when one of them has failed, so the failure is in view.
export const Attention: Story = {
  args: { title: 'Failed payment captures', count: 2, tone: 'attention' },
  render: (args) => (
    <CollapsibleSection {...args}>
      {['SB-2041', 'SB-2036'].map((code) => (
        <ListRow key={code}>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>Order {code}</ListRowLink>
            <ListRowMeta>Card declined by the issuer</ListRowMeta>
          </ListRowContent>
          <ListRowTrailing>
            <StatusBadge tone="critical">Capture failed</StatusBadge>
          </ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </CollapsibleSection>
  ),
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

/** The header toggles the rows; the count leaves the accessibility tree while open. */
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
    await expect(canvasElement.querySelector('[data-slot=collapsible-section-count]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByRole('button', { name: 'Return RMA-318' })).toBeNull());
  },
};
