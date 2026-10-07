import type { Meta, StoryObj } from '@storybook/react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../src/components/atoms/drawer.tsx';
import { Button } from '../src/components/atoms/button.tsx';

/**
 * The Drawer runs on Base UI. Its parts take the `render` prop, like every other
 * atom. The scrim and the drawer render in a portal on `body`, so use the
 * toolbar theme switch to see them in light and dark.
 */
const meta = {
  title: 'Atoms/Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="outline" />}>Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move Goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col items-center gap-4 p-4">
          <div className="text-center">
            <div className="text-5xl font-bold tracking-tighter">350</div>
            <div className="text-sm text-muted-foreground">calories/day</div>
          </div>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};

/** `swipeDirection` sets the side: `up`, `right`, `down` (default) or `left`. */
export const Left: Story = {
  render: () => (
    <Drawer swipeDirection="left">
      <DrawerTrigger render={<Button variant="outline" />}>Open filters</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the order list.</DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 p-4 text-sm text-muted-foreground">Filter fields go here.</div>
        <DrawerFooter>
          <DrawerClose render={<Button />}>Apply</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
