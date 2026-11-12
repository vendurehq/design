import type { Meta, StoryObj } from '@storybook/react';
import { RocketIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { Label } from '../src/components/atoms/label.tsx';
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
    // offsetWidth ignores the dialog's entrance scale.
    const idleWidth = confirm.offsetWidth;

    await userEvent.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy', 'true'));
    await expect(within(confirm).getByRole('status')).toBeInTheDocument();
    await expect(confirm.querySelector('[data-slot=confirm-dialog-label]')?.className).toContain(
      'opacity-0',
    );
    await expect(confirm.offsetWidth).toBe(idleWidth);
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

/** `initialFocus` reaches the popup: here it focuses Cancel. */
export const InitialFocusPassthrough: Story = {
  render: () => (
    <ConfirmDialog
      title="Publish changes?"
      confirmLabel="Publish"
      initialFocus={() =>
        document.querySelector<HTMLElement>(
          '[data-slot=confirm-dialog] [data-slot=alert-dialog-cancel]',
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
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
  },
};

/** The ring a focused dialog button shows: 2px solid at a 2px offset. */
async function expectRing(button: HTMLElement) {
  const style = getComputedStyle(button);
  await expect(style.outlineStyle).toBe('solid');
  await expect(style.outlineWidth).toBe('2px');
  await expect(style.outlineOffset).toBe('2px');
}

/**
 * A dialog that is not destructive focuses Confirm, so Enter confirms. The
 * focused button shows its ring at once, also when a mouse click opened the
 * dialog: with two buttons, the ring is how you see which one Enter presses.
 */
export const DefaultFocusesConfirm: Story = {
  parameters: { pressOpen: { text: 'Open', expectFocus: 'Publish' } },
  render: () => (
    <ConfirmDialog title="Publish changes?" confirmLabel="Publish" onConfirm={() => {}}>
      <Button>Open</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    const publish = within(dialog).getByRole('button', { name: 'Publish' });
    await waitFor(() => expect(publish).toHaveFocus());
    await expectRing(publish);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/**
 * A caution dialog (costly, not destructive) focuses Cancel, shows the ring
 * on it, and draws Confirm as an outline button, the same look as Cancel. The
 * icon stays neutral.
 */
export const CautionFocusesCancel: Story = {
  parameters: { pressOpen: { text: 'Deploy', expectFocus: 'Cancel' } },
  render: () => (
    <ConfirmDialog
      icon={<RocketIcon />}
      title="Deploy main to Production?"
      description="The latest commit failed its pre-deploy check."
      confirmLabel="Deploy anyway"
      variant="caution"
      onConfirm={() => {}}
    >
      <Button variant="outline">Deploy</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Deploy' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    const confirm = within(dialog).getByRole('button', { name: 'Deploy anyway' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await expectRing(cancel);
    await expect(getComputedStyle(confirm).backgroundColor).toBe(getComputedStyle(cancel).backgroundColor);
    await expect(getComputedStyle(confirm).color).toBe(getComputedStyle(cancel).color);
    const icon = dialog.querySelector('[data-slot=confirm-dialog-icon]');
    await expect(icon?.className).toContain('text-muted-foreground');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/** A destructive dialog focuses Cancel, and Cancel shows the ring. */
export const DestructiveCancelShowsRing: Story = {
  parameters: { pressOpen: { text: 'Delete', expectFocus: 'Cancel' } },
  render: () => (
    <ConfirmDialog
      title="Delete product?"
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
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await expectRing(cancel);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/** While Confirm is disabled it cannot take focus: Cancel takes it. */
export const DisabledConfirmFocusesCancel: Story = {
  render: () => (
    <ConfirmDialog
      title="Publish changes?"
      confirmLabel="Publish"
      confirmDisabled
      confirmDisabledReason="Checking the changes…"
      onConfirm={() => {}}
    >
      <Button>Open</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/**
 * A Checkbox in `body` takes focus. The hidden form input it renders beside
 * it is out of the tab order and never does.
 */
export const BodyCheckboxTakesFocus: Story = {
  render: () => (
    <ConfirmDialog
      title="Delete product?"
      confirmLabel="Delete"
      variant="destructive"
      body={
        <Label className="flex items-center gap-2">
          <Checkbox name="deleteVariants" />
          Also delete its variants
        </Label>
      }
      onConfirm={() => {}}
    >
      <Button variant="destructive">Delete</Button>
    </ConfirmDialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete' }));
    const dialog = await within(document.body).findByRole('alertdialog');
    await waitFor(() =>
      expect(within(dialog).getByRole('checkbox', { name: 'Also delete its variants' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};

/** A body with only a hidden input has no field to focus: a destructive dialog focuses Cancel. */
export const BodyHiddenInputFocusesCancel: Story = {
  render: () => (
    <ConfirmDialog
      title="Delete product?"
      confirmLabel="Delete"
      variant="destructive"
      body={
        <p className="text-muted-foreground text-sm">
          <input type="hidden" name="productId" value="42" />
          The product has 3 variants.
        </p>
      }
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
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('alertdialog')).toBeNull());
  },
};
