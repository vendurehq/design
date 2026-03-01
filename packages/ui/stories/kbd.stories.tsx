import type { Meta, StoryObj } from '@storybook/react';
import { Kbd, KbdGroup } from '../src/components/ui/kbd.tsx';

const meta = {
  title: 'UI/General/Kbd',
  component: Kbd,
  tags: ['autodocs'],
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      <span>Press</span>
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>S</Kbd>
      <span>to save</span>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between gap-8">
        <span>Save</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span>Copy</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center justify-between gap-8">
        <span>Paste</span>
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>V</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};
