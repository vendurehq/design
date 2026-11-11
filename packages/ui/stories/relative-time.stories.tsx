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
// ages on its own. Hover any value for the absolute time in the DS Tooltip; it
// is also the accessible description.
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

// `display="duration"` says how long a state that continues has lasted, with
// the same unit steps as the relative text. The words around it are the
// caller's. `start` turns the default tooltip into the range and how long it
// took. `tooltip` also takes content of your own.
export const DurationAndRange: Story = {
  render: () => (
    <div className="flex flex-col gap-1 tabular-nums">
      <span>
        Degraded for <RelativeTime value={minutesAgo(60 * 24 * 13)} locale="en-US" display="duration" />
      </span>
      <span>
        Ready <RelativeTime value={minutesAgo(2)} start={minutesAgo(2.7)} locale="en-US" focusable />
      </span>
      <span>
        Paused <RelativeTime value={minutesAgo(40)} locale="en-US" tooltip="Paused by the nightly job" focusable />
      </span>
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

/**
 * `focusable` makes the time a tab stop, so keyboard users can open the
 * tooltip. Opt in where the exact time matters to keyboard users, never inside
 * a link or a button.
 */
export const Focusable: Story = {
  args: { focusable: true },
};

/**
 * `tooltip={false}` renders a plain `<time>` for a time inside another tooltip
 * trigger, so the outer tooltip keeps its content. The absolute time stays the
 * accessible description.
 */
export const WithoutTooltip: Story = {
  args: { tooltip: false },
};
