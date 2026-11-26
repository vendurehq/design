import type { Meta, StoryObj } from '@storybook/react';
import type * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { TextLink } from '../src/components/atoms/text-link.tsx';

const meta = {
  title: 'Atoms/General/TextLink',
  component: TextLink,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { href: '#', children: 'payment handlers' },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'payment handlers' });
    await expect(link).toHaveAttribute('data-slot', 'text-link');
    await expect(link).toHaveAttribute('data-tone', 'default');
  },
};

/**
 * A link inside running text. It takes the size, weight and line height of
 * the paragraph, wraps with it, and stays underlined so it reads as a link
 * without relying on colour.
 */
export const InAParagraph: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-4">
      <p className="text-foreground text-sm">
        Orders are captured when they ship. To capture them at checkout, change the capture setting
        of your <TextLink href="#payment-handlers">payment handlers</TextLink>, or read{' '}
        <TextLink href="#capture">how payment capture works</TextLink> first.
      </p>
      <p className="text-muted-foreground text-xs">
        Need a hand? <TextLink href="#support">Contact support</TextLink> and quote your project ID.
      </p>
      <p className="text-foreground text-base font-medium">
        A link in larger, heavier text keeps that size and weight:{' '}
        <TextLink href="#channels">manage channels</TextLink>.
      </p>
    </div>
  ),
};

/**
 * A small standalone link that must not compete with the actions next to it.
 * Muted at rest, foreground and underlined on hover. Not for
 * running text: there it has no underline to mark it as a link.
 */
export const Quiet: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4 text-sm">
      <TextLink href="#forgot" tone="quiet">
        Forgot password?
      </TextLink>
      <nav aria-label="Legal" className="flex gap-4 text-xs">
        <TextLink href="#terms" tone="quiet">
          Terms
        </TextLink>
        <TextLink href="#privacy" tone="quiet">
          Privacy
        </TextLink>
        <TextLink href="#status" tone="quiet" external>
          Status
        </TextLink>
      </nav>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Forgot password?' });
    await expect(link).toHaveAttribute('data-tone', 'quiet');
  },
};

/**
 * A link to another site opens a new tab. It ends with an up-right arrow
 * sized to the text, and screen readers hear "(opens in a new tab)".
 */
export const External: Story = {
  render: () => (
    <p className="text-foreground max-w-md text-sm">
      Builds run on the region you picked. See the{' '}
      <TextLink href="https://example.com/status" external>
        platform status page
      </TextLink>{' '}
      when a build is slow to start.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'platform status page (opens in a new tab)',
    });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  },
};

/** Stands in for a router's link component, such as TanStack Router's `Link`. */
function RouterLink({ to, ...props }: React.ComponentProps<'a'> & { to: string }) {
  return <a data-router-link="" href={`#${to}`} {...props} />;
}

/**
 * `render` swaps the anchor for a router link. The look and the link role
 * stay; the router link handles navigation.
 */
export const AsRouterLink: Story = {
  render: () => (
    <p className="text-foreground max-w-md text-sm">
      This customer has two open orders. <TextLink render={<RouterLink to="/orders" />}>View orders</TextLink>
    </p>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'View orders' });
    await expect(link).toHaveAttribute('data-router-link');
    await expect(link).toHaveAttribute('href', '#/orders');
    await expect(link).toHaveAttribute('data-slot', 'text-link');
  },
};

/**
 * Keyboard focus turns the text to the hover colour and draws the focus ring
 * at offset 0, so it clears the next word. The underline is hidden while the
 * ring shows. The ring closes on each line of a wrapped link. The play
 * function tabs to the first link.
 */
export const FocusState: Story = {
  render: () => (
    <div className="flex max-w-60 flex-col gap-6 text-sm">
      <p className="text-foreground">
        Read <TextLink href="#a">the guide to tax zones and tax categories</TextLink> before you add
        a channel.
      </p>
      <TextLink href="#b" tone="quiet">
        Forgot password?
      </TextLink>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'the guide to tax zones and tax categories',
    });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    const style = getComputedStyle(link);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineWidth).toBe('2px');
    await expect(style.outlineOffset).toBe('0px');
  },
};
