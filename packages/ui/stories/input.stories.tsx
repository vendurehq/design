import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Input } from '../src/components/atoms/input.tsx';

const meta = {
  title: 'Atoms/Forms/Input',
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

// The Input is a plain <input>, so controlled usage (and react-hook-form's
// isDirty) works as expected. A null value is coerced to "" rather than
// flipping the field to uncontrolled.
export const Controlled: Story = {
  render: function InputControlled() {
    const [value, setValue] = useState('');
    return (
      <Input
        placeholder="Type something..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  },
};
