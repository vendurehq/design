import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../src/components/ui/popover.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/Overlays/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open Popover
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm">Width</span>
            <span className="col-span-2 text-sm text-muted-foreground">100%</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm">Height</span>
            <span className="col-span-2 text-sm text-muted-foreground">25px</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
