import type { Meta, StoryObj } from '@storybook/react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../src/components/ui/sheet.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/Overlays/Sheet',
  component: Sheet,
  tags: ['autodocs'],
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Sheet (Right)
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sheet-name" className="text-right text-sm font-medium">Name</label>
            <input id="sheet-name" defaultValue="John Doe" className="col-span-3 h-9 rounded-md border px-3 text-sm" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sheet-username" className="text-right text-sm font-medium">Username</label>
            <input id="sheet-username" defaultValue="@johndoe" className="col-span-3 h-9 rounded-md border px-3 text-sm" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Sheet (Left)
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse the application sections.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <a href="#" className="rounded-md px-3 py-2 text-sm hover:bg-muted">Dashboard</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm hover:bg-muted">Products</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm hover:bg-muted">Orders</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm hover:bg-muted">Customers</a>
          <a href="#" className="rounded-md px-3 py-2 text-sm hover:bg-muted">Settings</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Sheet (Bottom)
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Apply filters to narrow your results.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap gap-2 px-4 py-2">
          <Button variant="outline" size="sm">Status: Active</Button>
          <Button variant="outline" size="sm">Category: All</Button>
          <Button variant="outline" size="sm">Sort: Newest</Button>
        </div>
        <SheetFooter>
          <Button variant="outline">Reset</Button>
          <Button>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
