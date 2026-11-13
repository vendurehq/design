import type { Meta, StoryObj } from '@storybook/react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../src/components/atoms/dialog.tsx';
import { RocketIcon, TriangleAlertIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Field, FieldGroup, FieldLabel } from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { expectInsidePadding } from './overlay-bounds.ts';
import { expectPx } from './pixel.ts';

/**
 * The overlay uses the scrim slot. The overlay renders in a portal on `body`,
 * so use the toolbar theme switch to see it in light and dark.
 */
const meta = {
  title: 'Atoms/Overlays/Dialog',
  component: Dialog,
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Open Dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        Edit Profile
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
            <input id="name" defaultValue="John Doe" className="col-span-3 h-9 rounded-md border px-3 text-sm" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right text-sm font-medium">Username</label>
            <input id="username" defaultValue="@johndoe" className="col-span-3 h-9 rounded-md border px-3 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * An 18px icon before the title. It is the foreground at 60% by default;
 * `tone` colours it for a state. The dialog is 440px wide, the description
 * sits 10px under the title and the buttons 20px under the description.
 */
export const WithIcon: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Deploy</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle icon={<RocketIcon />}>Deploy main to Production?</DialogTitle>
          <DialogDescription>
            Cloud builds the latest commit on main, then swaps the server and the worker one at a time. The shop stays up.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Deploy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Deploy' }));
    const dialog = await within(document.body).findByRole('dialog');
    await waitFor(() => expectPx(dialog.getBoundingClientRect().width, 440));
    // No ✕ by default: Cancel, Escape and the backdrop close the dialog.
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
    const title = dialog.querySelector('[data-slot=dialog-title]')!;
    const description = dialog.querySelector('[data-slot=dialog-description]')!;
    // The footer box reaches 16px up into the gap to cover a scrolled body, so measure its buttons.
    const deploy = within(dialog).getByRole('button', { name: 'Deploy' });
    await expectPx(description.getBoundingClientRect().top - title.getBoundingClientRect().bottom, 10);
    await expectPx(deploy.getBoundingClientRect().top - description.getBoundingClientRect().bottom, 20);
    // A short dialog does not scroll.
    await expect(dialog.scrollHeight).toBe(dialog.clientHeight);
    const icon = dialog.querySelector('[data-slot=dialog-title-icon] svg')!.getBoundingClientRect();
    await expectPx(icon.width, 18);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
  },
};

/** `tone` colours the icon for a state: here a warning. */
export const WithToneIcon: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Restore backup</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle icon={<TriangleAlertIcon />} tone="warning">
            Restore the backup from 09:00?
          </DialogTitle>
          <DialogDescription>
            Changes made after 09:00 are lost. The shop is read-only while the restore runs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Restore</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** `showCloseButton` adds a ✕ for a dialog that has no Cancel button. */
export const WithCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Show details</DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Build details</DialogTitle>
          <DialogDescription>Built from main in 2 min 14 s.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * A long title stops before the close button, and the button is centred on
 * the title's first line.
 */
export const WithCloseButtonLongTitle: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Show details</DialogTrigger>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Build details for the production environment of the storefront</DialogTitle>
          <DialogDescription>Built from main in 2 min 14 s.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show details' }));
    const dialog = await within(document.body).findByRole('dialog');
    // Measure after the entrance: its scale changes every rect.
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    const title = within(dialog).getByRole('heading').getBoundingClientRect();
    const close = within(dialog).getByRole('button', { name: 'Close' }).getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(within(dialog).getByRole('heading')).lineHeight);
    await expect(title.right).toBeLessThanOrEqual(close.left);
    const firstLineCentre = title.top + lineHeight / 2;
    const closeCentre = close.top + close.height / 2;
    // Within a pixel: the centred popup lands on half pixels.
    await expect(Math.abs(closeCentre - firstLineCentre)).toBeLessThanOrEqual(1);
    await userEvent.keyboard('{Escape}');
  },
};

const billingFields = [
  'Company name',
  'Contact name',
  'Email',
  'Phone',
  'Address line 1',
  'Address line 2',
  'City',
  'Postal code',
  'Region',
  'Country',
  'VAT number',
  'Purchase order reference',
];

/**
 * A dialog taller than the viewport stays inside it. The body scrolls; the
 * header and the footer stay in view. Here the footer sits inside the form,
 * as it does when the form submits on Enter.
 */
/**
 * A row of fields wider than the dialog. The dialog keeps its width and its
 * padding: the row gets the width inside the padding, and the date field
 * shrinks and truncates its text.
 */
export const WideRow: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Filter</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter by created date</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" className="shrink-0">is equal to</Button>
          <Button variant="outline" className="min-w-0 flex-1 justify-start">
            <span className="truncate">Pick a date and time for the start of the range</span>
          </Button>
          <Input type="time" aria-label="Time" className="w-28 shrink-0" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button />}>Apply filter</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Filter' }));
    const dialog = await within(document.body).findByRole('dialog');
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    await expectInsidePadding(dialog);
  },
};

export const TallForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit billing details</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit billing details</DialogTitle>
          <DialogDescription>These details appear on every invoice from the next billing period.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <FieldGroup>
            {billingFields.map((label) => {
              const id = `billing-${label.toLowerCase().replaceAll(' ', '-')}`;
              return (
                <Field key={id}>
                  <FieldLabel htmlFor={id}>{label}</FieldLabel>
                  <Input id={id} />
                </Field>
              );
            })}
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Edit billing details' }));
    const dialog = await within(document.body).findByRole('dialog');
    // Measure after the entrance: its scale changes every rect.
    await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
    const header = dialog.querySelector('[data-slot=dialog-header]')!;
    const footer = dialog.querySelector('[data-slot=dialog-footer]')!;
    // Within a pixel: the centred popup lands on half pixels.
    const pinned = () => {
      const box = dialog.getBoundingClientRect();
      expect(Math.abs(header.getBoundingClientRect().top - box.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(footer.getBoundingClientRect().bottom - box.bottom)).toBeLessThanOrEqual(1);
    };
    // The dialog keeps 1rem from the top and the bottom of the viewport, and scrolls inside.
    const box = dialog.getBoundingClientRect();
    await expect(box.top).toBeGreaterThanOrEqual(15);
    await expect(window.innerHeight - box.bottom).toBeGreaterThanOrEqual(15);
    await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    pinned();
    dialog.scrollTop = dialog.scrollHeight;
    await waitFor(pinned);
    dialog.scrollTop = 0;
    // Tab down to the last field: it lands fully clear of the pinned header and footer.
    const last = within(dialog).getByLabelText('Purchase order reference');
    within(dialog).getByLabelText('Company name').focus();
    for (let i = 1; i < billingFields.length; i++) await userEvent.tab();
    await expect(last).toHaveFocus();
    await waitFor(() => {
      const field = last.getBoundingClientRect();
      expect(field.top).toBeGreaterThanOrEqual(header.getBoundingClientRect().bottom);
      expect(field.bottom).toBeLessThanOrEqual(footer.getBoundingClientRect().top);
    });
    // Tab goes from the last field to the footer, and its buttons are in view.
    within(dialog).getByLabelText('Purchase order reference').focus();
    await userEvent.tab();
    await userEvent.tab();
    const save = within(dialog).getByRole('button', { name: 'Save' });
    await expect(save).toHaveFocus();
    await expect(save.getBoundingClientRect().bottom).toBeLessThanOrEqual(dialog.getBoundingClientRect().bottom);
    await waitFor(pinned);
    await userEvent.keyboard('{Escape}');
  },
};

/** Ends with the dialog open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open Dialog' }));
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Are you sure?' })).toBeVisible());
  },
};
