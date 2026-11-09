import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { ArrowLink } from '../src/components/molecules/arrow-link.tsx';

const meta = {
  title: 'Molecules/ArrowLink',
  component: ArrowLink,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { href: '#', children: 'View details' },
} satisfies Meta<typeof ArrowLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'View details' });
    await expect(link).toHaveAttribute('data-slot', 'arrow-link');
  },
};

/** A panel head with its link at the end. The link carries the hover for the arrow. */
export const InAPanelHead: Story = {
  render: () => (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Deployments</CardTitle>
        <ArrowLink href="#">All deployments</ArrowLink>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">The latest five deployments.</CardContent>
    </Card>
  ),
};

/**
 * A card that opens the same page as its link: the card takes
 * `group/arrow-link relative` and the link `after:absolute after:inset-0`.
 * The link's ::after covers the card, so a click anywhere on it follows the
 * link, and pointing anywhere on it brightens the link and moves its arrow.
 * The test runner presses the card text with a real mouse and expects the
 * link to open.
 */
export const ParentDrivesHover: Story = {
  parameters: {
    pressRowText: { text: 'Add a payment handler to checkout', expectHash: '#/payment-handlers' },
  },
  render: () => (
    <Card className="group/arrow-link relative max-w-xl">
      <CardContent className="flex items-center justify-between gap-4 text-sm">
        <span>Add a payment handler to checkout</span>
        <ArrowLink href="#/payment-handlers" className="after:absolute after:inset-0">
          View details
        </ArrowLink>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'View details' });
    const text = canvas.getByText('Add a payment handler to checkout').getBoundingClientRect();
    const hit = document.elementFromPoint(text.left + 4, text.top + text.height / 2);
    await expect(hit).toBe(link);
  },
};

/** In a right-to-left layout the arrow points and moves left. */
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <ArrowLink href="#">عرض التفاصيل</ArrowLink>
    </div>
  ),
};

export const LightAndDark: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((mode) => (
        <div
          key={mode}
          className={`${mode === 'dark' ? 'dark' : ''} bg-background text-foreground flex flex-col items-start gap-4 rounded-xl border p-6`}
        >
          <p className="text-sm font-medium capitalize">{mode}</p>
          <ArrowLink href="#">View details</ArrowLink>
          <ArrowLink href="#">All deployments</ArrowLink>
        </div>
      ))}
    </div>
  ),
};
