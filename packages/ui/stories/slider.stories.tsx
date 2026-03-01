import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '../src/components/ui/slider.tsx';

const meta = {
  title: 'UI/Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: [50], max: 100 },
};

export const Range: Story = {
  args: { defaultValue: [25, 75], max: 100 },
};

export const Vertical: Story = {
  args: { defaultValue: [50], max: 100, orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div style={{ height: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { defaultValue: [50], max: 100, disabled: true },
};
