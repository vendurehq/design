import type { Meta, StoryObj } from '@storybook/react';
import { KeyRoundIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../src/components/atoms/dialog.tsx';
import { InlineCode } from '../src/components/molecules/inline-code.tsx';
import {
  IssuedSecret,
  type IssuedSecretFormat,
  IssuedSecretFooter,
  useIssuedSecretGuard,
} from '../src/components/molecules/issued-secret.tsx';

// Obviously fake values: never put a real-looking key in a story.
const API_KEY = 'vk_test_example_0000';

/** Replaces `navigator.clipboard` for one story; the cleanup puts it back. */
function stubClipboard(writeText: (text: string) => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
  return () => {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  };
}

const allowClipboard = () => stubClipboard(async () => {});
const refuseClipboard = () =>
  stubClipboard(async () => {
    throw new DOMException('Denied', 'NotAllowedError');
  });

type DemoProps = Omit<ComponentProps<typeof IssuedSecret>, 'guard'> & {
  title?: string;
  description?: string;
  doneLabel?: string;
  closeAnywayLabel?: string;
};

/** A dialog that opens with a new API key, as a consumer builds it. */
function IssuedSecretDialog({
  title = 'API key created',
  description = 'Copy the key now. If you lose it, revoke it and create a new one.',
  doneLabel,
  closeAnywayLabel,
  ...props
}: DemoProps) {
  const [open, setOpen] = useState(true);
  const guard = useIssuedSecretGuard(() => setOpen(false));
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Create API key
      </Button>
      <Dialog open={open} onOpenChange={guard.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle icon={<KeyRoundIcon />}>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <IssuedSecret {...(props as ComponentProps<typeof IssuedSecret>)} guard={guard} />
          <IssuedSecretFooter
            guard={guard}
            doneLabel={doneLabel}
            closeAnywayLabel={closeAnywayLabel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

const ENV_FORMATS: IssuedSecretFormat[] = [
  {
    label: 'Copy as environment variable',
    hint: (
      <>
        For a .env file: <InlineCode>VENDURE_API_KEY=&lt;key&gt;</InlineCode>
      </>
    ),
    value: `VENDURE_API_KEY=${API_KEY}`,
  },
  {
    label: 'Copy key only',
    hint: 'For the value field of a secret store.',
    value: API_KEY,
  },
];

const meta = {
  title: 'Molecules/IssuedSecret',
  component: IssuedSecretDialog,
  parameters: { layout: 'centered' },
  args: { secretName: 'API key', name: 'Deploy bot', value: API_KEY },
  beforeEach: allowClipboard,
} satisfies Meta<typeof IssuedSecretDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const dialog = () => within(document.body).findByRole('dialog');

/** Before the copy: one primary Copy button, the value is nowhere on the page. */
export const BeforeCopy: Story = {
  play: async () => {
    const body = within(await dialog());
    await waitFor(() => expect(body.getByRole('button', { name: 'Copy API key' })).toHaveFocus());
    await expect(document.body.innerHTML).not.toContain(API_KEY);
  },
};

/** After the copy: the button says Copied for a moment, and Done takes the primary look. */
export const AfterCopy: Story = {
  play: async () => {
    const body = within(await dialog());
    await userEvent.click(body.getByRole('button', { name: 'Copy API key' }));
    await waitFor(() => expect(body.getByRole('button', { name: 'Copied' })).toBeVisible());
    await expect(document.body.innerHTML).not.toContain(API_KEY);
  },
};

/** A close before the copy: the warning shows, and "Close without copying" replaces Done. */
export const CloseWarning: Story = {
  play: async () => {
    const body = within(await dialog());
    await userEvent.click(body.getByRole('button', { name: 'Done' }));
    await waitFor(async () => expect(await body.findByText('The API key is not copied')).toBeVisible());
    await waitFor(() => expect(body.getByRole('button', { name: 'Close without copying' })).toBeVisible());
  },
};

/** The clipboard refuses: the value shows, selected, in a read-only field. */
export const ClipboardFallback: Story = {
  beforeEach: refuseClipboard,
  play: async () => {
    const body = within(await dialog());
    await userEvent.click(body.getByRole('button', { name: 'Copy API key' }));
    const field = await body.findByRole('textbox', { name: 'API key' });
    await expect(field).toHaveValue(API_KEY);
    await expect(field).toHaveAttribute('readonly');
  },
};

/** One button per format, each with a hint that says where the copy goes. */
export const SeveralFormats: Story = {
  args: { value: undefined, formats: ENV_FORMATS },
  play: async () => {
    const body = within(await dialog());
    await expect(body.getByRole('button', { name: 'Copy as environment variable' })).toHaveAccessibleDescription(
      'For a .env file: VENDURE_API_KEY=<key>',
    );
    await expect(document.body.innerHTML).not.toContain(API_KEY);
  },
};

/** Facts of the issue that are not secret go in `children`, under the name. */
export const WithDetails: Story = {
  args: {
    secretName: 'password',
    name: 'Initial administrator',
    title: 'Administrator created',
    description: 'Copy the password now. The administrator changes it at the first sign-in.',
    children: (
      <p className="text-muted-foreground text-sm">
        Sign in as <InlineCode>admin@example.com</InlineCode>
      </p>
    ),
  },
};

/** Every built-in text can be replaced, for example by a translation. */
export const Translated: Story = {
  args: {
    title: 'API-Schlüssel erstellt',
    description: 'Kopieren Sie den Schlüssel jetzt.',
    secretName: 'API-Schlüssel',
    copyLabel: 'API-Schlüssel kopieren',
    copiedLabel: 'Kopiert',
    notice: 'Sie können den API-Schlüssel nur jetzt kopieren.',
    fallbackDescription:
      'Die Zwischenablage ist nicht verfügbar. Markieren und kopieren Sie den API-Schlüssel von Hand.',
    warningTitle: 'Der API-Schlüssel ist nicht kopiert',
    warningDescription:
      'Nach dem Schließen können Sie ihn nicht mehr kopieren. Kopieren Sie ihn jetzt, oder schließen Sie ohne Kopie.',
    doneLabel: 'Fertig',
    closeAnywayLabel: 'Ohne Kopie schließen',
  },
};
