import type { Meta, StoryObj } from '@storybook/react';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const meta = {
  title: 'Atoms/Forms/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToggleGroup defaultValue={["center"]}>
      <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup variant="outline" defaultValue={["center"]}>
      <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup orientation="vertical" defaultValue={["center"]}>
      <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup multiple defaultValue={["left", "right"]}>
      <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Small: Story = {
  render: () => (
    <ToggleGroup size="sm" defaultValue={["center"]}>
      <ToggleGroupItem value="left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};
