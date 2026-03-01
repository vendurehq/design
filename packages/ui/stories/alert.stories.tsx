import type { Meta, StoryObj } from '@storybook/react';
import { TerminalIcon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '../src/components/ui/alert.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/Feedback/Alert',
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
