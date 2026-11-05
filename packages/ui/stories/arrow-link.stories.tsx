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

/** `render` swaps the `<a>` for a router link or, as here, a `<button>`. */
export const AsButton: Story = {
  render: () => <ArrowLink render={<button type="button" />}>Open worker logs</ArrowLink>,
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
 * A parent with `group/arrow-link` drives the hover: pointing anywhere on the
 * card brightens the link and moves its arrow.
 */
export const ParentDrivesHover: Story = {
  render: () => (
    <Card className="group/arrow-link max-w-xl">
      <CardContent className="flex items-center justify-between gap-4 text-sm">
        <span>Add a payment handler to checkout</span>
        <ArrowLink href="#">View details</ArrowLink>
      </CardContent>
    </Card>
  ),
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
