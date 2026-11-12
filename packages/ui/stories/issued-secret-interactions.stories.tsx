import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../src/components/atoms/dialog.tsx';
import {
  IssuedSecret,
  IssuedSecretFooter,
  useIssuedSecretGuard,
} from '../src/components/molecules/issued-secret.tsx';

// Mounted interaction tests for IssuedSecret and its close guard. The test
// runner (CI step "Storybook a11y smoke test") runs each `play` in a real
// browser. The dialog renders in a portal on `body`, so the queries run
// against `document.body`. The cases follow the Console's issued-secret tests.

const KEY = 'vk_test_example_0000';
const writeText = fn(async (_text: string) => {});
const onClose = fn();

function stubClipboard() {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  writeText.mockReset();
  writeText.mockImplementation(async () => {});
  onClose.mockReset();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  return () => {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  };
}

function Harness({ formats }: { formats?: boolean }) {
  const [open, setOpen] = useState(true);
  const guard = useIssuedSecretGuard(() => {
    onClose();
    setOpen(false);
  });
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Create API key
      </Button>
      <Dialog open={open} onOpenChange={guard.onOpenChange}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>API key created</DialogTitle>
            <DialogDescription>Copy the key now.</DialogDescription>
          </DialogHeader>
          {formats ? (
            <IssuedSecret
              guard={guard}
              secretName="API key"
              name="Deploy bot"
              formats={[
                { label: 'Copy as environment variable', hint: 'For a .env file.', value: `API_KEY=${KEY}` },
                { label: 'Copy key only', value: KEY },
              ]}
            />
          ) : (
            <IssuedSecret guard={guard} secretName="API key" name="Deploy bot" value={KEY} />
          )}
          <IssuedSecretFooter guard={guard} />
        </DialogContent>
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Molecules/IssuedSecret/Interactions',
  component: Harness,
  beforeEach: stubClipboard,
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

const body = () => within(document.body);
const dialog = () => body().queryByRole('dialog');

/** The value is never rendered; the first copy button takes focus. */
export const NeverRendersTheValue: Story = {
  play: async () => {
    const copy = await body().findByRole('button', { name: 'Copy API key' });
    await waitFor(() => expect(copy).toHaveFocus());
    await waitFor(() => expect(body().getByText('You can copy the API key only now.')).toBeVisible());
    await expect(document.body.innerHTML).not.toContain(KEY);
  },
};

/** Each format copies its own text, and Done then closes. */
export const CopiesEachFormatThenDoneCloses: Story = {
  args: { formats: true },
  play: async () => {
    const b = body();
    const env = await b.findByRole('button', { name: 'Copy as environment variable' });
    await expect(env).toHaveAccessibleDescription('For a .env file.');
    await userEvent.click(env);
    await expect(writeText).toHaveBeenLastCalledWith(`API_KEY=${KEY}`);
    await userEvent.click(b.getByRole('button', { name: 'Copy key only' }));
    await expect(writeText).toHaveBeenLastCalledWith(KEY);
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog()).toBeNull());
  },
};

/** Before a copy, Done, the ✕ and Escape warn instead of closing. Only the second action closes. */
export const WarnsBeforeClosingWithoutCopy: Story = {
  play: async () => {
    const b = body();
    await b.findByRole('dialog');
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await waitFor(async () => expect(await b.findByText('The API key is not copied')).toBeVisible());
    // The focus goes back to the copy button, so a second Enter copies.
    await waitFor(() => expect(b.getByRole('button', { name: 'Copy API key' })).toHaveFocus());

    await userEvent.click(b.getByRole('button', { name: 'Close' }));
    await userEvent.keyboard('{Escape}');
    await expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(b.getByRole('dialog')).toBeVisible());

    await userEvent.click(b.getByRole('button', { name: 'Close without copying' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
};

/** A copy after the warning removes it, and Done closes at once. */
export const CopyAfterWarningClears: Story = {
  play: async () => {
    const b = body();
    await b.findByRole('dialog');
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await b.findByText('The API key is not copied');
    await userEvent.click(b.getByRole('button', { name: 'Copy API key' }));
    await waitFor(() => expect(b.queryByText('The API key is not copied')).toBeNull());
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
};

/** The clipboard refuses: the value shows selected in a read-only field, and a copy by hand counts. */
export const ShowsTheValueWhenTheClipboardFails: Story = {
  play: async () => {
    writeText.mockImplementation(async () => {
      throw new DOMException('Denied', 'NotAllowedError');
    });
    const b = body();
    await userEvent.click(await b.findByRole('button', { name: 'Copy API key' }));
    const field = (await b.findByRole('textbox', { name: 'API key' })) as HTMLInputElement;
    await expect(field).toHaveValue(KEY);
    await expect(field).toHaveAttribute('readonly');
    await waitFor(() => expect(field).toHaveFocus());
    await expect(field.selectionEnd! - field.selectionStart!).toBe(KEY.length);

    field.dispatchEvent(new Event('copy', { bubbles: true }));
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
};

/** Closing resets the guard: the next secret starts uncopied. */
export const ResetsForTheNextSecret: Story = {
  play: async ({ canvasElement }) => {
    const b = body();
    await userEvent.click(await b.findByRole('button', { name: 'Copy API key' }));
    await userEvent.click(b.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(dialog()).toBeNull());

    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Create API key' }));
    await userEvent.click(await b.findByRole('button', { name: 'Done' }));
    // The dialog is still fading in: wait for the warning to be visible.
    const warning = await b.findByText('The API key is not copied');
    await waitFor(() => expect(warning).toBeVisible());
  },
};
