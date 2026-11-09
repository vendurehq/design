import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';
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
    // A production build can run the play before the trigger listens.
    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.hover(canvas.getByRole('button', { name: 'Copy' }));
    // Base UI's own default waits 600ms; this tooltip must open well before that.
    await expect(
      await body.findByText('Copy the order code', {}, { timeout: 300 }),
    ).toBeInTheDocument();
  },
};
