import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { CopyFeedbackProvider } from '../src/components/molecules/copy-feedback-provider.tsx';

const meta = {
  title: 'Molecules/CopyFeedbackProvider',
  component: CopyFeedbackProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Mount once in a client component and wire your toast there. Copy surfaces (CopyableText, CopyButton, IdChip, AnonymizedToken, CodeBlock) call it when they get no `onCopied` or `onCopyError` prop. Use it when the copy surface renders from a server component, which cannot pass function props. The design system never toasts.',
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof CopyFeedbackProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// The status line stands in for the app's toast.
function FeedbackDemo() {
  const [message, setMessage] = useState('Copy a value to see the feedback.');
  return (
    <CopyFeedbackProvider
      onCopied={() => setMessage('Copied to clipboard.')}
      onCopyError={(error) => setMessage(`Copy failed: ${error.message}`)}
    >
      <div className="flex flex-col items-start gap-3">
        <CopyableText value="ORD-100234">
          <span className="font-mono text-sm">ORD-100234</span>
        </CopyableText>
        <CopyableText value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />
        <p role="status" className="text-muted-foreground text-sm">
          {message}
        </p>
      </div>
    </CopyFeedbackProvider>
  );
}

export const Default: Story = {
  render: () => <FeedbackDemo />,
};
