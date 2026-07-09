import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../src/components/atoms/badge.tsx';
import {
  CopyableText,
  CopyButton,
} from '../src/components/molecules/copyable-text.tsx';

const meta = {
  title: 'Molecules/CopyableText',
  component: CopyableText,
  tags: ['autodocs'],
  args: {
    value: 'sk_live_51H8xY2eZvKflj9aQ',
  },
  argTypes: {
    value: { control: 'text' },
    timeout: { control: 'number' },
  },
} satisfies Meta<typeof CopyableText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// No children → the value renders as plain text beside the button.
export const PlainValue: Story = {
  args: { value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f' },
};

// Children are rendered untouched — the molecule styles nothing but the layout.
export const CustomChildren: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <CopyableText value="ORD-100234">
        <span className="font-mono text-sm">ORD-100234</span>
      </CopyableText>
      <CopyableText value="ORD-100234">
        <Badge variant="outline">ORD-100234</Badge>
      </CopyableText>
    </div>
  ),
};

// CopyButton stands alone. Wire onCopied/onCopyError to your toast — the DS never toasts.
export const StandaloneButton: Story = {
  render: () => (
    <CopyButton
      value="copied via CopyButton"
      onCopied={() => console.log('copied')}
      onCopyError={(e) => console.error(e)}
    />
  ),
};
