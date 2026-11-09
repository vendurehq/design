import type { Meta, StoryObj } from '@storybook/react';
import { RocketIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { Field, FieldDescription, FieldLabel } from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { ConfirmDialog } from '../src/components/molecules/confirm-dialog.tsx';

const meta = {
  title: 'Molecules/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  // Every story is render-based (the dialog needs a trigger child), so these
  // args exist only to satisfy the required-prop contract of `Story`.
  args: {
    title: 'Publish changes?',
    onConfirm: () => {},
  },
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

/**
 * `confirmDisabled` holds the confirm button while the dialog cannot be
 * confirmed yet, here while the warnings it must show are loading. The
 * optional `confirmDisabledReason` sits beside the buttons. Cancel stays live.
 */
export const ConfirmDisabledWhileLoading: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [warnings, setWarnings] = useState<string[] | null>(null);

    useEffect(() => {
      if (!open) return;
      setWarnings(null);
      const id = setTimeout(() => setWarnings(['2 running jobs will restart.']), 2000);
      return () => clearTimeout(id);
    }, [open]);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Change runtime</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Change the Node.js runtime?"
          description={
            warnings === null
              ? 'Checking what this change affects…'
              : `The environment redeploys. ${warnings.join(' ')}`
          }
          confirmLabel="Change runtime"
          confirmDisabled={warnings === null}
          confirmDisabledReason="Loading warnings…"
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1000))}
        />
      </>
    );
  },
};

/**
 * `icon` sits inline before the title. It stays neutral, and takes the
 * destructive tone only on a destructive dialog.
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <ConfirmDialog
        icon={<RocketIcon />}
        title="Deploy to production?"
        description="This kicks off a build and rolls it out to customers."
        confirmLabel="Deploy"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
      >
        <Button>Deploy</Button>
      </ConfirmDialog>
      <ConfirmDialog
        icon={<Trash2Icon />}
        title="Delete product?"
        description="This permanently removes the product and its variants."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => console.log('deleted')}
      >
        <Button variant="destructive">Delete</Button>
      </ConfirmDialog>
    </div>
  ),
};

/**
 * `body` holds a field between the description and the buttons. Here the user
 * types the environment name, and `confirmDisabled` holds the delete until it
 * matches. The field is the first focusable element, so it takes focus.
 */
export const TypeToConfirm: Story = {
  render: function Render() {
    const name = 'production';
    const [value, setValue] = useState('');
    return (
      <ConfirmDialog
        icon={<Trash2Icon />}
        title="Delete environment?"
        description="This permanently removes the environment, its deployments and its data."
        body={
          <Field>
            <FieldLabel htmlFor="confirm-environment-name">Environment name</FieldLabel>
            <Input
              id="confirm-environment-name"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={name}
              autoComplete="off"
              spellCheck={false}
            />
            <FieldDescription>
              Type <strong className="text-foreground font-medium">{name}</strong> to confirm.
            </FieldDescription>
          </Field>
        }
        confirmLabel="Delete environment"
        variant="destructive"
        confirmDisabled={value !== name}
        onOpenChange={(open) => {
          if (!open) setValue('');
        }}
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1000))}
      >
        <Button variant="destructive">Delete environment</Button>
      </ConfirmDialog>
    );
  },
};

/**
 * `initialFocus` overrides the default. A confirm that is not destructive but
 * costly can focus Cancel, so Enter does not start it.
 */
export const InitialFocusOnCancel: Story = {
  render: () => (
    <ConfirmDialog
      title="Publish changes?"
      description="These changes will be visible to customers immediately."
      confirmLabel="Publish"
      initialFocus={() =>
        document.querySelector<HTMLElement>(
          '[data-slot=confirm-dialog] [data-slot=alert-dialog-cancel]',
        ) ?? true
      }
      onConfirm={() => console.log('published')}
    >
      <Button>Publish</Button>
    </ConfirmDialog>
  ),
};
