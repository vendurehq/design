import type { Meta, StoryObj } from '@storybook/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { ConfirmDialog } from '../src/components/molecules/confirm-dialog.tsx';

// Mounted interaction tests for ConfirmDialog. The test runner (CI step
// "Storybook a11y smoke test") runs each `play` in a real browser. The dialog
// renders in a portal on `body`, so the queries run against `document.body`.

const meta = {
  title: 'Molecules/ConfirmDialog/Interactions',
  component: ConfirmDialog,
  args: { title: 'Delete product?', onConfirm: () => {} },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A promise the test settles by hand. */
function deferred() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

let pendingConfirm = deferred();

/** A destructive dialog focuses Cancel, so Enter never confirms by accident. */
export const DestructiveFocusesCancel: Story = {
  render: () => (
    <ConfirmDialog
      icon={<Trash2Icon />}
      title="Delete product?"
      description="This permanently removes the product."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={() => {}}
    >
      <Button variant="destructive">Delete</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
    // The icon takes the destructive tone and stays out of the accessible name.
    const icon = dialog.querySelector('[data-slot=confirm-dialog-icon]');
    await expect(icon).toHaveAttribute('aria-hidden', 'true');
    await expect(icon?.className).toContain('text-destructive-text');
    await expect(within(dialog).getByRole('heading')).toHaveTextContent('Delete product?');
  },
};

/** While `onConfirm` runs, a spinner replaces the label and the button keeps its width. */
export const BusyKeepsWidth: Story = {
  beforeEach: () => {
    pendingConfirm = deferred();
  },
  render: () => (
    <ConfirmDialog
      title="Deploy to production?"
      confirmLabel="Deploy to production"
      onConfirm={() => pendingConfirm.promise}
    >
      <Button>Deploy</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Deploy' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: /Deploy to production/ });
    const idleWidth = confirm.getBoundingClientRect().width;

    await userEvent.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy', 'true'));
    await expect(within(confirm).getByRole('status')).toBeInTheDocument();
    await expect(confirm.querySelector('[data-slot=confirm-dialog-label]')?.className).toContain(
      'opacity-0',
    );
    await expect(confirm.getBoundingClientRect().width).toBe(idleWidth);
    await expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();

    pendingConfirm.resolve();
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/** The `body` field takes focus, and confirm stays disabled until the name matches. */
export const TypeToConfirmEnablesAction: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <ConfirmDialog
        title="Delete environment?"
        body={
          <Input
            aria-label="Environment name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        }
        confirmLabel="Delete environment"
        variant="destructive"
        confirmDisabled={value !== 'staging'}
        onConfirm={() => {}}
      >
        <Button variant="destructive">Delete environment</Button>
      </ConfirmDialog>
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Delete environment' }),
    );
    const dialog = await within(document.body).findByRole('alertdialog');
    const field = within(dialog).getByRole('textbox', { name: 'Environment name' });
    const confirm = within(dialog).getByRole('button', { name: 'Delete environment' });
    await waitFor(() => expect(field).toHaveFocus());
    await expect(confirm).toBeDisabled();

    await userEvent.type(field, 'stag');
    await expect(confirm).toBeDisabled();
    await userEvent.type(field, 'ing');
    await expect(confirm).toBeEnabled();
  },
};

/** `initialFocus` reaches the popup: here it focuses the confirm action. */
export const InitialFocusPassthrough: Story = {
  render: () => (
    <ConfirmDialog
      title="Publish changes?"
      confirmLabel="Publish"
      initialFocus={() =>
        document.querySelector<HTMLElement>(
          '[data-slot=confirm-dialog] [data-slot=alert-dialog-action]',
        ) ?? true
      }
      onConfirm={() => {}}
    >
      <Button>Open</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Publish' })).toHaveFocus(),
    );
  },
};
