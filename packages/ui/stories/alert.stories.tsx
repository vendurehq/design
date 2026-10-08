import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { TerminalIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '../src/components/atoms/alert.tsx';
import { Button } from '../src/components/atoms/button.tsx';

const meta = {
  title: 'Atoms/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">
          Retry
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <TerminalIcon />
      <AlertTitle>Terminal</AlertTitle>
      <AlertDescription>
        You can run commands in the terminal to manage your project.
      </AlertDescription>
    </Alert>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Destructive text uses destructive-subtle-foreground, which reaches 4.5:1 on
 * every surface in both modes. Pinned to the light page theme.
 */
export const DestructiveLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <Alert variant="destructive">
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>The card was declined. Ask the customer for another card.</AlertDescription>
        </Alert>
      )}
    </LightAndDark>
  ),
};
