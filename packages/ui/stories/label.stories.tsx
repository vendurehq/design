import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../src/components/ui/label.tsx';

const meta = {
  title: 'UI/Forms/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Email address' },
};
