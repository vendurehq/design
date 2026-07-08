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
