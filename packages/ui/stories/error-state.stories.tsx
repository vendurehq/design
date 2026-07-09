import type { Meta, StoryObj } from '@storybook/react';
import { FileQuestionIcon } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { ErrorState } from '../src/components/molecules/state-views/error-state.tsx';

const meta = {
  title: 'Molecules/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: 'Something went wrong',
    description: 'The request failed. Try again, or check the server logs if it keeps failing.',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Defaults: alert-triangle icon tinted destructive, default title, `role="alert"`.
export const Playground: Story = {};

// Provide `onRetry` to render the "Try again" button.
export const WithRetry: Story = {
  args: {
    onRetry: () => {},
  },
};

// `retryLabel` overrides the button text (e.g. for i18n).
export const CustomRetryLabel: Story = {
  args: {
    onRetry: () => {},
    retryLabel: 'Reload',
  },
};

// Children are an escape hatch for states where retrying can't help — pass your
// own action instead of (or alongside) `onRetry`.
export const NotFound: Story = {
  args: {
    icon: <FileQuestionIcon />,
    title: 'Page not found',
    description: "The resource you're looking for doesn't exist or was moved.",
    children: (
      <Button variant="outline" size="sm">
        Go back
      </Button>
    ),
  },
};
