import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../src/components/atoms/toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';
import { AlignLeft, AlignCenter, AlignRight, Bold } from 'lucide-react';

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
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup variant="outline" defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToggleGroup orientation="vertical" defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup multiple defaultValue={["left", "right"]}>
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Small: Story = {
  render: () => (
    <ToggleGroup size="sm" defaultValue={["center"]}>
      <ToggleGroupItem value="left" aria-label="Align left"><AlignLeft /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center"><AlignCenter /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right"><AlignRight /></ToggleGroupItem>
    </ToggleGroup>
  ),
};

const LIFETIMES = ['30', '90', '180', '365'];

function StatesPanel({ dark }: { dark?: boolean }) {
  return (
    <div className={dark ? 'dark' : undefined}>
      <div className="bg-popover text-popover-foreground flex flex-col gap-4 rounded-lg border p-6">
        <p className="text-sm font-medium">{dark ? 'Dark' : 'Light'}, on the popover surface</p>
        {(['default', 'outline'] as const).map((variant) => (
          <div key={variant} className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">Lifetime ({variant}), 90 days pressed</span>
            <ToggleGroup variant={variant} defaultValue={['90']} aria-label={`Lifetime, ${variant}`}>
              {LIFETIMES.map((days) => (
                <ToggleGroupItem key={days} value={days}>
                  {days} days
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-4">
          {[
            { label: 'Default', props: {} },
            { label: 'Pressed', props: { defaultPressed: true } },
            { label: 'Disabled', props: { disabled: true } },
            { label: 'Disabled, pressed', props: { disabled: true, defaultPressed: true } },
          ].map(({ label, props }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Toggle variant="outline" aria-label={`Bold, ${label.toLowerCase()}`} {...props}>
                <Bold />
              </Toggle>
              <span className="text-muted-foreground text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Every state in light and dark. Hover and focus are live: hover an item, or
 * tab into a group, to see hover, pressed plus hover, and the focus ring.
 * Pinned to the light page theme so the left panel stays light.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <StatesPanel />
      <StatesPanel dark />
    </div>
  ),
};
