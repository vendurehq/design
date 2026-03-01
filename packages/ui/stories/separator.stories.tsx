import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../src/components/ui/separator.tsx';

const meta = {
  title: 'UI/General/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">Account Settings</h4>
        <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Notifications</h4>
        <p className="text-sm text-muted-foreground">Configure your notification settings.</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-4 text-sm">
      <span>Blog</span>
      <Separator orientation="vertical" />
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
    </div>
  ),
};
