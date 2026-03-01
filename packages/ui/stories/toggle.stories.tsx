import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../src/components/ui/toggle.tsx';
import { Bold, Italic, Underline } from 'lucide-react';

const meta = {
  title: 'UI/Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <Bold /> },
};

export const Outline: Story = {
  args: { variant: 'outline', children: <Italic /> },
};

export const WithText: Story = {
  args: { children: <><Bold /> Bold</> },
};

export const SizeSm: Story = {
  args: { size: 'sm', children: <Underline /> },
};

export const SizeLg: Story = {
  args: { size: 'lg', children: <Bold /> },
};

export const Disabled: Story = {
  args: { disabled: true, children: <Bold /> },
};

export const Pressed: Story = {
  args: { defaultPressed: true, children: <Bold /> },
};
