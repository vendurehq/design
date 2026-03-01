import type { Meta, StoryObj } from '@storybook/react';
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '../src/components/ui/progress.tsx';

const meta = {
  title: 'UI/Data Display/Progress',
  component: Progress,
  tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={50} />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={65}>
        <ProgressLabel>Uploading files...</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={100}>
        <ProgressLabel>Upload complete</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
};
