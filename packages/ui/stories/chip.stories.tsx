import type { Meta, StoryObj } from '@storybook/react';
import { TagIcon } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '../src/components/molecules/chip.tsx';

const meta = {
  title: 'Molecules/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: {
    children: 'Summer Sale',
    variant: 'default',
    disabled: false,
  },
  argTypes: {
    children: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'primary', 'brand', 'destructive', 'outline'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// A static chip: no `onRemove`, so no × button.
export const Static: Story = {
  args: { children: 'Read only' },
};

// `onRemove` presence gates the × button; `removeLabel` names it for a11y.
export const Removable: Story = {
  args: {
    children: 'Removable',
    onRemove: () => console.log('remove'),
    removeLabel: 'Remove Removable',
  },
};

// Leading icon slot.
export const WithIcon: Story = {
  args: {
    icon: <TagIcon />,
    children: 'Featured',
    onRemove: () => console.log('remove'),
    removeLabel: 'Remove Featured',
  },
};

// Secondary text is a composition, not a prop.
export const WithSecondaryText: Story = {
  render: () => (
    <Chip onRemove={() => {}} removeLabel="Remove Red from Color">
      Red <span className="text-muted-foreground">in Color</span>
    </Chip>
  ),
};

// `disabled` dims the chip and blocks removal — e.g. a pending un-assign mutation.
export const Disabled: Story = {
  args: {
    children: 'Pending removal',
    disabled: true,
    onRemove: () => console.log('remove'),
    removeLabel: 'Remove Pending removal',
  },
};

// A live list — the caller closes over each item's id in its own `onRemove`.
export const RemovableList: Story = {
  render: () => {
    const [tags, setTags] = useState(['Apparel', 'Footwear', 'Accessories', 'Outerwear']);
    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip
            key={tag}
            onRemove={() => setTags((current) => current.filter((t) => t !== tag))}
            removeLabel={`Remove ${tag}`}
          >
            {tag}
          </Chip>
        ))}
      </div>
    );
  },
};
