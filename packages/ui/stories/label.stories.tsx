import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Email address' },
};
