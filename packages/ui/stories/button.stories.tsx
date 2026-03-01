import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/ui/button.tsx';
import { ChevronRight, Mail, Loader2 } from 'lucide-react';

const meta = {
  title: 'UI/General/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const SizeXs: Story = {
  args: { size: 'xs', children: 'Extra Small' },
};

export const SizeSm: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const SizeLg: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const Icon: Story = {
  args: { size: 'icon', variant: 'outline', children: <ChevronRight /> },
};

export const IconXs: Story = {
  args: { size: 'icon-xs', variant: 'outline', children: <ChevronRight /> },
};

export const IconSm: Story = {
  args: { size: 'icon-sm', variant: 'outline', children: <ChevronRight /> },
};

export const IconLg: Story = {
  args: { size: 'icon-lg', variant: 'outline', children: <ChevronRight /> },
};

export const WithIcon: Story = {
  args: { children: <><Mail /> Send Email</> },
};

export const Loading: Story = {
  args: { disabled: true, children: <><Loader2 className="animate-spin" /> Please wait</> },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};
