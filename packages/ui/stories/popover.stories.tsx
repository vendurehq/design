import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '../src/components/atoms/popover.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Atoms/Overlays/Popover',
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

function SidePopover({
  label,
  className,
  align,
}: {
  label: string;
  className: string;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className={`absolute ${className}`} />}>{label}</PopoverTrigger>
      <PopoverContent align={align}>
        <PopoverHeader>
          <PopoverTitle>{label}</PopoverTitle>
          <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

/**
 * A popover opens toward the centre of the screen. A trigger in the right half
 * lines up the popover's right edge with its own and the popover grows left; a
 * trigger in the left half lines up the left edges. The popover scales in from
 * the corner at the trigger. The side is physical, so it is the same in
 * right-to-left. Do not set `align` unless there is a reason: an explicit
 * `align` always wins, and a popover that opens to the left or right of its
 * trigger keeps `start`.
 */
export const OpensTowardTheCentre: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    // Logical insets, so the row flips in right-to-left like a page does.
    <div className="relative h-96 w-full">
      <SidePopover label="Left edge" className="start-4 top-4" />
      <SidePopover label="Middle" className="start-[calc(50%-4rem)] top-4" />
      <SidePopover label="Right edge" className="end-4 top-4" />
      <SidePopover label="Explicit end" className="start-[calc(50%-12rem)] top-40" align="end" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const check = async (label: string, edge: 'left' | 'right') => {
      const trigger = canvas.getByRole('button', { name: label });
      await userEvent.click(trigger);
      const popup = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-slot="popover-content"][data-open]');
        expect(element).not.toBeNull();
        return element as HTMLElement;
      });
      await waitFor(() => {
        const box = popup.getBoundingClientRect();
        const anchor = trigger.getBoundingClientRect();
        // The edge at the trigger lines up with the trigger's edge.
        expect(Math.abs(box[edge] - anchor[edge])).toBeLessThan(1);
        // It scales in from that corner.
        const originX = Number.parseFloat(getComputedStyle(popup).transformOrigin);
        expect(Math.abs(originX - (edge === 'left' ? 0 : box.width))).toBeLessThan(2);
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector('[data-slot="popover-content"]')).toBeNull());
    };
    // Left half: the left edges line up. Right half: the right edges.
    await check('Left edge', 'left');
    await check('Middle', 'left');
    await check('Right edge', 'right');
    // An explicit align wins over the side of the screen: this trigger is in
    // the left half, yet its popover lines up on the right.
    await check('Explicit end', 'right');
    // In a right-to-left page the row flips: the start of the row is on the right.
    const root = document.documentElement;
    const dir = root.getAttribute('dir');
    root.setAttribute('dir', 'rtl');
    try {
      await check('Left edge', 'right');
      await check('Middle', 'right');
      await check('Right edge', 'left');
      await check('Explicit end', 'left');
    } finally {
      if (dir === null) root.removeAttribute('dir');
      else root.setAttribute('dir', dir);
    }
  },
};
