import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../src/components/ui/textarea.tsx';

const meta = {
  title: 'UI/Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Type your message here...' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled textarea', disabled: true },
};

export const WithValue: Story = {
  args: { defaultValue: 'This is some existing content in the textarea.' },
};
