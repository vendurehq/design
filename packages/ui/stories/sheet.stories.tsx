import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '../src/components/atoms/sheet.tsx';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Field, FieldGroup, FieldLabel } from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { expectInsidePadding } from './overlay-bounds.ts';
import { expectPx } from './pixel.ts';

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
        Open Sheet (End)
      </SheetTrigger>
      <SheetContent side="end">
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

export const Start: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>
        Open Sheet (Start)
      </SheetTrigger>
      <SheetContent side="start">
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
      <SheetContent side="end" className="data-[side=end]:w-80">
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
      <SheetContent side="end">
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

const sheetSizes = [
  { size: 'default', job: 'Short form', width: 512 },
  { size: 'xl', job: 'Table or wide form', width: 800 },
] as const;

/**
 * A left or right sheet takes `default` (512px) for a short form or a
 * settings list, and `xl` (800px) for a table or a wide form. Both are 3/4 of
 * the viewport at most. Top and bottom sheets ignore the size. Do not set a
 * `max-w-[…]`, `min-w-[…]` or `w-[…]` class for the width.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {sheetSizes.map(({ size, job }) => (
        <Sheet key={size}>
          <SheetTrigger render={<Button variant="outline" />}>{`size="${size}"`}</SheetTrigger>
          <SheetContent size={size}>
            <SheetHeader>
              <SheetTitle>{job}</SheetTitle>
              <SheetDescription>{`This sheet uses size="${size}".`}</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const { size, job, width } of sheetSizes) {
      await userEvent.click(within(canvasElement).getByRole('button', { name: `size="${size}"` }));
      const sheet = await within(document.body).findByRole('dialog', { name: job });
      await Promise.all(sheet.getAnimations().map((animation) => animation.finished));
      const viewport = document.documentElement.clientWidth;
      const expected = viewport >= 640 ? Math.min(width, viewport * 0.75) : viewport * 0.75;
      await expectPx(sheet.offsetWidth, expected, `size="${size}" width`);
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    }
  },
};

/** Ends with the sheet open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open Sheet (End)' }));
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Edit Profile' })).toBeVisible());
  },
};

/** Sheet content for the side checks: a trigger and a short body. */
function SideSheet({ side }: { side: 'start' | 'end' }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open {side}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{side} sheet</SheetTitle>
          <SheetDescription>Slides in from the {side} edge.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}

/**
 * `side` is logical. The `start` sheet is at the left edge in a left-to-right
 * page and at the right edge in a right-to-left page. The `end` sheet is the
 * other edge.
 */
function sideStory(dir: 'ltr' | 'rtl', side: 'start' | 'end'): Story {
  const edge = (side === 'start') === (dir === 'ltr') ? 'left' : 'right';
  return {
    render: () => (
      <DirectionProvider direction={dir}>
        <div dir={dir}>
          <SideSheet side={side} />
        </div>
      </DirectionProvider>
    ),
    play: async ({ canvasElement }) => {
      await userEvent.click(within(canvasElement).getByRole('button', { name: `Open ${side}` }));
      const sheet = await within(document.body).findByRole('dialog');
      const viewport = document.documentElement.clientWidth;
      // The slide-in ends at the edge: wait for it instead of reading the first frame.
      await waitFor(() => {
        const box = sheet.getBoundingClientRect();
        if (edge === 'left') expect(Math.abs(box.left)).toBeLessThanOrEqual(1);
        else expect(Math.abs(box.right - viewport)).toBeLessThanOrEqual(1);
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    },
  };
}

export const StartLeftToRight: Story = sideStory('ltr', 'start');
export const EndLeftToRight: Story = sideStory('ltr', 'end');
/** In right-to-left, `start` is the right edge. */
export const StartRightToLeft: Story = sideStory('rtl', 'start');
export const EndRightToLeft: Story = sideStory('rtl', 'end');

/** `FormatProvider`'s `messages.sheet.close` names the ✕ once for the app. */
export const CloseLabelFromMessages: Story = {
  tags: ['!autodocs'],
  render: () => (
    <FormatProvider messages={{ sheet: { close: 'Fermer' } }}>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open sheet' }));
    const sheet = await within(document.body).findByRole('dialog');
    await waitFor(() => expect(within(sheet).getByRole('button', { name: 'Fermer' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
  },
};

/** `closeLabel` wins over `messages`. */
export const CloseLabel: Story = {
  tags: ['!autodocs'],
  render: () => (
    <FormatProvider messages={{ sheet: { close: 'Fermer' } }}>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
        <SheetContent closeLabel="Schließen">
          <SheetTitle className="p-4">Edit profile</SheetTitle>
        </SheetContent>
      </Sheet>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open sheet' }));
    const sheet = await within(document.body).findByRole('dialog');
    await waitFor(() => expect(within(sheet).getByRole('button', { name: 'Schließen' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
  },
};
