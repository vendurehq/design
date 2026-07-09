import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Label } from '../src/components/atoms/label.tsx';
import { Switch } from '../src/components/atoms/switch.tsx';

const meta = {
  title: 'Atoms/Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const SmallChecked: Story = {
  args: { size: 'sm', defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

// A form field can start as null; the Switch coerces null to false so it stays
// controlled instead of warning about a controlled/uncontrolled switch.
export const ControlledFromNull: Story = {
  render: function SwitchControlledFromNull() {
    const [checked, setChecked] = useState<boolean | null>(null);
    return (
      <div className="flex items-center gap-2">
        <Switch id="notifications" checked={checked} onCheckedChange={(next) => setChecked(next)} />
        <Label htmlFor="notifications">Notifications (starts null)</Label>
      </div>
    );
  },
};
