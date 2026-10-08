import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../src/components/atoms/toggle.tsx';
import { Bold, Italic, Underline } from 'lucide-react';

const meta = {
  title: 'Atoms/Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Bold', children: <Bold /> },
};

export const Outline: Story = {
  args: { variant: 'outline', 'aria-label': 'Italic', children: <Italic /> },
};

export const WithText: Story = {
  args: { children: <><Bold /> Bold</> },
};

export const SizeSm: Story = {
  args: { size: 'sm', 'aria-label': 'Underline', children: <Underline /> },
};

export const SizeLg: Story = {
  args: { size: 'lg', 'aria-label': 'Bold', children: <Bold /> },
};

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Bold', children: <Bold /> },
};

export const Pressed: Story = {
  args: { defaultPressed: true, 'aria-label': 'Bold', children: <Bold /> },
};
