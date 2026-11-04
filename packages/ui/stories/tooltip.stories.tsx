import type { Meta, StoryObj } from '@storybook/react';
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
