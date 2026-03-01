import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../src/components/ui/input.tsx';

const meta = {
  title: 'UI/Forms/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Enter your email...' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled input', disabled: true },
};

export const WithValue: Story = {
  args: { defaultValue: 'hello@vendure.io', type: 'email' },
};

export const File: Story = {
  args: { type: 'file' },
};
