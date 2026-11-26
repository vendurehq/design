import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
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

/** Each loading line is as tall as its loaded line, and its skeleton is about as wide as the text. */
async function expectStableLines(canvasElement: HTMLElement) {
  const rect = (selector: string) =>
    canvasElement.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
  for (const row of canvasElement.querySelectorAll<HTMLElement>('[data-row]')) {
    const name = row.dataset.row;
    const loaded = `[data-row="${name}"] [data-state="loaded"]`;
    const loading = `[data-row="${name}"] [data-state="loading"]`;
    await expect(rect(loading)?.height).toBe(rect(loaded)?.height);
    const text = rect(`${loaded} > [data-slot]`)?.width ?? 0;
    const skeleton = rect(`${loading} > [data-slot]`)?.width ?? 0;
    await expect(Math.abs(skeleton - text)).toBeLessThan(text * 0.35);
  }
}

// `undefined` means the date has not loaded yet: a one-line skeleton as wide
// as the formatted date. `null` means there is no date: the fallback.
export const LoadingAndMissing: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-sm">
      {[
        ['date', {}],
        ['date-time', { timeStyle: 'short' }],
      ].map(([name, options]) => (
        <div key={String(name)} data-row={name} className="flex flex-col gap-1">
          <p data-state="loaded">
            Created <DateTime value={SAMPLE} locale="en-US" {...(options as object)} /> by Ada.
          </p>
          <p data-state="loading">
            Created <DateTime value={undefined} locale="en-US" {...(options as object)} /> by Ada.
          </p>
        </div>
      ))}
      <p data-state="missing">
        Created <DateTime value={null} locale="en-US" /> by Ada.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectStableLines(canvasElement);
    const busy = canvasElement.querySelector('[data-state="loading"] [aria-busy="true"]');
    await expect(busy?.textContent).toBe('Loading date');
    await expect(canvasElement.querySelector('[data-state="missing"]')?.textContent).toContain('—');
  },
};
