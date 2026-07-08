import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../src/components/atoms/spinner.tsx';

const meta = {
  title: 'Atoms/General/Spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Spinner />,
};
