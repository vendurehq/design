import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../src/components/ui/spinner.tsx';

const meta = {
  title: 'UI/General/Spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Spinner />,
};
