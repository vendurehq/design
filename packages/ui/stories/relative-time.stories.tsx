import type { Meta, StoryObj } from '@storybook/react';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const meta = {
  title: 'Molecules/RelativeTime',
  component: RelativeTime,
  tags: ['autodocs'],
  args: {
    value: minutesAgo(3),
    locale: 'en-US',
  },
} satisfies Meta<typeof RelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

// Self-refreshes every `updateInterval` ms (default 60_000) so a long-open view
// ages on its own. Hover any value for the absolute time in the title.
export const Playground: Story = {};

export const PastAndFuture: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <RelativeTime value={minutesAgo(0.2)} locale="en-US" />
      <RelativeTime value={minutesAgo(3)} locale="en-US" />
      <RelativeTime value={minutesAgo(90)} locale="en-US" />
      <RelativeTime value={minutesAgo(60 * 26)} locale="en-US" />
      <RelativeTime value={daysFromNow(3)} locale="en-US" />
    </div>
  ),
};

// `unitStyle="narrow"` for dense tables; `numeric="always"` forces a quantified
// phrase instead of "yesterday"/"tomorrow".
export const Styles: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <RelativeTime value={minutesAgo(60 * 26)} locale="en-US" unitStyle="narrow" />
      <RelativeTime value={minutesAgo(60 * 24)} locale="en-US" numeric="always" />
    </div>
  ),
};

// Pass `updateInterval={false}` when something else already re-renders (e.g. a
// polling query) so the component stays render-driven.
export const RenderDriven: Story = {
  args: { value: minutesAgo(5), updateInterval: false },
};

// Nullish/invalid input renders the fallback (default em dash).
export const Fallback: Story = {
  render: () => <RelativeTime value={null} />,
};
