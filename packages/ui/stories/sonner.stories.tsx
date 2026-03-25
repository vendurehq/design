import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { toast } from 'sonner';
import { Button } from '../src/components/ui/button.tsx';
import { Toaster } from '../src/components/ui/sonner.tsx';

const meta = {
  title: 'UI/Feedback/Sonner',
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
