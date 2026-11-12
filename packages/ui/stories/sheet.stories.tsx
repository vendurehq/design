import type { Meta, StoryObj } from '@storybook/react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../src/components/atoms/sheet.tsx';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Field, FieldGroup, FieldLabel } from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { expectInsidePadding } from './overlay-bounds.ts';

/**
 * The overlay uses the scrim slot. The overlay renders in a portal on `body`,
 * so use the toolbar theme switch to see it in light and dark.
 */
const meta = {
  title: 'Atoms/Overlays/Sheet',
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

const shippingFields = [
  'Recipient',
  'Company',
  'Address line 1',
  'Address line 2',
  'City',
  'Postal code',
  'Region',
  'Country',
  'Phone',
  'Email',
  'Delivery instructions',
  'Reference',
];

/** A form taller than the viewport scrolls inside; a field reached with Tab lands clear of the pinned header and footer. */
/** A row wider than the sheet stays inside the 16px inset of its parts. */
export const WideRow: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Filter</SheetTrigger>
      <SheetContent side="right" className="data-[side=right]:w-80">
        <SheetHeader>
          <SheetTitle>Filter by created date</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <div className="flex gap-2">
            <Button variant="outline" className="shrink-0">is equal to</Button>
            <Button variant="outline" className="min-w-0 flex-1 justify-start">
              <span className="truncate">Pick a date and time for the start of the range</span>
            </Button>
            <Input type="time" aria-label="Time" className="w-28 shrink-0" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose render={<Button />}>Apply filter</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filter' }));
    const sheet = await within(document.body).findByRole('dialog');
    await Promise.all(sheet.getAnimations().map((animation) => animation.finished));
    await expectInsidePadding(sheet, 16);
  },
};

export const TallForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Edit shipping address</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit shipping address</SheetTitle>
          <SheetDescription>The carrier label uses this address from the next shipment.</SheetDescription>
        </SheetHeader>
        <form className="flex flex-1 flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <FieldGroup className="px-4">
            {shippingFields.map((label) => {
              const id = `shipping-${label.toLowerCase().replaceAll(' ', '-')}`;
              return (
                <Field key={id}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <Input id={id} />
                </Field>
              );
            })}
          </FieldGroup>
          <SheetFooter>
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Edit shipping address' }));
    const sheet = await within(document.body).findByRole('dialog');
    await Promise.all(sheet.getAnimations().map((animation) => animation.finished));
    await expect(sheet.scrollHeight).toBeGreaterThan(sheet.clientHeight);
    const header = sheet.querySelector('[data-slot=sheet-header]')!;
    const footer = sheet.querySelector('[data-slot=sheet-footer]')!;
    const last = within(sheet).getByLabelText('Reference');
    within(sheet).getByLabelText('Recipient').focus();
    for (let i = 1; i < shippingFields.length; i++) await userEvent.tab();
    await expect(last).toHaveFocus();
    await waitFor(() => {
      const field = last.getBoundingClientRect();
      expect(field.top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);
      expect(field.bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top);
    });
    await userEvent.keyboard('{Escape}');
  },
};

/** Ends with the sheet open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open Sheet (Right)' }));
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Edit Profile' })).toBeVisible());
  },
};
