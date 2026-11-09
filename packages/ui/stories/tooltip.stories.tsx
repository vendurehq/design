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
 * Moving from one trigger to the next. The second tooltip opens while the
 * first is still showing, and it still fades and scales in from its trigger,
 * as every tooltip does. Only a dismissed tooltip (Escape, an outside press)
 * leaves at once.
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
    // A production build can run the play before the trigger listens; hover until it opens.
    await waitFor(async () => {
      await userEvent.hover(canvas.getByRole('button', { name: 'First' }));
      await expect(body.getByText('First tooltip')).toBeInTheDocument();
    });
    await userEvent.unhover(canvas.getByRole('button', { name: 'First' }));
    await userEvent.hover(canvas.getByRole('button', { name: 'Second' }));
    const popup = (await body.findByText('Second tooltip')).closest(
      '[data-slot=tooltip-content]',
    ) as HTMLElement;
    // Base UI marks this open as instant ("delay"); it still transitions.
    await expect(popup.getAttribute('data-instant')).toBe('delay');
    const style = getComputedStyle(popup);
    await expect(style.transitionProperty).toContain('opacity');
    await expect(style.transitionDuration).not.toBe('0s');
    await userEvent.unhover(canvas.getByRole('button', { name: 'Second' }));
    await waitFor(() => expect(body.queryByText('Second tooltip')).toBeNull());
  },
};

/**
 * A tooltip without a TooltipProvider opens at once, as it does inside one.
 * A TooltipProvider is only needed to set a delay for a group of tooltips.
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
    // Base UI's own default waits 600ms; this tooltip must open well before
    // that, within 300ms of a hover. A production build can run the play
    // before the trigger listens, so a hover that lands too early is retried:
    // each try leaves the trigger first, which cancels any pending open, so a
    // delayed tooltip still fails every try.
    await waitFor(
      async () => {
        await userEvent.unhover(trigger);
        await userEvent.hover(trigger);
        await expect(
          await body.findByText('Copy the order code', {}, { timeout: 300 }),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
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
