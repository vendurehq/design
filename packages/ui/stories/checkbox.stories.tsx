import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: { defaultChecked: true },
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
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

// A form field can start as null; the Checkbox coerces null to false so it
// stays controlled instead of warning about a controlled/uncontrolled switch.
export const ControlledFromNull: Story = {
  render: function CheckboxControlledFromNull() {
    const [checked, setChecked] = useState<boolean | null>(null);
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id="subscribe"
          checked={checked}
          onCheckedChange={(next) => setChecked(next)}
        />
        <Label htmlFor="subscribe">Subscribe (starts null)</Label>
      </div>
    );
  },
};
