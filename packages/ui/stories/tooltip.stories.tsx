import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipLabelSwap,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/atoms/tooltip.tsx';
import { Button } from '../src/components/atoms/button.tsx';

const meta = {
  title: 'Atoms/Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>
          Hover me
        </TooltipTrigger>
        <TooltipContent>
          This is a tooltip
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

/**
 * Open on every side. The tooltip has no arrow: it scales in from the side
 * that faces its trigger.
 */
export const Sides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-x-48 gap-y-20 p-16">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} open>
            <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
            <TooltipContent side={side}>Copy the order code</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
};

/**
 * Moving from one trigger to the next, inside a TooltipProvider. The first
 * tooltip waits `tooltip-delay` (600ms), so a pointer that only passes over a
 * trigger opens nothing. Once a tooltip is open, the next one opens at once
 * and shows in full in its first frame: Base UI marks it `data-instant`, and
 * an instant tooltip does not animate.
 */
export const FromTriggerToTrigger: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-2 p-12">
        {['First', 'Second', 'Third'].map((label) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button variant="outline" />}>{label}</TooltipTrigger>
            <TooltipContent>{label} tooltip</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const first = canvas.getByRole('button', { name: 'First' });
    // A production build can run the play before the trigger listens, so a
    // hover that opens nothing is retried. Each try leaves the trigger first,
    // which cancels a pending open.
    let waited = 0;
    await waitFor(
      async () => {
        await userEvent.unhover(first);
        const start = performance.now();
        await userEvent.hover(first);
        await body.findByText('First tooltip', {}, { timeout: 1500 });
        waited = performance.now() - start;
      },
      { timeout: 5000 },
    );
    // The first tooltip waits for the delay.
    await expect(waited).toBeGreaterThanOrEqual(550);
    await userEvent.unhover(first);
    await userEvent.hover(canvas.getByRole('button', { name: 'Second' }));
    // The next one opens at once, marked instant ("delay"), with no
    // transition: it is fully visible in its first frame.
    const popup = (await body.findByText('Second tooltip', {}, { timeout: 200 })).closest<HTMLElement>(
      '[data-slot=tooltip-content]',
    ) as HTMLElement;
    const style = getComputedStyle(popup);
    await expect(popup.getAttribute('data-instant')).toBe('delay');
    await expect(style.transitionDuration).toMatch(/^0s(, 0s)*$/);
    await expect(style.opacity).toBe('1');
    // Nothing lingers: it closes when the pointer leaves.
    await userEvent.unhover(canvas.getByRole('button', { name: 'Second' }));
    await waitFor(() => expect(body.queryByText('Second tooltip')).toBeNull());
  },
};

/**
 * A tooltip without a TooltipProvider waits `tooltip-delay` (600ms) before it
 * opens, as it does inside one. A TooltipProvider is what lets the next
 * tooltips open at once, without animation.
 */
export const WithoutProvider: Story = {
  render: () => (
    <div className="p-12">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" />}>Copy</TooltipTrigger>
        <TooltipContent>Copy the order code</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Copy' });
    // A production build can run the play before the trigger listens, so a
    // hover that opens nothing is retried. Each try leaves the trigger first,
    // which cancels a pending open.
    let waited = 0;
    await waitFor(
      async () => {
        await userEvent.unhover(trigger);
        const start = performance.now();
        await userEvent.hover(trigger);
        // Nothing is open before the delay is over.
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(body.queryByText('Copy the order code')).toBeNull();
        await body.findByText('Copy the order code', {}, { timeout: 1500 });
        waited = performance.now() - start;
      },
      { timeout: 5000 },
    );
    await expect(waited).toBeGreaterThanOrEqual(550);
  },
};

/**
 * A label that changes in place and is wider than the bubble wraps inside
 * it. When the label changes, the bubble eases to the new label's width and
 * height, so a one-line "Copied" does not keep the height of two lines.
 */
export const LongLabelSwap: Story = {
  render: function Render() {
    const [active, setActive] = React.useState(0);
    return (
      <div className="flex justify-center p-24 pt-28">
        <Tooltip open>
          <TooltipTrigger
            render={<Button variant="outline" onClick={() => setActive((index) => 1 - index)} />}
          >
            Swap label
          </TooltipTrigger>
          <TooltipContent>
            <TooltipLabelSwap
              labels={['Copy commit 3f9a2c7e1b4d8f6a0c5e9b2d7f1a4c8e6b3d0f9a', 'Copied']}
              active={active}
            />
          </TooltipContent>
        </Tooltip>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const long = await body.findByText(/^Copy commit/);
    const popup = long.closest('[data-slot=tooltip-content]') as HTMLElement;
    const swap = long.closest('[data-slot=tooltip-label-swap]') as HTMLElement;
    const padding = Number.parseFloat(getComputedStyle(popup).paddingRight);
    // The whole label shows: it ends inside the bubble's padding.
    await waitFor(() =>
      expect(long.getBoundingClientRect().right).toBeLessThanOrEqual(
        popup.getBoundingClientRect().right - padding + 0.5,
      ),
    );
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Swap label' }));
    const copied = body.getByText('Copied');
    // The bubble ends at the height of the one-line label.
    await waitFor(() =>
      expect(
        Math.abs(swap.getBoundingClientRect().height - copied.getBoundingClientRect().height),
      ).toBeLessThan(1),
    );
  },
};

/**
 * A tooltip is a short hint, at most 320px wide, and nothing widens it: a
 * `max-w-*` class from the consumer is dropped. Longer text wraps inside the
 * bubble, and a changing label wraps at the same width.
 */
export const NeverWiderThan320: Story = {
  render: () => (
    <div className="flex justify-center gap-4 p-24 pt-36">
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline" />}>Hint</TooltipTrigger>
        <TooltipContent className="max-w-sm" side="top">
          The sync runs every night and copies the catalog from the main channel to every
          storefront channel.
        </TooltipContent>
      </Tooltip>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline" />}>Label</TooltipTrigger>
        <TooltipContent className="max-w-sm" side="bottom">
          <TooltipLabelSwap
            labels={['Copy commit 3f9a2c7e1b4d8f6a0c5e9b2d7f1a4c8e6b3d0f9a', 'Copied']}
            active={0}
          />
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async () => {
    const body = within(document.body);
    // The hint text sits right in the bubble, so this is the bubble itself.
    const hint = await body.findByText(/^The sync runs/);
    await expect(hint.dataset.slot).toBe('tooltip-content');
    await expect(hint.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    await expect(getComputedStyle(hint).textWrap).toBe('pretty');
    const long = await body.findByText(/^Copy commit/);
    const popup = long.closest('[data-slot=tooltip-content]') as HTMLElement;
    const padding = Number.parseFloat(getComputedStyle(popup).paddingRight);
    await expect(popup.getBoundingClientRect().width).toBeLessThanOrEqual(320);
    // The label wraps inside the bubble's padding.
    await waitFor(() =>
      expect(long.getBoundingClientRect().right).toBeLessThanOrEqual(
        popup.getBoundingClientRect().right - padding + 0.5,
      ),
    );
  },
};
