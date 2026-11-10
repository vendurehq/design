import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../src/components/atoms/button.tsx';
import { Toaster } from '../src/components/atoms/sonner.tsx';

const meta = {
  title: 'Atoms/Feedback/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    // Follow the Storybook theme, so html carries one theme class and the
    // toaster runs Sonner's matching theme.
    (Story, context) => (
      <ThemeProvider attribute="class" forcedTheme={context.globals.theme === 'dark' ? 'dark' : 'light'}>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <Button onClick={() => toast('Event has been created')}>Show Toast</Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Successfully saved!', {
            description: 'Your changes have been persisted.',
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('Something went wrong', {
            description: 'Please try again or contact support.',
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('Please review your input', {
            description: 'Some fields may need attention.',
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('Price list updated', {
            description: 'New prices apply to orders placed from now on.',
          })
        }
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.loading('Exporting orders…')}
      >
        Loading
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: { label: 'Undo', onClick: () => {} },
          })
        }
      >
        With Action
      </Button>
    </div>
  ),
};

/** The toaster sits bottom right by default; `position` moves it. */
export const TopCenter: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster position="top-center" />
      <Button onClick={() => toast.success('Order shipped')}>Show Toast</Button>
    </div>
  ),
};

/**
 * Each toast type shows the icon of its StatusBadge tone, from the shared
 * `toneIcons` map: success, warning, error (`critical`), info and loading
 * (`progress`).
 */
export const ToneIcons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster visibleToasts={5} />
      <Button
        variant="outline"
        onClick={() => {
          toast.success('Order shipped');
          toast.warning('Stock is running low');
          toast.error('Payment failed');
          toast.info('Price list updated');
          toast.loading('Exporting orders…');
        }}
      >
        Show every tone
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Show every tone' }));
    const iconOf = async (title: string) => {
      const text = await within(document.body).findByText(title);
      return text.closest('[data-sonner-toast]')?.querySelector('svg')?.getAttribute('class') ?? '';
    };
    await expect(await iconOf('Order shipped')).toContain('lucide-circle-check');
    await expect(await iconOf('Stock is running low')).toContain('lucide-triangle-alert');
    await expect(await iconOf('Payment failed')).toContain('lucide-circle-x');
    await expect(await iconOf('Price list updated')).toContain('lucide-circle-dot');
    await expect(await iconOf('Exporting orders…')).toMatch(/lucide-loader(\s|$)/);
    // The stack fades each older toast; clear it, so the a11y scan reads the
    // page and not a toast mid-fade.
    toast.dismiss();
    await waitFor(() => expect(document.querySelector('[data-sonner-toast]')).toBeNull());
  },
};

/**
 * One edge: the overlay shadow's 1px edge, with no border and no inset
 * hairline next to it. The icon sits 14px in and 10px from the text. A plain
 * toast draws the icon you pass in the foreground colour at 60%.
 */
export const Edge: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster duration={Infinity} />
      <Button
        variant="outline"
        onClick={() => toast('Log downloaded', { icon: <DownloadIcon className="size-4 stroke-2" /> })}
      >
        Plain
      </Button>
      <Button variant="outline" onClick={() => toast.success('Order shipped')}>
        Success
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Plain' }));
    const title = await within(document.body).findByText('Log downloaded');
    const toastEl = title.closest<HTMLElement>('[data-sonner-toast]');
    if (!toastEl) throw new Error('no toast');
    const style = getComputedStyle(toastEl);
    await expect(style.borderTopWidth).toBe('0px');
    await expect(style.borderRadius).toBe('12px');
    const box = toastEl.getBoundingClientRect();
    const icon = toastEl.querySelector('svg')!.getBoundingClientRect();
    await expect(icon.left - box.left).toBeCloseTo(14, 0);
    await expect(title.getBoundingClientRect().left - icon.right).toBeCloseTo(10, 0);
    await expect(getComputedStyle(toastEl.querySelector('[data-icon]')!).color).toContain('/ 0.6');
    // Sonner's own --success-text must not reach the icon: it takes the token.
    await userEvent.click(canvas.getByRole('button', { name: 'Success' }));
    const success = await within(document.body).findByText('Order shipped');
    const probe = document.createElement('span');
    probe.className = 'text-success-text';
    document.body.append(probe);
    const token = getComputedStyle(probe).color;
    probe.remove();
    const successIcon = success.closest('[data-sonner-toast]')!.querySelector('svg')!;
    await expect(getComputedStyle(successIcon).color).toBe(token);
    toast.dismiss();
    await waitFor(() => expect(document.querySelector('[data-sonner-toast]')).toBeNull());
  },
};

/**
 * A toast with an action and a cancel button. Both look like an extra-small
 * Button: the action as the default variant, the cancel as ghost.
 */
export const WithAction: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster duration={Infinity} />
      <Button
        variant="outline"
        onClick={() =>
          toast('Variant deleted', {
            action: { label: 'Undo', onClick: () => {} },
            cancel: { label: 'Dismiss', onClick: () => {} },
          })
        }
      >
        Delete variant
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete variant' }));
    const title = await within(document.body).findByText('Variant deleted');
    const toastEl = title.closest<HTMLElement>('[data-sonner-toast]');
    if (!toastEl) throw new Error('no toast');
    // The extra-small primary Button's box and colours, read from a probe.
    const probe = document.createElement('span');
    probe.className = 'block h-6 rounded-lg px-2 text-xs font-medium bg-primary text-primary-foreground';
    document.body.append(probe);
    const { borderRadius, height, paddingLeft, fontSize, fontWeight, backgroundColor, color } =
      getComputedStyle(probe);
    const reference = { borderRadius, height, paddingLeft, fontSize, fontWeight, backgroundColor, color };
    probe.remove();
    for (const name of ['Undo', 'Dismiss']) {
      const style = getComputedStyle(within(toastEl).getByRole('button', { name }));
      await expect(style.borderRadius).toBe(reference.borderRadius);
      await expect(style.height).toBe(reference.height);
      await expect(style.paddingLeft).toBe(reference.paddingLeft);
      await expect(style.fontSize).toBe(reference.fontSize);
      await expect(style.fontWeight).toBe(reference.fontWeight);
    }
    const undo = getComputedStyle(within(toastEl).getByRole('button', { name: 'Undo' }));
    await expect(undo.backgroundColor).toBe(reference.backgroundColor);
    await expect(undo.color).toBe(reference.color);
    toast.dismiss();
    await waitFor(() => expect(document.querySelector('[data-sonner-toast]')).toBeNull());
  },
};
