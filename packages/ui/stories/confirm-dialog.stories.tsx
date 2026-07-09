import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { ConfirmDialog } from '../src/components/molecules/confirm-dialog.tsx';

const meta = {
  title: 'Molecules/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uncontrolled: pass the trigger as children; the dialog manages its own open
// state.
export const Uncontrolled: Story = {
  render: () => (
    <ConfirmDialog
      title="Publish changes?"
      description="These changes will be visible to customers immediately."
      onConfirm={() => console.log('confirmed')}
    >
      <Button>Publish</Button>
    </ConfirmDialog>
  ),
};

// `variant="destructive"` tints the confirm action for irreversible actions.
export const Destructive: Story = {
  render: () => (
    <ConfirmDialog
      title="Delete environment?"
      description="This permanently removes the environment and all of its data."
      variant="destructive"
      confirmLabel="Delete"
      onConfirm={() => console.log('deleted')}
    >
      <Button variant="destructive">Delete</Button>
    </ConfirmDialog>
  ),
};

// When `onConfirm` returns a promise, the dialog stays open, disables both
// buttons and shows a spinner until it resolves (and stays open on reject).
export const AsyncPending: Story = {
  render: () => (
    <ConfirmDialog
      title="Deploy to production?"
      description="This kicks off a build and rollout."
      confirmLabel="Deploy"
      onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
    >
      <Button>Deploy</Button>
    </ConfirmDialog>
  ),
};

// Controlled: drive `open`/`onOpenChange` yourself — the shared pattern for
// opening a confirm from a menu item or programmatically.
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open confirm</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Discard draft?"
          description="Your unsaved changes will be lost."
          confirmLabel="Discard"
          variant="destructive"
          onConfirm={() => console.log('discarded')}
        />
      </>
    );
  },
};
