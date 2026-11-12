import type { Meta, StoryObj } from '@storybook/react';
import { ArrowUpRight } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { ButtonGroup } from '../src/components/atoms/button-group.tsx';
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

/** A panel head with its link at the end. The link carries the hover for the chevron. */
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
 * link, and pointing anywhere on it brightens the link and moves its chevron.
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

/**
 * A link that opens another site: `direction="external"` ends it with an
 * up-right arrow at 40%. On hover or keyboard focus the arrow goes to 85% and
 * moves 1.5px out along its diagonal. The play function tabs to the link and
 * checks the arrow.
 */
export const External: Story = {
  args: { direction: 'external', children: 'Open storefront', href: '#storefront' },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Open storefront' });
    const arrow = link.querySelector<SVGElement>('[data-slot=arrow-link-arrow]');
    if (!arrow) throw new Error('arrow not found');
    await expect(arrow).toHaveClass('lucide-arrow-up-right');
    await expect(getComputedStyle(arrow).opacity).toBe('0.4');
    await userEvent.click(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(arrow).opacity).toBe('0.85'));
    await waitFor(() => expect(getComputedStyle(arrow).translate).toBe('1.5px -1.5px'));
  },
};

/**
 * A button that opens another site ends with the same arrow, 14px, as its
 * trailing child. The Button keeps it quieter than the label: 55% at rest,
 * 85% on hover. Set `target` and `rel` when it opens a new tab.
 */
export const ButtonToAnotherSite: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline" render={<a href="#dashboard" />}>
        Dashboard <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Button>
      <Button variant="outline" render={<a href="#graphiql" />}>
        GraphiQL <ArrowUpRight className="size-3.5" aria-hidden="true" />
      </Button>
    </ButtonGroup>
  ),
};

/**
 * Right to left: the external arrow points up-left and moves that way on
 * hover and focus.
 */
export const ExternalRightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <ArrowLink href="#" direction="external">
        فتح المتجر
      </ArrowLink>
    </div>
  ),
};

/** In a right-to-left layout the chevron points and moves left. */
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
          <ArrowLink href="#" direction="external">
            Open storefront
          </ArrowLink>
        </div>
      ))}
    </div>
  ),
};
