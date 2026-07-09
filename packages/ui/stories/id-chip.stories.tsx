import type { Meta, StoryObj } from '@storybook/react';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

const meta = {
  title: 'Molecules/IdChip',
  component: IdChip,
  tags: ['autodocs'],
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    truncate: 'middle',
    copyable: true,
  },
  argTypes: {
    value: { control: 'text' },
    display: { control: 'text' },
    truncate: {
      control: 'inline-radio',
      options: ['middle', 'start', 'none'],
    },
    copyable: { control: 'boolean' },
  },
} satisfies Meta<typeof IdChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The full value is always copied and revealed on hover via `title`.
export const TruncationModes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="middle" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="start" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="none" />
    </div>
  ),
};

// `display` overrides the rendered text but the full `value` is still copied.
export const CustomDisplay: Story = {
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    display: '5c1f8b7e-2f3a-4c9d…',
  },
};

// Read-only IDs drop the copy affordance.
export const NotCopyable: Story = {
  args: { copyable: false },
};
