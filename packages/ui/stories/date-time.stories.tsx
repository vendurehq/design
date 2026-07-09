import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from '../src/components/molecules/date-time.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';

const SAMPLE = '2026-03-14T15:09:26.000Z';

const meta = {
  title: 'Molecules/DateTime',
  component: DateTime,
  tags: ['autodocs'],
  args: {
    value: SAMPLE,
    locale: 'en-US',
  },
} satisfies Meta<typeof DateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// One semantic `<time>`. `dateStyle` defaults to `medium`; add `timeStyle` for
// date + time.
export const Presets: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <DateTime value={SAMPLE} locale="en-US" />
      <DateTime value={SAMPLE} locale="en-US" dateStyle="full" />
      <DateTime value={SAMPLE} locale="en-US" dateStyle="medium" timeStyle="short" />
      <DateTime value={SAMPLE} locale="en-GB" dateStyle="long" timeStyle="medium" />
    </div>
  ),
};

// Locale and time zone come from `FormatProvider` when not passed explicitly.
export const WithFormatProvider: Story = {
  render: () => (
    <FormatProvider locale="de-DE" timeZone="Europe/Berlin">
      <DateTime value={SAMPLE} dateStyle="long" timeStyle="short" />
    </FormatProvider>
  ),
};

// Nullish or invalid input renders the fallback (default em dash).
export const Fallback: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <DateTime value={null} />
      <DateTime
        value="not-a-date"
        fallback={<span className="text-muted-foreground">Never</span>}
      />
    </div>
  ),
};
