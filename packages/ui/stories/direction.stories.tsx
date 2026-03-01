import type { Meta, StoryObj } from '@storybook/react';
import { DirectionProvider, useDirection } from '../src/components/ui/direction.tsx';

const meta = {
  title: 'UI/Layout/Direction',
  component: DirectionProvider,
  tags: ['autodocs'],
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function DirectionDisplay() {
  const direction = useDirection();
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm">
        Current direction: <strong>{direction}</strong>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        This content is rendered inside a DirectionProvider with RTL direction.
        Text alignment and layout should follow right-to-left conventions.
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="space-y-4">
        <h3 className="text-lg font-semibold">RTL Content</h3>
        <DirectionDisplay />
        <div className="flex gap-2">
          <div className="rounded-md border p-3 flex-1">
            <p className="text-sm font-medium">First Item</p>
            <p className="text-xs text-muted-foreground">Should appear on the right</p>
          </div>
          <div className="rounded-md border p-3 flex-1">
            <p className="text-sm font-medium">Second Item</p>
            <p className="text-xs text-muted-foreground">Should appear on the left</p>
          </div>
        </div>
      </div>
    </DirectionProvider>
  ),
};
