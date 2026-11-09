import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { toast } from 'sonner';
import { Button } from '../src/components/atoms/button.tsx';
import { Toaster } from '../src/components/atoms/sonner.tsx';

const meta = {
  title: 'Atoms/Feedback/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
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
