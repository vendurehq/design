import type { Meta, StoryObj } from '@storybook/react';
import {
  DescriptionDetail,
  DescriptionItem,
  DescriptionList,
  DescriptionListItem,
  DescriptionTerm,
} from '../src/components/molecules/description-list.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

const meta = {
  title: 'Molecules/DescriptionList',
  component: DescriptionList,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal', 'responsive'],
    },
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

// `DescriptionListItem` is the sugar covering the common term/detail pair; the
// value goes in as children, never a `value` prop.
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <DescriptionList {...args} className="max-w-md">
      <DescriptionListItem label="Environment">Production</DescriptionListItem>
      <DescriptionListItem label="Region">eu-central-1</DescriptionListItem>
      <DescriptionListItem label="Image" className="font-mono">
        vendure/server:3.4.0
      </DescriptionListItem>
    </DescriptionList>
  ),
};

// Horizontal collapses each item to `display: contents` so terms and details
// line up in one shared two-column grid.
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <DescriptionList {...args} className="max-w-md">
      <DescriptionListItem label="Status">
        <StatusBadge tone="success">Running</StatusBadge>
      </DescriptionListItem>
      <DescriptionListItem label="Environment">Production</DescriptionListItem>
      <DescriptionListItem label="Region">eu-central-1</DescriptionListItem>
    </DescriptionList>
  ),
};

// Responsive stacks under its container width and switches to the grid at `@md`.
// Resize the story frame to see it flip.
export const Responsive: Story = {
  args: { orientation: 'responsive' },
  render: (args) => (
    <div className="max-w-md resize-x overflow-auto rounded-md border p-4">
      <DescriptionList {...args}>
        <DescriptionListItem label="Environment">Production</DescriptionListItem>
        <DescriptionListItem label="Region">eu-central-1</DescriptionListItem>
        <DescriptionListItem label="Created by">jane@vendure.io</DescriptionListItem>
      </DescriptionList>
    </div>
  ),
};

// The compound parts are available directly when the convenience wrapper isn't
// enough — e.g. multiple detail lines under one term.
export const CompoundParts: Story = {
  render: () => (
    <DescriptionList className="max-w-md">
      <DescriptionItem>
        <DescriptionTerm>Contact</DescriptionTerm>
        <DescriptionDetail>jane@vendure.io</DescriptionDetail>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Roles</DescriptionTerm>
        <DescriptionDetail>Administrator, Fulfilment</DescriptionDetail>
      </DescriptionItem>
    </DescriptionList>
  ),
};
