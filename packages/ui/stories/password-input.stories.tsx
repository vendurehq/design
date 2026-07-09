import type { Meta, StoryObj } from '@storybook/react';
import { PasswordInput } from '../src/components/molecules/password-input.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Molecules/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Enter your password' },
};

export const WithValue: Story = {
  args: { defaultValue: 'super-secret' },
};

export const Disabled: Story = {
  args: { placeholder: 'Enter your password', disabled: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="password">Password</Label>
      <PasswordInput id="password" placeholder="Enter your password" />
    </div>
  ),
};
